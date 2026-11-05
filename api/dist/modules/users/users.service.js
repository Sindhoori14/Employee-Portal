"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
exports.tempPassword = tempPassword;
const common_1 = require("@nestjs/common");
const argon2 = __importStar(require("argon2"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const user_cache_service_1 = require("../../common/user-cache.service");
const realtime_gateway_1 = require("../comms/realtime.gateway");
function pageOf(page, limit) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    return { p, l, skip: (p - 1) * l, take: l };
}
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
function tempPassword(len = 10) {
    for (;;) {
        let out = '';
        for (let i = 0; i < len; i++)
            out += ALPHABET[crypto.randomInt(ALPHABET.length)];
        if (/[A-Za-z]/.test(out) && /\d/.test(out))
            return out;
    }
}
const LEAD_MANAGED_ROLES = ['COORDINATOR', 'EMPLOYEE'];
let UsersService = class UsersService {
    prisma;
    audit;
    cache;
    gateway;
    constructor(prisma, audit, cache, gateway) {
        this.prisma = prisma;
        this.audit = audit;
        this.cache = cache;
        this.gateway = gateway;
    }
    async list(me, q) {
        const { p, l, skip, take } = pageOf(q.page, q.limit);
        if (me.role === 'EMPLOYEE') {
            const self = await this.prisma.user.findUnique({ where: { id: me.id } });
            return { data: [this.safe(self)], meta: { total: 1, page: 1, limit: l, totalPages: 1 } };
        }
        const where = {};
        if (q.teamId)
            where.teamId = q.teamId;
        if (q.batchId)
            where.batchId = q.batchId;
        if (q.role)
            where.role = q.role;
        if (q.active === 'true')
            where.isActive = true;
        if (q.active === 'false')
            where.isActive = false;
        if (q.search?.trim()) {
            const s = q.search.trim();
            where.OR = [{ displayName: { contains: s, mode: 'insensitive' } }, { email: { contains: s, mode: 'insensitive' } }];
        }
        if (me.role === 'COORDINATOR')
            where.teamId = me.teamId ?? '__none__';
        const [total, rows] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where, skip, take, orderBy: [{ isActive: 'desc' }, { displayName: 'asc' }],
                include: {
                    team: { select: { id: true, name: true } },
                    batch: { select: { id: true, name: true } },
                    ledTeams: { select: { id: true, name: true } },
                    coordinatedTeams: { select: { id: true, name: true } },
                },
            }),
        ]);
        return { data: rows.map((r) => this.safe(r)), meta: { total, page: p, limit: l, totalPages: Math.max(1, Math.ceil(total / l)) } };
    }
    async get(me, id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                team: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
                ledTeams: { select: { id: true, name: true } },
                coordinatedTeams: { select: { id: true, name: true } },
                _count: {
                    select: {
                        ownedTasks: true,
                        dailyReports: true,
                        attendanceDays: true,
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (me.role === 'EMPLOYEE' && me.id !== id)
            throw new common_1.ForbiddenException('Forbidden');
        if (me.role === 'COORDINATOR' && user.id !== me.id && (!me.teamId || user.teamId !== me.teamId))
            throw new common_1.ForbiddenException('Forbidden');
        return this.safe(user);
    }
    assertCanManage(me, target) {
        if (me.role === 'ADMIN')
            return;
        if (me.role !== 'TEAM_LEAD')
            throw new common_1.ForbiddenException('Forbidden');
        if (!me.teamId)
            throw new common_1.ForbiddenException('You are not assigned to a team yet. Ask an admin.');
        if (!LEAD_MANAGED_ROLES.includes(target.role))
            throw new common_1.ForbiddenException('Leads cannot manage admins or other leads');
        if (target.teamId && target.teamId !== me.teamId)
            throw new common_1.ForbiddenException('That person belongs to another team');
    }
    async resolveRefs(teamId, batchId) {
        if (teamId) {
            const t = await this.prisma.team.findUnique({ where: { id: teamId }, select: { id: true } });
            if (!t)
                throw new common_1.BadRequestException('Invalid teamId');
        }
        if (batchId) {
            const b = await this.prisma.batch.findUnique({ where: { id: batchId }, select: { id: true } });
            if (!b)
                throw new common_1.BadRequestException('Invalid batchId');
        }
    }
    async create(me, dto, ip) {
        if (me.role === 'TEAM_LEAD') {
            if (!me.teamId)
                throw new common_1.ForbiddenException('You are not assigned to a team yet. Ask an admin.');
            if (!LEAD_MANAGED_ROLES.includes(dto.role))
                throw new common_1.ForbiddenException('Leads can create coordinators and employees only');
            if (dto.teamId && dto.teamId !== me.teamId)
                throw new common_1.ForbiddenException('Leads can add people to their own team only');
            dto.teamId = me.teamId;
        }
        else if (dto.role === 'ADMIN' && me.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admin can create admins');
        }
        await this.resolveRefs(dto.teamId, dto.batchId);
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } });
        if (exists)
            throw new common_1.BadRequestException('Email already in use');
        const generated = !dto.password;
        const password = dto.password ?? tempPassword();
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: await argon2.hash(password),
                displayName: dto.displayName,
                role: dto.role,
                teamId: dto.teamId ?? null,
                batchId: dto.batchId ?? null,
                mustChangePassword: true,
            },
        });
        if (me.role === 'ADMIN' && dto.teamId) {
            if (dto.role === 'TEAM_LEAD' && dto.assignAsLead) {
                await this.prisma.team.update({ where: { id: dto.teamId }, data: { leadId: user.id } });
            }
            if (dto.role === 'COORDINATOR' && dto.assignAsCoordinator) {
                await this.prisma.team.update({ where: { id: dto.teamId }, data: { coordinatorId: user.id } });
            }
        }
        await this.audit.log({ actorId: me.id, action: 'USER_CREATE', entity: 'user', entityId: user.id, metadata: { email: user.email, role: user.role }, ip });
        return { ...this.safe(user), ...(generated ? { tempPassword: password } : {}) };
    }
    async update(me, id, dto, ip) {
        const target = await this.prisma.user.findUnique({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        this.assertCanManage(me, target);
        if (dto.role === 'ADMIN' && me.role !== 'ADMIN')
            throw new common_1.ForbiddenException('Only admin can grant admin');
        if (me.role === 'TEAM_LEAD') {
            if (dto.role !== undefined && !LEAD_MANAGED_ROLES.includes(dto.role))
                throw new common_1.ForbiddenException('Leads can assign coordinator or employee only');
            if (dto.teamId !== undefined && dto.teamId !== null && dto.teamId !== me.teamId)
                throw new common_1.ForbiddenException('Leads can only use their own team');
        }
        if (target.id === me.id && dto.role !== undefined && dto.role !== target.role)
            throw new common_1.BadRequestException('You cannot change your own role');
        await this.resolveRefs(dto.teamId ?? undefined, dto.batchId ?? undefined);
        const data = {};
        if (dto.displayName !== undefined)
            data.displayName = dto.displayName;
        if (dto.role !== undefined)
            data.role = dto.role;
        if (dto.teamId !== undefined)
            data.teamId = dto.teamId;
        if (dto.batchId !== undefined)
            data.batchId = dto.batchId;
        if (dto.isActive !== undefined) {
            if (target.id === me.id && dto.isActive === false)
                throw new common_1.BadRequestException('Cannot deactivate yourself');
            data.isActive = dto.isActive;
            data.deactivatedAt = dto.isActive ? null : new Date();
        }
        if (dto.mustChangePassword !== undefined)
            data.mustChangePassword = dto.mustChangePassword;
        if (me.role === 'ADMIN') {
            const finalTeamId = dto.teamId !== undefined ? dto.teamId : target.teamId;
            const finalRole = dto.role !== undefined ? dto.role : target.role;
            if (dto.teamId !== undefined && dto.teamId !== target.teamId) {
                await this.prisma.team.updateMany({ where: { leadId: id, id: { not: dto.teamId ?? undefined } }, data: { leadId: null } });
                await this.prisma.team.updateMany({ where: { coordinatorId: id, id: { not: dto.teamId ?? undefined } }, data: { coordinatorId: null } });
            }
            if (dto.role !== undefined && dto.role !== 'TEAM_LEAD') {
                await this.prisma.team.updateMany({ where: { leadId: id }, data: { leadId: null } });
            }
            if (dto.role !== undefined && dto.role !== 'COORDINATOR') {
                await this.prisma.team.updateMany({ where: { coordinatorId: id }, data: { coordinatorId: null } });
            }
            if (dto.isActive === false) {
                await this.prisma.team.updateMany({ where: { leadId: id }, data: { leadId: null } });
                await this.prisma.team.updateMany({ where: { coordinatorId: id }, data: { coordinatorId: null } });
            }
            if (finalTeamId) {
                if (dto.assignAsLead === true && finalRole === 'TEAM_LEAD') {
                    await this.prisma.team.update({ where: { id: finalTeamId }, data: { leadId: id } });
                }
                else if (dto.assignAsLead === false) {
                    await this.prisma.team.updateMany({ where: { id: finalTeamId, leadId: id }, data: { leadId: null } });
                }
                if (dto.assignAsCoordinator === true && finalRole === 'COORDINATOR') {
                    await this.prisma.team.update({ where: { id: finalTeamId }, data: { coordinatorId: id } });
                }
                else if (dto.assignAsCoordinator === false) {
                    await this.prisma.team.updateMany({ where: { id: finalTeamId, coordinatorId: id }, data: { coordinatorId: null } });
                }
            }
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data,
            include: {
                team: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
                ledTeams: { select: { id: true, name: true } },
                coordinatedTeams: { select: { id: true, name: true } },
            },
        });
        await this.afterAccessChange(id, dto.isActive === false || dto.role !== undefined || dto.teamId !== undefined);
        await this.audit.log({ actorId: me.id, action: dto.isActive === false ? 'USER_DEACTIVATE' : 'USER_UPDATE', entity: 'user', entityId: id, metadata: dto, ip });
        return this.safe(updated);
    }
    async resetPassword(me, id, ip) {
        const target = await this.prisma.user.findUnique({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        this.assertCanManage(me, target);
        const password = tempPassword();
        await this.prisma.user.update({ where: { id }, data: { passwordHash: await argon2.hash(password), mustChangePassword: true } });
        await this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
        await this.afterAccessChange(id, true);
        await this.audit.log({ actorId: me.id, action: 'PASSWORD_RESET_BY_ADMIN', entity: 'user', entityId: id, ip });
        return { email: target.email, displayName: target.displayName, tempPassword: password };
    }
    async bulkCreate(me, dto, ip) {
        if (!dto.rows.length)
            throw new common_1.BadRequestException('No rows');
        const [teams, batches] = await Promise.all([
            this.prisma.team.findMany({ select: { id: true, name: true } }),
            this.prisma.batch.findMany({ select: { id: true, name: true } }),
        ]);
        const teamBy = new Map(teams.map((t) => [t.name.trim().toLowerCase(), t.id]));
        const batchBy = new Map(batches.map((b) => [b.name.trim().toLowerCase(), b.id]));
        const existing = new Set((await this.prisma.user.findMany({ where: { email: { in: dto.rows.map((r) => r.email) } }, select: { email: true } })).map((u) => u.email));
        const created = [];
        const skipped = [];
        const seen = new Set();
        const todo = [];
        for (const row of dto.rows) {
            if (seen.has(row.email)) {
                skipped.push({ email: row.email, reason: 'Duplicate in this list' });
                continue;
            }
            seen.add(row.email);
            if (existing.has(row.email)) {
                skipped.push({ email: row.email, reason: 'Email already exists' });
                continue;
            }
            const role = row.role ?? 'EMPLOYEE';
            if (me.role === 'TEAM_LEAD' && !LEAD_MANAGED_ROLES.includes(role)) {
                skipped.push({ email: row.email, reason: 'Leads can create coordinators/employees only' });
                continue;
            }
            let teamId = row.team ? teamBy.get(row.team.trim().toLowerCase()) ?? null : null;
            if (row.team && !teamId) {
                skipped.push({ email: row.email, reason: `Unknown team "${row.team}"` });
                continue;
            }
            if (me.role === 'TEAM_LEAD') {
                if (!me.teamId) {
                    skipped.push({ email: row.email, reason: 'You have no team' });
                    continue;
                }
                if (teamId && teamId !== me.teamId) {
                    skipped.push({ email: row.email, reason: 'Other team' });
                    continue;
                }
                teamId = me.teamId;
            }
            const batchId = row.batch ? batchBy.get(row.batch.trim().toLowerCase()) ?? null : null;
            if (row.batch && !batchId) {
                skipped.push({ email: row.email, reason: `Unknown batch "${row.batch}"` });
                continue;
            }
            todo.push({ row, role, teamId, batchId });
        }
        for (let i = 0; i < todo.length; i += 6) {
            await Promise.all(todo.slice(i, i + 6).map(async ({ row, role, teamId, batchId }) => {
                const pw = tempPassword();
                try {
                    await this.prisma.user.create({
                        data: { email: row.email, displayName: row.displayName, role, teamId, batchId, passwordHash: await argon2.hash(pw), mustChangePassword: true },
                    });
                    created.push({
                        email: row.email, displayName: row.displayName, role,
                        team: teams.find((t) => t.id === teamId)?.name ?? null,
                        batch: batches.find((b) => b.id === batchId)?.name ?? null,
                        tempPassword: pw,
                    });
                }
                catch {
                    skipped.push({ email: row.email, reason: 'Could not create' });
                }
            }));
        }
        await this.audit.log({ actorId: me.id, action: 'USER_BULK_CREATE', entity: 'user', metadata: { created: created.length, skipped: skipped.length }, ip });
        return { created, skipped };
    }
    async afterAccessChange(userId, kickSockets) {
        this.cache.invalidate(userId);
        if (kickSockets)
            this.gateway.disconnectUser(userId);
    }
    safe(u) {
        if (!u)
            return u;
        const { passwordHash: _p, ...rest } = u;
        return rest;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        user_cache_service_1.UserCacheService,
        realtime_gateway_1.RealtimeGateway])
], UsersService);
//# sourceMappingURL=users.service.js.map