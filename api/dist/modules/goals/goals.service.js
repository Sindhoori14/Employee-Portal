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
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let GoalsService = class GoalsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    canAccess(me, goal) {
        if (me.role === 'ADMIN')
            return true;
        if (goal.ownerId === me.id || goal.createdById === me.id)
            return true;
        if (me.teamId && goal.teamId === me.teamId)
            return true;
        return false;
    }
    async list(me, filters) {
        const where = {};
        if (filters?.type)
            where.type = filters.type;
        if (filters?.status)
            where.status = filters.status;
        if (me.role === 'ADMIN') {
            if (filters?.teamId)
                where.teamId = filters.teamId;
            if (filters?.ownerId)
                where.ownerId = filters.ownerId;
        }
        else if (me.role === 'TEAM_LEAD') {
            const myTeam = me.teamId;
            where.OR = [
                { ownerId: me.id },
                { createdById: me.id },
                ...(myTeam ? [{ teamId: myTeam }] : []),
            ];
            if (filters?.ownerId)
                where.ownerId = filters.ownerId;
        }
        else if (me.role === 'COORDINATOR') {
            const myTeam = me.teamId ?? '__none__';
            where.OR = [{ teamId: myTeam }, { ownerId: me.id }];
        }
        else {
            const myTeam = me.teamId;
            where.OR = [
                { ownerId: me.id },
                ...(myTeam ? [{ teamId: myTeam, ownerId: null }] : []),
            ];
        }
        return this.prisma.goal.findMany({
            where,
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            take: 200,
            include: {
                owner: { select: { id: true, displayName: true, email: true, role: true } },
                team: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
                createdBy: { select: { id: true, displayName: true } },
                _count: { select: { tasks: true } },
            },
        });
    }
    async get(me, id) {
        const g = await this.prisma.goal.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, displayName: true, email: true, role: true } },
                team: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
                createdBy: { select: { id: true, displayName: true } },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                        dueDate: true,
                        owner: { select: { id: true, displayName: true } },
                    },
                },
            },
        });
        if (!g)
            throw new common_1.NotFoundException('Goal not found');
        if (!this.canAccess(me, g))
            throw new common_1.ForbiddenException('Forbidden');
        return g;
    }
    async create(me, dto, ip) {
        if (!['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role)) {
            throw new common_1.ForbiddenException('Only admins, team leads, and coordinators can create goals');
        }
        let targetTeamId = dto.teamId ?? me.teamId ?? null;
        let targetOwnerId = null;
        if (dto.ownerId) {
            const targetUser = await this.prisma.user.findUnique({
                where: { id: dto.ownerId },
                select: { id: true, isActive: true, teamId: true },
            });
            if (!targetUser || !targetUser.isActive) {
                throw new common_1.BadRequestException('Invalid goal assignee');
            }
            if (me.role === 'TEAM_LEAD' && targetUser.teamId !== me.teamId) {
                throw new common_1.ForbiddenException('Team Leads can assign goals only to members of their own team');
            }
            targetOwnerId = targetUser.id;
            if (!targetTeamId)
                targetTeamId = targetUser.teamId;
        }
        else {
            if (!targetTeamId) {
                throw new common_1.BadRequestException('Team is required when assigning a team goal');
            }
            if (me.role === 'TEAM_LEAD' && targetTeamId !== me.teamId) {
                throw new common_1.ForbiddenException('Team Leads can assign goals within their authorized team only');
            }
        }
        if (me.role === 'COORDINATOR' && (!me.teamId || targetTeamId !== me.teamId)) {
            throw new common_1.ForbiddenException('Coordinators can create goals within their coordinated team only');
        }
        const g = await this.prisma.goal.create({
            data: {
                title: dto.title.trim(),
                description: dto.description?.trim() ?? null,
                type: (dto.type ?? 'WEEKLY'),
                teamId: targetTeamId,
                batchId: dto.batchId ?? null,
                ownerId: targetOwnerId,
                progress: dto.progress ?? 0,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                createdById: me.id,
            },
            include: {
                owner: { select: { id: true, displayName: true } },
                team: { select: { id: true, name: true } },
            },
        });
        await this.audit.log({
            actorId: me.id,
            action: 'GOAL_CREATE',
            entity: 'goal',
            entityId: g.id,
            metadata: { title: g.title, type: g.type, ownerId: targetOwnerId, teamId: targetTeamId },
            ip,
        });
        return g;
    }
    async update(me, id, dto, ip) {
        const g = await this.prisma.goal.findUnique({ where: { id } });
        if (!g)
            throw new common_1.NotFoundException('Goal not found');
        if (!['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role)) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        if (me.role === 'TEAM_LEAD' && (!me.teamId || g.teamId !== me.teamId)) {
            throw new common_1.ForbiddenException('Team Leads can update goals within their authorized team only');
        }
        if (me.role === 'COORDINATOR' && (!me.teamId || g.teamId !== me.teamId)) {
            throw new common_1.ForbiddenException('Coordinators can update goals within their coordinated team only');
        }
        let progress = dto.progress !== undefined ? dto.progress : g.progress;
        let status = dto.status ?? g.status;
        if (progress === 100 && status === 'ACTIVE') {
            status = 'DONE';
        }
        else if (progress < 100 && status === 'DONE' && dto.status === undefined) {
            status = 'ACTIVE';
        }
        const updated = await this.prisma.goal.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
                ...(dto.description !== undefined ? { description: dto.description?.trim() ?? null } : {}),
                ...(dto.type !== undefined ? { type: dto.type } : {}),
                ...(dto.status !== undefined || progress !== g.progress ? { status: status } : {}),
                ...(dto.ownerId !== undefined ? { ownerId: dto.ownerId } : {}),
                ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
                ...(dto.progress !== undefined ? { progress: dto.progress } : {}),
                ...(dto.startDate !== undefined ? { startDate: dto.startDate ? new Date(dto.startDate) : null } : {}),
                ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
            },
            include: {
                owner: { select: { id: true, displayName: true } },
                team: { select: { id: true, name: true } },
            },
        });
        await this.audit.log({
            actorId: me.id,
            action: 'GOAL_UPDATE',
            entity: 'goal',
            entityId: id,
            metadata: dto,
            ip,
        });
        return updated;
    }
    async updateProgress(me, id, dto, ip) {
        const g = await this.prisma.goal.findUnique({ where: { id } });
        if (!g)
            throw new common_1.NotFoundException('Goal not found');
        const isOwner = g.ownerId === me.id;
        const isTeamMember = Boolean(me.teamId && g.teamId === me.teamId);
        const isAdmin = me.role === 'ADMIN';
        if (!isOwner && !isTeamMember && !isAdmin) {
            throw new common_1.ForbiddenException('You are not authorized to update progress on this goal');
        }
        const newProgress = Math.max(0, Math.min(100, dto.progress));
        const newStatus = newProgress === 100 ? 'DONE' : g.status === 'DONE' ? 'ACTIVE' : g.status;
        const updated = await this.prisma.goal.update({
            where: { id },
            data: {
                progress: newProgress,
                status: newStatus,
            },
        });
        await this.audit.log({
            actorId: me.id,
            action: 'GOAL_PROGRESS_UPDATE',
            entity: 'goal',
            entityId: id,
            metadata: { progress: newProgress, status: newStatus },
            ip,
        });
        return updated;
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], GoalsService);
//# sourceMappingURL=goals.service.js.map