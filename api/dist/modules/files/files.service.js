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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = exports.UPLOAD_ROOT = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const promises_1 = require("stream/promises");
const prisma_service_1 = require("../../prisma/prisma.service");
const user_cache_service_1 = require("../../common/user-cache.service");
const access_1 = require("../../common/access");
const file_links_service_1 = require("../../common/file-links.service");
const audit_service_1 = require("../audit/audit.service");
const realtime_gateway_1 = require("../comms/realtime.gateway");
const notifications_service_1 = require("../comms/notifications.service");
const file_types_1 = require("./file-types");
exports.UPLOAD_ROOT = (0, path_1.resolve)(process.env.UPLOAD_DIR ?? (0, path_1.join)(process.cwd(), 'uploads'));
const MAX_BYTES = Math.max(1, Number(process.env.MAX_UPLOAD_MB ?? 100)) * 1024 * 1024;
const AVATAR_MAX = 1.5 * 1024 * 1024;
const MIN_FREE_BYTES = 300 * 1024 * 1024;
const ACCEL = process.env.ACCEL_REDIRECT === 'true';
const DAY = 86_400_000;
const CONTEXTS = ['TASK', 'COMMENT', 'CHANNEL', 'REPORT', 'ANNOUNCEMENT'];
let FilesService = class FilesService {
    prisma;
    audit;
    cache;
    gateway;
    notifications;
    log = new common_1.Logger('Files');
    avatarCache = null;
    constructor(prisma, audit, cache, gateway, notifications) {
        this.prisma = prisma;
        this.audit = audit;
        this.cache = cache;
        this.gateway = gateway;
        this.notifications = notifications;
        void fs_1.promises.mkdir((0, path_1.join)(exports.UPLOAD_ROOT, 'tmp'), { recursive: true }).catch((e) => this.log.error(`cannot create ${exports.UPLOAD_ROOT}: ${e.message}`));
    }
    async receive(req, maxBytes) {
        const declared = Number(req.headers['content-length'] ?? 0);
        if (declared > maxBytes)
            throw new common_1.PayloadTooLargeException(`File is too large (max ${Math.round(maxBytes / 1048576)} MB)`);
        try {
            const st = await fs_1.promises.statfs(exports.UPLOAD_ROOT);
            if (st.bavail * st.bsize < MIN_FREE_BYTES)
                throw new common_1.ServiceUnavailableException('Server storage is almost full. Please tell your admin.');
        }
        catch (e) {
            if (e instanceof common_1.ServiceUnavailableException)
                throw e;
        }
        await fs_1.promises.mkdir((0, path_1.join)(exports.UPLOAD_ROOT, 'tmp'), { recursive: true });
        const tmp = (0, path_1.join)(exports.UPLOAD_ROOT, 'tmp', (0, crypto_1.randomUUID)());
        const hash = (0, crypto_1.createHash)('sha256');
        let size = 0;
        let head = Buffer.alloc(0);
        const meter = new stream_1.Transform({
            transform(chunk, _enc, cb) {
                size += chunk.length;
                if (size > maxBytes)
                    return cb(new common_1.PayloadTooLargeException(`File is too large (max ${Math.round(maxBytes / 1048576)} MB)`));
                if (head.length < 64)
                    head = Buffer.concat([head, chunk.slice(0, 64 - head.length)]);
                hash.update(chunk);
                cb(null, chunk);
            },
        });
        try {
            await (0, promises_1.pipeline)(req, meter, (0, fs_1.createWriteStream)(tmp, { flags: 'wx', mode: 0o640 }));
        }
        catch (e) {
            await fs_1.promises.unlink(tmp).catch(() => { });
            if (e instanceof common_1.PayloadTooLargeException)
                throw e;
            throw new common_1.BadRequestException('Upload was interrupted. Please try again.');
        }
        if (size === 0) {
            await fs_1.promises.unlink(tmp).catch(() => { });
            throw new common_1.BadRequestException('The file is empty');
        }
        return { tmp, size, head, sha256: hash.digest('hex') };
    }
    async commit(tmp) {
        const now = new Date();
        const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${(0, crypto_1.randomUUID)()}`;
        const dest = (0, path_1.join)(exports.UPLOAD_ROOT, key);
        await fs_1.promises.mkdir((0, path_1.join)(exports.UPLOAD_ROOT, key, '..'), { recursive: true });
        await fs_1.promises.rename(tmp, dest);
        return key;
    }
    async upload(me, req, q) {
        const context = String(q.context ?? '');
        if (!CONTEXTS.includes(context))
            throw new common_1.BadRequestException('Unknown upload context');
        const scopeId = q.scopeId ? String(q.scopeId) : null;
        await this.assertCanUploadTo(me, context, scopeId);
        const name = (0, file_types_1.cleanFileName)(q.name);
        const got = await this.receive(req, MAX_BYTES);
        const mime = (0, file_types_1.decideMime)(got.head, name);
        const dim = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 && n < 20000 ? n : null; };
        const isImg = mime.startsWith('image/');
        const key = await this.commit(got.tmp);
        const row = await this.prisma.fileAsset.create({
            data: {
                uploaderId: me.id, context, scopeId, name, mime, size: got.size, sha256: got.sha256, storageKey: key,
                width: isImg ? dim(q.w) : null, height: isImg ? dim(q.h) : null,
                ...(context === 'TASK' && scopeId ? { taskId: scopeId } : {}),
            },
            select: file_links_service_1.FILE_SELECT,
        });
        if (context === 'TASK' && scopeId) {
            await this.audit.log({ actorId: me.id, action: 'FILE_ATTACH', entity: 'task', entityId: scopeId, metadata: { file: name, size: got.size }, ip: req.ip });
        }
        return row;
    }
    async assertCanUploadTo(me, context, scopeId) {
        if (context === 'TASK' || context === 'COMMENT') {
            if (!scopeId)
                throw new common_1.BadRequestException('scopeId (task id) is required');
            const t = await this.prisma.task.findUnique({ where: { id: scopeId }, include: { collaborators: { select: { userId: true } } } });
            if (!t)
                throw new common_1.NotFoundException('Task not found');
            if (!(0, access_1.canSeeTask)(me, t))
                throw new common_1.ForbiddenException('Forbidden');
        }
        else if (context === 'CHANNEL') {
            if (!scopeId)
                throw new common_1.BadRequestException('scopeId (channel id) is required');
            const ch = await this.prisma.channel.findUnique({
                where: { id: scopeId },
                select: {
                    type: true, teamId: true, batchId: true, createdById: true,
                    members: { select: { userId: true } },
                    batch: { select: { leadId: true, coordinatorId: true } },
                },
            });
            if (!ch)
                throw new common_1.NotFoundException('Channel not found');
            if (!(0, access_1.canSeeChannel)(me, {
                type: ch.type, teamId: ch.teamId, batchId: ch.batchId, createdById: ch.createdById,
                memberIds: ch.members.map((m) => m.userId),
                batchLeadId: ch.batch?.leadId ?? null, batchCoordinatorId: ch.batch?.coordinatorId ?? null,
            }))
                throw new common_1.ForbiddenException('Forbidden');
        }
        else if (context === 'ANNOUNCEMENT') {
            if (me.role !== 'ADMIN' && me.role !== 'TEAM_LEAD')
                throw new common_1.ForbiddenException('Forbidden');
        }
    }
    async setAvatar(me, req) {
        const got = await this.receive(req, AVATAR_MAX);
        const mime = (0, file_types_1.decideMime)(got.head, 'avatar.jpg');
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
            await fs_1.promises.unlink(got.tmp).catch(() => { });
            throw new common_1.BadRequestException('Profile photo must be a JPEG, PNG or WebP image');
        }
        const key = await this.commit(got.tmp);
        const asset = await this.prisma.fileAsset.create({
            data: { uploaderId: me.id, context: 'AVATAR', name: 'avatar', mime, size: got.size, sha256: got.sha256, storageKey: key, width: 384, height: 384 },
            select: file_links_service_1.FILE_SELECT,
        });
        const prev = await this.prisma.user.findUnique({ where: { id: me.id }, select: { avatarFileId: true } });
        await this.prisma.user.update({ where: { id: me.id }, data: { avatarFileId: asset.id } });
        if (prev?.avatarFileId)
            await this.prisma.fileAsset.updateMany({ where: { id: prev.avatarFileId }, data: { deletedAt: new Date() } });
        this.afterAvatarChange(me.id);
        await this.audit.log({ actorId: me.id, action: 'AVATAR_SET', entity: 'user', entityId: me.id, ip: req.ip });
        return { avatarFileId: asset.id };
    }
    async removeAvatar(actor, userId, ip) {
        const target = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, teamId: true, avatarFileId: true, role: true } });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        const allowed = actor.id === userId || actor.role === 'ADMIN' || (actor.role === 'TEAM_LEAD' && !!actor.teamId && actor.teamId === target.teamId);
        if (!allowed)
            throw new common_1.ForbiddenException('Forbidden');
        if (target.avatarFileId)
            await this.prisma.fileAsset.updateMany({ where: { id: target.avatarFileId }, data: { deletedAt: new Date() } });
        await this.prisma.user.update({ where: { id: userId }, data: { avatarFileId: null } });
        this.afterAvatarChange(userId);
        if (actor.id !== userId) {
            await this.notifications.notify([userId], { type: 'SYSTEM', title: 'Please upload a new profile photo', body: `${actor.displayName} removed your photo. Choose a clear photo of your face.`, link: '/profile' });
        }
        await this.audit.log({ actorId: actor.id, action: 'AVATAR_REMOVE', entity: 'user', entityId: userId, ip });
        return { ok: true };
    }
    afterAvatarChange(userId) {
        this.avatarCache = null;
        this.cache.invalidate(userId);
        this.gateway.server?.emit('avatar:changed', { userId });
    }
    async avatarMap() {
        if (this.avatarCache && this.avatarCache.exp > Date.now())
            return this.avatarCache.map;
        const rows = await this.prisma.user.findMany({ where: { avatarFileId: { not: null } }, select: { id: true, avatarFileId: true } });
        const map = {};
        for (const r of rows)
            map[r.id] = r.avatarFileId;
        this.avatarCache = { exp: Date.now() + 30_000, map };
        return map;
    }
    async serveAvatar(userId, v, res) {
        const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { avatarFileId: true } });
        if (!u?.avatarFileId)
            throw new common_1.NotFoundException('No photo');
        const f = await this.prisma.fileAsset.findFirst({ where: { id: u.avatarFileId, deletedAt: null } });
        if (!f)
            throw new common_1.NotFoundException('No photo');
        const immutable = v === f.id;
        this.send(res, f, false, immutable ? 'private, max-age=31536000, immutable' : 'private, max-age=300');
    }
    async canAccess(me, f) {
        if (f.context === 'AVATAR')
            return true;
        if (f.uploaderId === me.id)
            return true;
        if (me.role === 'ADMIN' && !(f.context === 'CHANNEL' && f.messageId))
            return true;
        if (f.taskId || f.commentId) {
            const taskId = f.taskId ?? (await this.prisma.taskComment.findUnique({ where: { id: f.commentId }, select: { taskId: true } }))?.taskId;
            if (!taskId)
                return false;
            const t = await this.prisma.task.findUnique({ where: { id: taskId }, include: { collaborators: { select: { userId: true } } } });
            return !!t && (0, access_1.canSeeTask)(me, t);
        }
        if (f.messageId) {
            const m = await this.prisma.channelMessage.findUnique({
                where: { id: f.messageId },
                select: {
                    channel: {
                        select: {
                            type: true, teamId: true, batchId: true, createdById: true,
                            members: { select: { userId: true } },
                            batch: { select: { leadId: true, coordinatorId: true } },
                        },
                    },
                },
            });
            if (!m)
                return false;
            const ch = m.channel;
            return (0, access_1.canSeeChannel)(me, {
                type: ch.type, teamId: ch.teamId, batchId: ch.batchId, createdById: ch.createdById,
                memberIds: ch.members.map((x) => x.userId),
                batchLeadId: ch.batch?.leadId ?? null, batchCoordinatorId: ch.batch?.coordinatorId ?? null,
            });
        }
        if (f.reportId) {
            const r = await this.prisma.dailyReport.findUnique({ where: { id: f.reportId }, select: { userId: true, teamId: true } });
            if (!r)
                return false;
            return r.userId === me.id || me.role === 'TEAM_LEAD' || (me.role === 'COORDINATOR' && !!me.teamId && me.teamId === r.teamId);
        }
        if (f.announcementId) {
            const a = await this.prisma.announcement.findUnique({ where: { id: f.announcementId }, select: { scope: true, teamId: true, batchId: true } });
            if (!a)
                return false;
            if (a.scope === 'COMPANY')
                return true;
            if (me.role === 'TEAM_LEAD')
                return true;
            const u = await this.cache.get(me.id);
            return a.scope === 'TEAM' ? u?.teamId === a.teamId : u?.batchId === a.batchId;
        }
        return false;
    }
    async serve(me, id, inline, res) {
        const f = await this.prisma.fileAsset.findUnique({ where: { id } });
        if (!f || f.deletedAt)
            throw new common_1.NotFoundException('File not found');
        if (!(await this.canAccess(me, f)))
            throw new common_1.ForbiddenException('Forbidden');
        this.send(res, f, inline, 'private, max-age=3600');
    }
    send(res, f, wantInline, cache) {
        const inline = wantInline && file_types_1.INLINE_OK.has(f.mime);
        res.setHeader('Content-Type', f.mime);
        res.setHeader('Content-Disposition', (0, file_types_1.contentDisposition)(inline ? 'inline' : 'attachment', f.name));
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "sandbox; default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'");
        res.setHeader('Cache-Control', cache);
        res.setHeader('ETag', `"${f.id}"`);
        if (ACCEL) {
            res.setHeader('X-Accel-Redirect', `/_protected/${f.storageKey}`);
            return res.end();
        }
        const abs = (0, path_1.resolve)(exports.UPLOAD_ROOT, f.storageKey);
        if (!abs.startsWith(exports.UPLOAD_ROOT + path_1.sep))
            throw new common_1.ForbiddenException('Forbidden');
        res.sendFile(abs, { dotfiles: 'deny', acceptRanges: true, cacheControl: false, lastModified: false, etag: false }, (err) => {
            if (err && !res.headersSent)
                res.status(404).json({ statusCode: 404, message: 'File missing on server' });
        });
    }
    async remove(me, id, ip) {
        const f = await this.prisma.fileAsset.findUnique({ where: { id } });
        if (!f || f.deletedAt)
            throw new common_1.NotFoundException('File not found');
        let allowed = f.uploaderId === me.id || me.role === 'ADMIN';
        if (!allowed && me.role === 'TEAM_LEAD' && me.teamId) {
            const taskId = f.taskId ?? (f.commentId ? (await this.prisma.taskComment.findUnique({ where: { id: f.commentId }, select: { taskId: true } }))?.taskId : null);
            if (taskId)
                allowed = (await this.prisma.task.findUnique({ where: { id: taskId }, select: { teamId: true } }))?.teamId === me.teamId;
        }
        if (!allowed)
            throw new common_1.ForbiddenException('Only the uploader or an admin can delete this file');
        await this.prisma.fileAsset.update({ where: { id }, data: { deletedAt: new Date() } });
        await this.audit.log({ actorId: me.id, action: 'FILE_DELETE', entity: 'file', entityId: id, metadata: { name: f.name }, ip });
        return { ok: true };
    }
    async sweep() {
        const now = Date.now();
        const abandoned = await this.prisma.fileAsset.updateMany({
            where: {
                deletedAt: null, context: { not: 'AVATAR' }, createdAt: { lt: new Date(now - DAY) },
                taskId: null, commentId: null, messageId: null, reportId: null, announcementId: null,
            },
            data: { deletedAt: new Date() },
        });
        const old = await this.prisma.fileAsset.findMany({ where: { deletedAt: { lt: new Date(now - 7 * DAY) } }, select: { id: true, storageKey: true }, take: 500 });
        for (const f of old)
            await fs_1.promises.unlink((0, path_1.resolve)(exports.UPLOAD_ROOT, f.storageKey)).catch(() => { });
        if (old.length)
            await this.prisma.fileAsset.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
        let tmpRemoved = 0;
        try {
            for (const n of await fs_1.promises.readdir((0, path_1.join)(exports.UPLOAD_ROOT, 'tmp'))) {
                const p = (0, path_1.join)(exports.UPLOAD_ROOT, 'tmp', n);
                const st = await fs_1.promises.stat(p);
                if (now - st.mtimeMs > 6 * 3600_000) {
                    await fs_1.promises.unlink(p).catch(() => { });
                    tmpRemoved++;
                }
            }
        }
        catch { }
        return { abandoned: abandoned.count, purged: old.length, tmpRemoved };
    }
    async stats() {
        const agg = await this.prisma.fileAsset.aggregate({ where: { deletedAt: null }, _count: true, _sum: { size: true } });
        let freeMb = null;
        try {
            const st = await fs_1.promises.statfs(exports.UPLOAD_ROOT);
            freeMb = Math.round((st.bavail * st.bsize) / 1048576);
        }
        catch { }
        return { files: agg._count, usedMb: Math.round((agg._sum.size ?? 0) / 1048576), diskFreeMb: freeMb };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        user_cache_service_1.UserCacheService,
        realtime_gateway_1.RealtimeGateway,
        notifications_service_1.NotificationsService])
], FilesService);
//# sourceMappingURL=files.service.js.map