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
exports.BatchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let BatchesService = class BatchesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list() {
        return this.prisma.batch.findMany({
            orderBy: { startDate: 'desc' },
            include: {
                _count: { select: { members: true } },
                lead: { select: { id: true, displayName: true, email: true } },
                coordinator: { select: { id: true, displayName: true, email: true } },
            },
        });
    }
    async get(id, viewerRole = 'ADMIN') {
        const staff = viewerRole !== 'EMPLOYEE';
        const b = await this.prisma.batch.findUnique({
            where: { id },
            include: {
                members: {
                    select: { id: true, displayName: true, email: staff, role: true, isActive: true },
                    orderBy: [{ isActive: 'desc' }, { displayName: 'asc' }],
                },
                lead: { select: { id: true, displayName: true, email: staff } },
                coordinator: { select: { id: true, displayName: true, email: staff } },
            },
        });
        if (!b)
            throw new common_1.NotFoundException('Batch not found');
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const [tasks, reports] = await Promise.all([
            this.prisma.task.groupBy({
                by: ['status'],
                where: { batchId: id },
                _count: { id: true },
            }),
            this.prisma.dailyReport.count({
                where: { batchId: id, reportDate: today },
            }),
        ]);
        const taskCounts = tasks.reduce((acc, row) => {
            acc[row.status] = row._count.id;
            return acc;
        }, {});
        const doneTasks = taskCounts['DONE'] || 0;
        const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);
        const activeMembers = b.members.filter((m) => m.isActive).length;
        const stats = {
            totalMembers: b.members.length,
            activeMembers,
            totalTasks,
            doneTasks,
            taskDoneRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
            reportsToday: reports,
        };
        return { ...b, stats };
    }
    async create(meId, dto, ip) {
        if (new Date(dto.endDate) < new Date(dto.startDate))
            throw new common_1.BadRequestException('endDate must be >= startDate');
        const b = await this.prisma.batch.create({
            data: {
                name: dto.name,
                description: dto.description ?? null,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                durationDays: dto.durationDays,
                leadId: dto.leadId ?? null,
                coordinatorId: dto.coordinatorId ?? null,
                createdById: meId,
            },
        });
        await this.prisma.channel.create({
            data: { type: 'BATCH', batchId: b.id, name: b.name.slice(0, 80), createdById: meId },
        }).catch(() => { });
        await this.audit.log({ actorId: meId, action: 'BATCH_CREATE', entity: 'batch', entityId: b.id, ip });
        return b;
    }
    async update(meId, id, dto, ip) {
        const cur = await this.get(id);
        const start = dto.startDate ? new Date(dto.startDate) : cur.startDate;
        const end = dto.endDate ? new Date(dto.endDate) : cur.endDate;
        if (end < start)
            throw new common_1.BadRequestException('endDate must be >= startDate');
        const b = await this.prisma.batch.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.startDate ? { startDate: start } : {}),
                ...(dto.endDate ? { endDate: end } : {}),
                ...(dto.durationDays !== undefined ? { durationDays: dto.durationDays } : {}),
                ...(dto.leadId !== undefined ? { leadId: dto.leadId } : {}),
                ...(dto.coordinatorId !== undefined ? { coordinatorId: dto.coordinatorId } : {}),
            },
        });
        await this.audit.log({ actorId: meId, action: 'BATCH_UPDATE', entity: 'batch', entityId: id, metadata: dto, ip });
        return b;
    }
    async addMembers(meId, batchId, userIds, ip) {
        if (!userIds.length)
            throw new common_1.BadRequestException('No users provided');
        await this.get(batchId);
        const validUsers = await this.prisma.user.findMany({
            where: { id: { in: userIds }, isActive: true },
            select: { id: true },
        });
        if (!validUsers.length)
            throw new common_1.BadRequestException('No valid users found');
        await this.prisma.user.updateMany({
            where: { id: { in: validUsers.map((u) => u.id) } },
            data: { batchId },
        });
        await this.audit.log({
            actorId: meId,
            action: 'BATCH_MEMBERS_ADD',
            entity: 'batch',
            entityId: batchId,
            metadata: { addedCount: validUsers.length, userIds: validUsers.map((u) => u.id) },
            ip,
        });
        return { added: validUsers.length };
    }
    async removeMember(meId, batchId, userId, ip) {
        await this.get(batchId);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.batchId !== batchId)
            throw new common_1.BadRequestException('User is not in this batch');
        await this.prisma.user.update({
            where: { id: userId },
            data: { batchId: null },
        });
        await this.audit.log({
            actorId: meId,
            action: 'BATCH_MEMBER_REMOVE',
            entity: 'batch',
            entityId: batchId,
            metadata: { removedUserId: userId },
            ip,
        });
        return { removed: true };
    }
};
exports.BatchesService = BatchesService;
exports.BatchesService = BatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], BatchesService);
//# sourceMappingURL=batches.service.js.map