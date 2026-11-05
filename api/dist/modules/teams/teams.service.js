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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const user_cache_service_1 = require("../../common/user-cache.service");
let TeamsService = class TeamsService {
    prisma;
    audit;
    cache;
    constructor(prisma, audit, cache) {
        this.prisma = prisma;
        this.audit = audit;
        this.cache = cache;
    }
    async syncStaff(teamId, ids) {
        const staff = ids.filter((x) => Boolean(x));
        if (!staff.length)
            return;
        await this.prisma.user.updateMany({ where: { id: { in: staff } }, data: { teamId } });
        staff.forEach((id) => this.cache.invalidate(id));
    }
    list() {
        return this.prisma.team.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { members: true, tasks: true } },
                lead: { select: { id: true, displayName: true, email: true } },
                coordinator: { select: { id: true, displayName: true, email: true } },
                hr: { select: { id: true, displayName: true, email: true } },
            },
        });
    }
    async get(id, viewerRole = 'ADMIN') {
        const staff = viewerRole !== 'EMPLOYEE';
        const t = await this.prisma.team.findUnique({
            where: { id },
            include: {
                members: {
                    select: { id: true, displayName: true, email: staff, role: true, isActive: true },
                    orderBy: [{ isActive: 'desc' }, { displayName: 'asc' }],
                },
                lead: { select: { id: true, displayName: true, email: staff } },
                coordinator: { select: { id: true, displayName: true, email: staff } },
                hr: { select: { id: true, displayName: true, email: staff } },
            },
        });
        if (!t)
            throw new common_1.NotFoundException('Team not found');
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const [tasks, attendance, reports] = await Promise.all([
            this.prisma.task.groupBy({
                by: ['status'],
                where: { teamId: id },
                _count: { id: true },
            }),
            this.prisma.attendanceDay.count({
                where: { teamId: id, day: today, status: { in: ['PRESENT', 'LATE'] } },
            }),
            this.prisma.dailyReport.count({
                where: { teamId: id, reportDate: today },
            }),
        ]);
        const taskCounts = tasks.reduce((acc, row) => {
            acc[row.status] = row._count.id;
            return acc;
        }, {});
        const doneTasks = taskCounts['DONE'] || 0;
        const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);
        const openTasks = totalTasks - doneTasks;
        const blockedTasks = taskCounts['BLOCKED'] || 0;
        const activeMembers = t.members.filter((m) => m.isActive).length;
        const stats = {
            totalMembers: t.members.length,
            activeMembers,
            openTasks,
            doneTasks,
            blockedTasks,
            totalTasks,
            taskDoneRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
            presentToday: attendance,
            reportsToday: reports,
        };
        return { ...t, stats };
    }
    async create(meId, dto, ip) {
        const exists = await this.prisma.team.findUnique({ where: { name: dto.name } });
        if (exists)
            throw new common_1.BadRequestException('Team name already exists');
        if (dto.leadId)
            await this.assertUser(dto.leadId);
        if (dto.coordinatorId)
            await this.assertUser(dto.coordinatorId);
        if (dto.hrId)
            await this.assertUser(dto.hrId);
        const t = await this.prisma.team.create({
            data: { name: dto.name, description: dto.description ?? null, leadId: dto.leadId ?? null, coordinatorId: dto.coordinatorId ?? null, hrId: dto.hrId ?? null, createdById: meId },
        });
        await this.syncStaff(t.id, [dto.leadId, dto.coordinatorId, dto.hrId]);
        await this.audit.log({ actorId: meId, action: 'TEAM_CREATE', entity: 'team', entityId: t.id, ip });
        return t;
    }
    async update(meId, id, dto, ip) {
        await this.get(id);
        if (dto.leadId)
            await this.assertUser(dto.leadId);
        if (dto.coordinatorId)
            await this.assertUser(dto.coordinatorId);
        if (dto.hrId)
            await this.assertUser(dto.hrId);
        if (dto.name) {
            const clash = await this.prisma.team.findFirst({ where: { name: dto.name, id: { not: id } }, select: { id: true } });
            if (clash)
                throw new common_1.BadRequestException('Another team already uses that name');
        }
        const t = await this.prisma.team.update({ where: { id }, data: { ...dto } });
        await this.syncStaff(id, [dto.leadId, dto.coordinatorId, dto.hrId]);
        await this.audit.log({ actorId: meId, action: 'TEAM_UPDATE', entity: 'team', entityId: id, metadata: dto, ip });
        return t;
    }
    async addMembers(meId, teamId, userIds, ip) {
        if (!userIds.length)
            throw new common_1.BadRequestException('No users provided');
        await this.get(teamId);
        const validUsers = await this.prisma.user.findMany({
            where: { id: { in: userIds }, isActive: true },
            select: { id: true, displayName: true, email: true },
        });
        if (!validUsers.length)
            throw new common_1.BadRequestException('No valid users found');
        await this.prisma.user.updateMany({
            where: { id: { in: validUsers.map((u) => u.id) } },
            data: { teamId },
        });
        validUsers.forEach((u) => this.cache.invalidate(u.id));
        await this.audit.log({
            actorId: meId,
            action: 'TEAM_MEMBERS_ADD',
            entity: 'team',
            entityId: teamId,
            metadata: { addedCount: validUsers.length, userIds: validUsers.map((u) => u.id) },
            ip,
        });
        return { added: validUsers.length };
    }
    async removeMember(meId, teamId, userId, ip) {
        const t = await this.get(teamId);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.teamId !== teamId)
            throw new common_1.BadRequestException('User is not in this team');
        const updateTeamData = {};
        if (t.leadId === userId)
            updateTeamData.leadId = null;
        if (t.coordinatorId === userId)
            updateTeamData.coordinatorId = null;
        if (Object.keys(updateTeamData).length > 0) {
            await this.prisma.team.update({ where: { id: teamId }, data: updateTeamData });
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { teamId: null },
        });
        this.cache.invalidate(userId);
        await this.audit.log({
            actorId: meId,
            action: 'TEAM_MEMBER_REMOVE',
            entity: 'team',
            entityId: teamId,
            metadata: { removedUserId: userId },
            ip,
        });
        return { removed: true };
    }
    async transferMember(meId, fromTeamId, userId, targetTeamId, ip) {
        if (fromTeamId === targetTeamId)
            throw new common_1.BadRequestException('Target team must be different');
        const fromTeam = await this.get(fromTeamId);
        await this.get(targetTeamId);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.teamId !== fromTeamId)
            throw new common_1.BadRequestException('User is not in the source team');
        const updateFromData = {};
        if (fromTeam.leadId === userId)
            updateFromData.leadId = null;
        if (fromTeam.coordinatorId === userId)
            updateFromData.coordinatorId = null;
        if (Object.keys(updateFromData).length > 0) {
            await this.prisma.team.update({ where: { id: fromTeamId }, data: updateFromData });
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { teamId: targetTeamId },
        });
        this.cache.invalidate(userId);
        await this.audit.log({
            actorId: meId,
            action: 'TEAM_MEMBER_TRANSFER',
            entity: 'team',
            entityId: fromTeamId,
            metadata: { userId, fromTeamId, targetTeamId },
            ip,
        });
        return { transferred: true };
    }
    async assertUser(id) {
        const u = await this.prisma.user.findUnique({ where: { id } });
        if (!u || !u.isActive)
            throw new common_1.BadRequestException('Invalid member user');
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService, user_cache_service_1.UserCacheService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map