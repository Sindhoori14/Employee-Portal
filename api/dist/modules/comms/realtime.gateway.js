"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../../prisma/prisma.service");
const user_cache_service_1 = require("../../common/user-cache.service");
const access_1 = require("../../common/access");
function parseAccessCookie(header) {
    if (!header)
        return undefined;
    for (const part of header.split(';')) {
        const [k, ...rest] = part.trim().split('=');
        if (k === 'access')
            return rest.join('=');
    }
    return undefined;
}
let RealtimeGateway = class RealtimeGateway {
    prisma;
    jwt;
    users;
    server;
    online = new Map();
    offlineTimers = new Map();
    teamIdsCache = null;
    constructor(prisma, jwt, users) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.users = users;
    }
    async allTeamIds() {
        if (this.teamIdsCache && this.teamIdsCache.exp > Date.now())
            return this.teamIdsCache.ids;
        const ids = (await this.prisma.team.findMany({ select: { id: true } })).map((t) => t.id);
        this.teamIdsCache = { exp: Date.now() + 60_000, ids };
        return ids;
    }
    async handleConnection(client) {
        try {
            const token = parseAccessCookie(client.handshake.headers.cookie) ?? client.handshake.auth?.token;
            if (!token)
                return client.disconnect();
            const payload = (await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET }));
            const user = await this.users.get(payload.sub);
            if (!user || !user.isActive)
                return client.disconnect();
            client.data.user = { id: user.id, role: user.role, teamId: user.teamId };
            client.join(`user:${user.id}`);
            if (user.teamId)
                client.join(`team:${user.teamId}`);
            if (user.role === 'ADMIN')
                client.join('admins');
            if (user.role === 'ADMIN' || user.role === 'TEAM_LEAD')
                for (const id of await this.allTeamIds())
                    client.join(`team:${id}`);
            if (user.batchId)
                client.join(`batch:${user.batchId}`);
            const ledBatches = await this.prisma.batch.findMany({
                where: { OR: [{ leadId: user.id }, { coordinatorId: user.id }] }, select: { id: true },
            });
            for (const b of ledBatches)
                client.join(`batch:${b.id}`);
            const n = (this.online.get(user.id) ?? 0) + 1;
            this.online.set(user.id, n);
            const t = this.offlineTimers.get(user.id);
            if (t) {
                clearTimeout(t);
                this.offlineTimers.delete(user.id);
            }
            if (n === 1)
                this.server.emit('presence', { userId: user.id, online: true });
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const id = client.data?.user?.id;
        if (!id)
            return;
        const n = (this.online.get(id) ?? 1) - 1;
        if (n > 0)
            return void this.online.set(id, n);
        this.online.delete(id);
        this.offlineTimers.set(id, setTimeout(() => {
            this.offlineTimers.delete(id);
            if (!this.online.has(id))
                this.server.emit('presence', { userId: id, online: false });
        }, 8_000));
    }
    onlineIds() {
        return [...this.online.keys()];
    }
    onlineCount() {
        return this.online.size;
    }
    async joinTask(client, body) {
        const me = client.data.user;
        if (!me || !body?.taskId)
            return { ok: false };
        const t = await this.prisma.task.findUnique({ where: { id: body.taskId }, include: { collaborators: { select: { userId: true } } } });
        if (!t || !(0, access_1.canSeeTask)(me, t))
            return { ok: false };
        client.join(`task:${t.id}`);
        return { ok: true };
    }
    async joinChannel(client, body) {
        const me = client.data.user;
        if (!me || !body?.channelId)
            return { ok: false };
        const ch = await this.prisma.channel.findUnique({
            where: { id: body.channelId },
            select: {
                id: true, type: true, teamId: true, batchId: true, createdById: true,
                members: { select: { userId: true } },
                batch: { select: { leadId: true, coordinatorId: true } },
            },
        });
        const allowed = ch && (0, access_1.canSeeChannel)(me, {
            type: ch.type, teamId: ch.teamId, batchId: ch.batchId, createdById: ch.createdById,
            memberIds: ch.members.map((m) => m.userId),
            batchLeadId: ch.batch?.leadId ?? null, batchCoordinatorId: ch.batch?.coordinatorId ?? null,
        });
        if (!ch || !allowed)
            return { ok: false };
        for (const r of client.rooms)
            if (r.startsWith('channel:') && r !== `channel:${ch.id}`)
                client.leave(r);
        client.join(`channel:${ch.id}`);
        return { ok: true };
    }
    leaveChannel(client, body) {
        if (body?.channelId)
            client.leave(`channel:${body.channelId}`);
        return { ok: true };
    }
    typing(client, body) {
        const me = client.data.user;
        if (!me || !body?.channelId || !client.rooms.has(`channel:${body.channelId}`))
            return;
        client.to(`channel:${body.channelId}`).emit('typing', { channelId: body.channelId, userId: me.id });
    }
    emitTask(taskId, teamId, event, payload) {
        this.server.to(`task:${taskId}`).emit(event, payload);
        if (teamId)
            this.server.to(`team:${teamId}`).emit('task:changed', { taskId, event });
    }
    disconnectUser(userId) {
        this.server?.in(`user:${userId}`).disconnectSockets(true);
    }
    emitChannelMessage(ch, message, authorId) {
        this.server.to(`channel:${ch.id}`).emit('channel:message', message);
        const ping = { channelId: ch.id, authorId, at: Date.now() };
        if (ch.type === 'GROUP' || ch.type === 'DM')
            this.emitToUsers(ch.memberIds ?? [], ping);
        else if (ch.type === 'BATCH' && ch.batchId) {
            this.server.to(`batch:${ch.batchId}`).emit('channel:activity', ping);
            this.server.to('admins').emit('channel:activity', ping);
        }
        else if (ch.type === 'TEAM' && ch.teamId)
            this.server.to(`team:${ch.teamId}`).emit('channel:activity', ping);
        else
            this.server.emit('channel:activity', ping);
    }
    emitChannelDeleted(channelId, messageId) {
        this.server.to(`channel:${channelId}`).emit('channel:deleted', { channelId, messageId });
    }
    emitAttendance(teamId, userId) {
        const payload = { userId, teamId, at: Date.now() };
        this.server.to('admins').emit('attendance:changed', payload);
        if (teamId)
            this.server.to(`team:${teamId}`).emit('attendance:changed', payload);
    }
    emitToUsers(userIds, payload) {
        for (const id of new Set(userIds))
            this.server.to(`user:${id}`).emit('notify', payload);
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinTask'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "joinTask", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinChannel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "joinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveChannel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "leaveChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "typing", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','), credentials: true },
        pingInterval: 20_000,
        pingTimeout: 25_000,
        maxHttpBufferSize: 64 * 1024,
        perMessageDeflate: false,
        transports: ['websocket', 'polling'],
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService, user_cache_service_1.UserCacheService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map