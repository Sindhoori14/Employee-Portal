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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const PLANNERS = ['ADMIN', 'TEAM_LEAD', 'COORDINATOR'];
let ProjectsService = class ProjectsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    scope(me) {
        if (me.role === 'ADMIN' || me.role === 'TEAM_LEAD')
            return {};
        const or = [{ ownerId: me.id }, { id: '__none__' }];
        if (me.teamId)
            or.push({ teamId: me.teamId });
        if (me.batchId)
            or.push({ batchId: me.batchId });
        return { OR: or };
    }
    wire(p, counts) {
        const total = counts?.total ?? 0;
        const done = counts?.done ?? 0;
        return { ...p, taskCount: total, doneCount: done, progress: total ? Math.round((done / total) * 100) : 0 };
    }
    async list(me) {
        const projects = await this.prisma.project.findMany({
            where: this.scope(me), orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 200,
            include: {
                team: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
                owner: { select: { id: true, displayName: true } },
            },
        });
        if (!projects.length)
            return [];
        const grouped = await this.prisma.task.groupBy({
            by: ['projectId', 'status'], where: { projectId: { in: projects.map((p) => p.id) } }, _count: { _all: true },
        });
        const counts = new Map();
        for (const g of grouped) {
            if (!g.projectId)
                continue;
            const c = counts.get(g.projectId) ?? { total: 0, done: 0 };
            c.total += g._count._all;
            if (g.status === 'DONE')
                c.done += g._count._all;
            counts.set(g.projectId, c);
        }
        return projects.map((p) => this.wire(p, counts.get(p.id)));
    }
    async mustSee(me, id) {
        const p = await this.prisma.project.findUnique({
            where: { id },
            include: {
                team: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
                owner: { select: { id: true, displayName: true } },
                tasks: {
                    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }], take: 500,
                    include: { owner: { select: { id: true, displayName: true } } },
                },
            },
        });
        if (!p)
            throw new common_1.NotFoundException('Project not found');
        const allowed = me.role === 'ADMIN' || me.role === 'TEAM_LEAD' || p.ownerId === me.id ||
            (me.role === 'COORDINATOR' && !!me.teamId && p.teamId === me.teamId) ||
            (!!me.teamId && p.teamId === me.teamId) || (!!me.batchId && p.batchId === me.batchId);
        if (!allowed)
            throw new common_1.ForbiddenException('Forbidden');
        return p;
    }
    async get(me, id) {
        const p = await this.mustSee(me, id);
        const done = p.tasks.filter((t) => t.status === 'DONE').length;
        return this.wire(p, { total: p.tasks.length, done });
    }
    async create(me, dto, ip) {
        if (!PLANNERS.includes(me.role))
            throw new common_1.ForbiddenException('Only leads, coordinators and admins create projects');
        const teamId = dto.teamId ?? me.teamId ?? null;
        if (!teamId)
            throw new common_1.BadRequestException('teamId required');
        if (me.role !== 'ADMIN' && (!me.teamId || teamId !== me.teamId))
            throw new common_1.ForbiddenException('You can create projects for your own team only');
        const team = await this.prisma.team.findUnique({ where: { id: teamId }, select: { id: true } });
        if (!team)
            throw new common_1.BadRequestException('Invalid teamId');
        if (dto.ownerId) {
            const owner = await this.prisma.user.findFirst({ where: { id: dto.ownerId, isActive: true }, select: { teamId: true } });
            if (!owner)
                throw new common_1.BadRequestException('Invalid owner');
            if (owner.teamId !== teamId)
                throw new common_1.BadRequestException('The owner is not in this team');
        }
        if (dto.startDate && dto.dueDate && new Date(dto.dueDate) < new Date(dto.startDate))
            throw new common_1.BadRequestException('Due date must be after the start date');
        const p = await this.prisma.project.create({
            data: {
                name: dto.name.trim(),
                description: dto.description ?? null,
                teamId,
                batchId: dto.batchId ?? null,
                ownerId: dto.ownerId ?? null,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                createdById: me.id,
            },
        });
        await this.audit.log({ actorId: me.id, action: 'PROJECT_CREATE', entity: 'project', entityId: p.id, ip });
        return this.wire(p);
    }
    async update(me, id, dto, ip) {
        const p = await this.prisma.project.findUnique({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException('Project not found');
        if (!PLANNERS.includes(me.role))
            throw new common_1.ForbiddenException('Forbidden');
        if (me.role !== 'ADMIN' && (!me.teamId || p.teamId !== me.teamId))
            throw new common_1.ForbiddenException('Outside your team');
        if (dto.ownerId) {
            const owner = await this.prisma.user.findFirst({ where: { id: dto.ownerId, isActive: true }, select: { teamId: true } });
            if (!owner)
                throw new common_1.BadRequestException('Invalid owner');
            if (p.teamId && owner.teamId !== p.teamId)
                throw new common_1.BadRequestException('The owner is not in this team');
        }
        const start = dto.startDate ? new Date(dto.startDate) : p.startDate;
        const due = dto.dueDate ? new Date(dto.dueDate) : p.dueDate;
        if (start && due && due < start)
            throw new common_1.BadRequestException('Due date must be after the start date');
        const updated = await this.prisma.project.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
                ...(dto.batchId !== undefined ? { batchId: dto.batchId } : {}),
                ...(dto.ownerId !== undefined ? { ownerId: dto.ownerId } : {}),
                ...(dto.startDate !== undefined ? { startDate: start } : {}),
                ...(dto.dueDate !== undefined ? { dueDate: due } : {}),
            },
        });
        await this.audit.log({ actorId: me.id, action: 'PROJECT_UPDATE', entity: 'project', entityId: id, metadata: dto, ip });
        return this.wire(updated);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map