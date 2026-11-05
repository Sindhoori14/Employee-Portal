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
exports.WorkplaceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../comms/notifications.service");
const work_calendar_service_1 = require("../../common/work-calendar.service");
const time_1 = require("../../common/time");
const LEAD_ROLES = ['ADMIN', 'TEAM_LEAD'];
function isHttpUrl(s) {
    try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:';
    }
    catch {
        return false;
    }
}
let WorkplaceService = class WorkplaceService {
    prisma;
    audit;
    notifications;
    calendar;
    constructor(prisma, audit, notifications, calendar) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
        this.calendar = calendar;
    }
    async createMeeting(me, dto, ip) {
        if (!LEAD_ROLES.includes(me.role))
            throw new common_1.ForbiddenException('Only leads and admins schedule meetings');
        const teamId = dto.teamId ?? null;
        if (teamId) {
            const t = await this.prisma.team.findUnique({ where: { id: teamId } });
            if (!t)
                throw new common_1.BadRequestException('Invalid teamId');
            if (me.role === 'TEAM_LEAD' && me.teamId !== teamId)
                throw new common_1.ForbiddenException('Outside your team');
        }
        else if (me.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Company meetings are admin-only');
        }
        if (!isHttpUrl(dto.meetUrl))
            throw new common_1.BadRequestException('meetUrl must be an http(s) link');
        const startsAt = new Date(dto.startsAt);
        if (isNaN(startsAt.getTime()))
            throw new common_1.BadRequestException('Invalid startsAt');
        const endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
        if (endsAt && (isNaN(endsAt.getTime()) || endsAt <= startsAt))
            throw new common_1.BadRequestException('endsAt must be after startsAt');
        const m = await this.prisma.meeting.create({
            data: {
                teamId, title: dto.title.trim(), meetUrl: dto.meetUrl.trim(), startsAt, endsAt,
                recurrence: dto.recurrence ?? 'NONE', createdById: me.id,
            },
        });
        const ids = await this.scopeUserIds(teamId, me.id);
        await this.notifications.notify(ids, {
            type: 'ANNOUNCEMENT', title: `Meeting: ${m.title}`, body: `Join at ${startsAt.toLocaleString()}`, link: '/dashboard',
        });
        await this.audit.log({ actorId: me.id, action: 'MEETING_CREATE', entity: 'meeting', entityId: m.id, ip });
        return m;
    }
    listMeetings(me, scope = 'upcoming') {
        const now = new Date();
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const scopeWhere = scope === 'upcoming'
            ? { OR: [{ endsAt: null, startsAt: { gte: hourAgo } }, { endsAt: { gte: now } }] }
            : scope === 'past'
                ? { OR: [{ endsAt: null, startsAt: { lt: hourAgo } }, { endsAt: { lt: now } }] }
                : {};
        const teamScope = [{ teamId: null }, ...(me.teamId ? [{ teamId: me.teamId }] : []), ...(me.role === 'ADMIN' || me.role === 'TEAM_LEAD' ? [{}] : [])];
        return this.prisma.meeting.findMany({
            where: {
                recurrence: 'NONE',
                AND: [{ OR: teamScope }, scopeWhere],
            },
            orderBy: scope === 'past' ? { startsAt: 'desc' } : { startsAt: 'asc' },
            take: 50,
            include: { team: { select: { id: true, name: true } } },
        });
    }
    async deleteMeeting(me, id, ip) {
        const m = await this.prisma.meeting.findUnique({ where: { id } });
        if (!m)
            throw new common_1.NotFoundException('Meeting not found');
        if (me.role !== 'ADMIN' && (m.createdById !== me.id || (m.teamId && me.teamId !== m.teamId)))
            throw new common_1.ForbiddenException('Forbidden');
        await this.prisma.meeting.delete({ where: { id } });
        await this.audit.log({ actorId: me.id, action: 'MEETING_DELETE', entity: 'meeting', entityId: id, ip });
        return { ok: true };
    }
    async requestLeave(me, dto, ip) {
        const from = dto.fromDate.slice(0, 10);
        const to = dto.toDate.slice(0, 10);
        if (from > to)
            throw new common_1.BadRequestException('fromDate must be on or before toDate');
        const today = (0, time_1.dayStr)();
        if (from < (0, time_1.addDays)(today, -2))
            throw new common_1.BadRequestException('Cannot request leave older than 2 days back');
        if (to > (0, time_1.addDays)(today, 180))
            throw new common_1.BadRequestException('Cannot request leave more than 180 days ahead');
        let days = 0;
        for (let d = from, n = 0; d <= to && n < 200; d = (0, time_1.addDays)(d, 1), n++)
            days++;
        if (days > 60)
            throw new common_1.BadRequestException('One request covers at most 60 days');
        const overlap = await this.prisma.leaveRequest.findFirst({
            where: { userId: me.id, status: { in: ['PENDING', 'APPROVED'] }, fromDate: { lte: (0, time_1.dayToDate)(to) }, toDate: { gte: (0, time_1.dayToDate)(from) } },
            select: { id: true },
        });
        if (overlap)
            throw new common_1.BadRequestException('You already have a pending/approved leave covering these dates');
        const r = await this.prisma.leaveRequest.create({
            data: { userId: me.id, teamId: me.teamId ?? null, fromDate: (0, time_1.dayToDate)(from), toDate: (0, time_1.dayToDate)(to), reason: dto.reason.trim(), status: 'PENDING' },
        });
        const pending = r;
        const staff = me.teamId
            ? await this.prisma.user.findMany({ where: { teamId: me.teamId, isActive: true, role: { in: ['TEAM_LEAD', 'COORDINATOR'] } }, select: { id: true } })
            : [];
        await this.notifications.notify(staff.map((s) => s.id), {
            type: 'REPORT_MISSING', title: `Leave request: ${me.id}`, body: `${from} → ${to}: ${dto.reason.trim().slice(0, 200)}`, link: '/leaves',
        });
        await this.audit.log({ actorId: me.id, action: 'LEAVE_REQUEST', entity: 'leave', entityId: r.id, ip });
        return pending;
    }
    mine(me) {
        return this.prisma.leaveRequest.findMany({
            where: { userId: me.id }, orderBy: { createdAt: 'desc' }, take: 100,
            include: { decidedBy: { select: { id: true, displayName: true } } },
        });
    }
    async pending(me) {
        if (!['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role))
            throw new common_1.ForbiddenException('Forbidden');
        const where = { status: 'PENDING' };
        if (me.role !== 'ADMIN') {
            if (!me.teamId)
                return [];
            where.teamId = me.teamId;
        }
        return this.prisma.leaveRequest.findMany({
            where, orderBy: { createdAt: 'asc' }, take: 100,
            include: { user: { select: { id: true, displayName: true, email: true } } },
        });
    }
    async decide(me, id, approve, note, ip) {
        if (!['ADMIN', 'TEAM_LEAD'].includes(me.role))
            throw new common_1.ForbiddenException('Only leads/admins decide leaves');
        const r = await this.prisma.leaveRequest.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Leave not found');
        if (r.status !== 'PENDING')
            throw new common_1.BadRequestException(`Already ${r.status.toLowerCase()}`);
        if (me.role === 'TEAM_LEAD' && (!me.teamId || r.teamId !== me.teamId))
            throw new common_1.ForbiddenException('Outside your team');
        const status = approve ? 'APPROVED' : 'REJECTED';
        const updated = await this.prisma.leaveRequest.update({
            where: { id }, data: { status: status, decidedById: me.id, decidedAt: new Date() },
        });
        if (approve)
            await this.markOnLeave(r.userId, r.fromDate, r.toDate);
        await this.notifications.notify([r.userId], {
            type: 'REPORT_MISSING',
            title: approve ? 'Leave approved' : 'Leave rejected',
            body: `${this.fmt(r.fromDate)} → ${this.fmt(r.toDate)}${note ? `: ${note}` : ''}`,
            link: '/leaves',
        });
        await this.audit.log({ actorId: me.id, action: approve ? 'LEAVE_APPROVE' : 'LEAVE_REJECT', entity: 'leave', entityId: id, ip });
        return updated;
    }
    async cancel(me, id, ip) {
        const r = await this.prisma.leaveRequest.findUnique({ where: { id } });
        if (!r || r.userId !== me.id)
            throw new common_1.NotFoundException('Leave not found');
        if (r.status !== 'PENDING')
            throw new common_1.BadRequestException('Only pending requests can be cancelled');
        const updated = await this.prisma.leaveRequest.update({ where: { id }, data: { status: 'CANCELLED' } });
        await this.audit.log({ actorId: me.id, action: 'LEAVE_CANCEL', entity: 'leave', entityId: id, ip });
        return updated;
    }
    async revoke(me, id, ip) {
        if (!['ADMIN', 'TEAM_LEAD'].includes(me.role))
            throw new common_1.ForbiddenException('Only leads/admins');
        const r = await this.prisma.leaveRequest.findUnique({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Leave not found');
        if (r.status !== 'APPROVED')
            throw new common_1.BadRequestException('Only approved future leaves can be revoked');
        if (this.fmt(r.fromDate) < (0, time_1.dayStr)())
            throw new common_1.BadRequestException('Cannot revoke a leave that already started');
        if (me.role === 'TEAM_LEAD' && (!me.teamId || r.teamId !== me.teamId))
            throw new common_1.ForbiddenException('Outside your team');
        const updated = await this.prisma.leaveRequest.update({ where: { id }, data: { status: 'CANCELLED', decidedById: me.id, decidedAt: new Date() } });
        await this.prisma.attendanceDay.deleteMany({ where: { userId: r.userId, status: 'ON_LEAVE', checkInAt: null, day: { gte: r.fromDate, lte: r.toDate } } });
        await this.audit.log({ actorId: me.id, action: 'LEAVE_REVOKE', entity: 'leave', entityId: id, ip });
        return updated;
    }
    onLeaveToday(me) {
        const where = {};
        if (me.role !== 'ADMIN') {
            if (!me.teamId)
                return Promise.resolve([]);
            where.teamId = me.teamId;
        }
        return this.prisma.leaveRequest.findMany({
            where: { ...where, status: 'APPROVED', fromDate: { lte: new Date((0, time_1.dayStr)()) }, toDate: { gte: new Date((0, time_1.dayStr)()) } },
            include: { user: { select: { id: true, displayName: true } } },
            take: 200,
        });
    }
    async getStats(me) {
        if (!['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role)) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        const teamScope = me.role === 'ADMIN' ? {} : me.teamId ? { teamId: me.teamId } : { teamId: '__none__' };
        const today = new Date((0, time_1.dayStr)());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const [pending, onLeaveToday, approvedThisMonth, total] = await Promise.all([
            this.prisma.leaveRequest.count({ where: { ...teamScope, status: 'PENDING' } }),
            this.prisma.leaveRequest.count({
                where: {
                    ...teamScope,
                    status: 'APPROVED',
                    fromDate: { lte: today },
                    toDate: { gte: today },
                },
            }),
            this.prisma.leaveRequest.count({
                where: {
                    ...teamScope,
                    status: 'APPROVED',
                    createdAt: { gte: startOfMonth },
                },
            }),
            this.prisma.leaveRequest.count({ where: teamScope }),
        ]);
        return { pending, onLeaveToday, approvedThisMonth, total };
    }
    async listLeaves(me, q) {
        if (!['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role)) {
            throw new common_1.ForbiddenException('Forbidden');
        }
        const where = {};
        if (q.status && q.status !== 'ALL') {
            where.status = q.status;
        }
        if (me.role === 'ADMIN') {
            if (q.teamId)
                where.teamId = q.teamId;
            if (q.userId)
                where.userId = q.userId;
        }
        else {
            if (!me.teamId)
                return [];
            where.teamId = me.teamId;
            if (q.userId)
                where.userId = q.userId;
        }
        return this.prisma.leaveRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                user: { select: { id: true, displayName: true, email: true, role: true } },
                team: { select: { id: true, name: true } },
                decidedBy: { select: { id: true, displayName: true } },
            },
        });
    }
    async saveNote(me, id, note, ip) {
        const m = await this.prisma.meeting.findUnique({ where: { id } });
        if (!m)
            throw new common_1.NotFoundException('Meeting not found');
        if (!this.canSeeMeeting(me, m.teamId))
            throw new common_1.ForbiddenException('Forbidden');
        const updated = await this.prisma.meeting.update({
            where: { id },
            data: { note: note.trim(), noteUpdatedAt: new Date(), noteUpdatedById: me.id },
            include: { noteUpdatedBy: { select: { id: true, displayName: true } } },
        });
        await this.audit.log({ actorId: me.id, action: 'MEETING_NOTE', entity: 'meeting', entityId: id, ip });
        return updated;
    }
    async monthView(me, month) {
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
            throw new common_1.BadRequestException('month must be YYYY-MM');
        const monthStart = new Date(`${month}-01T00:00:00Z`);
        const nextMonth = new Date(monthStart);
        nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
        const taskWhere = { dueDate: { gte: monthStart, lt: nextMonth } };
        if (me.role === 'EMPLOYEE') {
            const collab = await this.prisma.taskCollaborator.findMany({ where: { userId: me.id }, select: { taskId: true } });
            taskWhere.OR = [{ ownerId: me.id }, { id: { in: collab.map((c) => c.taskId) } }];
        }
        else if (me.role === 'COORDINATOR') {
            taskWhere.teamId = me.teamId ?? '__none__';
        }
        const [meetings, tasks, leaves, holidays] = await Promise.all([
            this.prisma.meeting.findMany({
                where: {
                    recurrence: 'NONE',
                    startsAt: { gte: monthStart, lt: nextMonth },
                    OR: [{ teamId: null }, ...(me.teamId ? [{ teamId: me.teamId }] : []), ...(me.role === 'ADMIN' || me.role === 'TEAM_LEAD' ? [{}] : [])],
                },
                orderBy: { startsAt: 'asc' },
                include: { team: { select: { id: true, name: true } } },
                take: 500,
            }),
            this.prisma.task.findMany({
                where: taskWhere,
                orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
                select: {
                    id: true, title: true, status: true, priority: true, dueDate: true,
                    owner: { select: { id: true, displayName: true } },
                },
                take: 1000,
            }),
            this.prisma.leaveRequest.findMany({
                where: {
                    status: 'APPROVED',
                    fromDate: { lt: nextMonth },
                    toDate: { gte: monthStart },
                    ...(me.role === 'ADMIN' ? {} : me.role === 'EMPLOYEE' ? { userId: me.id } : me.teamId ? { teamId: me.teamId } : { userId: me.id }),
                },
                include: { user: { select: { id: true, displayName: true } } },
                take: 500,
            }),
            this.calendar.holidaySet(),
        ]);
        const days = {};
        const dayList = [];
        for (let d = new Date(monthStart); d < nextMonth; d = new Date(d.getTime() + 86_400_000)) {
            dayList.push(d.toISOString().slice(0, 10));
        }
        for (const d of dayList) {
            days[d] = {
                meetings: meetings.filter((m) => m.startsAt.toISOString().slice(0, 10) === d).map((m) => ({ id: m.id, title: m.title, startsAt: m.startsAt, meetUrl: m.meetUrl, team: m.team })),
                tasks: tasks.filter((t) => t.dueDate && this.fmt(t.dueDate) === d),
                leaves: leaves
                    .filter((l) => this.fmt(l.fromDate) <= d && d <= this.fmt(l.toDate))
                    .map((l) => ({ user: l.user.displayName, fromDate: this.fmt(l.fromDate), toDate: this.fmt(l.toDate) })),
                isHoliday: holidays.has(d),
                isWorkingDay: await this.calendar.isWorkingDay(d),
            };
        }
        return { month, days };
    }
    canSeeMeeting(me, teamId) {
        if (teamId === null)
            return true;
        if (me.role === 'ADMIN' || me.role === 'TEAM_LEAD')
            return true;
        return me.teamId === teamId;
    }
    fmt(d) {
        return d.toISOString().slice(0, 10);
    }
    async markOnLeave(userId, from, to) {
        let d = this.fmt(from);
        const end = this.fmt(to);
        for (let n = 0; d <= end && n < 200; d = (0, time_1.addDays)(d, 1), n++) {
            if (!(await this.calendar.isWorkingDay(d)))
                continue;
            await this.prisma.attendanceDay.upsert({
                where: { userId_day: { userId, day: (0, time_1.dayToDate)(d) } },
                update: {},
                create: { userId, day: (0, time_1.dayToDate)(d), status: 'ON_LEAVE' },
            });
        }
    }
    async scopeUserIds(teamId, except) {
        const rows = await this.prisma.user.findMany({
            where: { isActive: true, ...(teamId ? { teamId } : {}) }, select: { id: true }, take: 500,
        });
        return rows.map((r) => r.id).filter((id) => id !== except);
    }
};
exports.WorkplaceService = WorkplaceService;
exports.WorkplaceService = WorkplaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        work_calendar_service_1.WorkCalendarService])
], WorkplaceService);
//# sourceMappingURL=workplace.service.js.map