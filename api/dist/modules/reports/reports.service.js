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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const work_calendar_service_1 = require("../../common/work-calendar.service");
const file_links_service_1 = require("../../common/file-links.service");
const time_1 = require("../../common/time");
function needDay(s, label = 'date') {
    if (s === undefined || s === '')
        return undefined;
    if (!(0, time_1.isValidDay)(s))
        throw new common_1.BadRequestException(`${label} must be a valid YYYY-MM-DD`);
    return s;
}
const HHMM = /^([01]?\d|2[0-3]):[0-5]\d$/;
const SETTING_VALIDATORS = {
    attendance: (v) => {
        if (!v || typeof v !== 'object')
            return 'attendance must be an object';
        for (const k of ['shiftStart', 'shiftEnd', 'autoCheckout'])
            if (v[k] !== undefined && !HHMM.test(String(v[k])))
                return `${k} must be HH:MM`;
        for (const k of ['graceMinutes', 'halfDayMinutes', 'maxBreakMinutes', 'maxSingleBreakMinutes'])
            if (v[k] !== undefined && !(Number.isInteger(v[k]) && v[k] >= 0 && v[k] <= 1440))
                return `${k} must be 0-1440`;
        return null;
    },
    requireProfilePhoto: (v) => (typeof v === 'boolean' ? null : 'requireProfilePhoto must be true or false'),
    reportGate: (v) => {
        if (!v || typeof v !== 'object' || Array.isArray(v))
            return 'reportGate must be an object';
        const g = v;
        if (typeof g.enabled !== 'boolean')
            return 'reportGate.enabled must be true or false';
        const roles = ['ADMIN', 'TEAM_LEAD', 'COORDINATOR', 'EMPLOYEE'];
        if (!Array.isArray(g.roles) || !g.roles.every((r) => roles.includes(String(r))))
            return 'reportGate.roles must be a list of roles';
        return null;
    },
    reportDeadline: (v) => (v && /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(v.time)) ? null : 'reportDeadline needs { "time": "HH:MM" }'),
    workDays: (v) => (Array.isArray(v) && v.length > 0 && v.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) ? null : 'workDays must be numbers 0 (Sun) to 6 (Sat)'),
    holidays: (v) => (Array.isArray(v) && v.length <= 400 && v.every((d) => (0, time_1.isValidDay)(d)) ? null : 'holidays must be a list of YYYY-MM-DD'),
};
let ReportsService = class ReportsService {
    prisma;
    audit;
    calendar;
    links;
    constructor(prisma, audit, calendar, links) {
        this.prisma = prisma;
        this.audit = audit;
        this.calendar = calendar;
        this.links = links;
    }
    async submit(me, dto, ip) {
        if (!(dto.hoursWorked >= 0 && dto.hoursWorked <= 24))
            throw new common_1.BadRequestException('hoursWorked must be 0-24');
        if (!dto.didToday.trim() || !dto.planTomorrow.trim())
            throw new common_1.BadRequestException('didToday and planTomorrow are required');
        const today = (0, time_1.dayStr)();
        const day = needDay(dto.reportDate, 'reportDate') ?? today;
        if (day > today)
            throw new common_1.BadRequestException('Cannot report for a future date');
        if (day < (0, time_1.addDays)(today, -14))
            throw new common_1.BadRequestException('Reports can be backfilled for the last 14 days only');
        const date = (0, time_1.dayToDate)(day);
        const taskIds = [...new Set(dto.taskIds ?? [])];
        if (taskIds.length) {
            const n = await this.prisma.task.count({
                where: { id: { in: taskIds }, OR: [{ ownerId: me.id }, { collaborators: { some: { userId: me.id } } }] },
            });
            if (n !== taskIds.length)
                throw new common_1.BadRequestException('One or more tasks are invalid or not yours');
        }
        const existing = await this.prisma.dailyReport.findUnique({ where: { userId_reportDate: { userId: me.id, reportDate: date } } });
        const late = existing ? existing.isLate : await this.calendar.isLate(day, today);
        const id = await this.prisma.$transaction(async (tx) => {
            let report;
            if (existing) {
                report = await tx.dailyReport.update({
                    where: { id: existing.id },
                    data: {
                        didToday: dto.didToday, blockers: dto.blockers ?? null, planTomorrow: dto.planTomorrow,
                        hoursWorked: dto.hoursWorked, isLate: late, submittedAt: new Date(),
                        teamId: me.teamId ?? existing.teamId, batchId: me.batchId ?? existing.batchId,
                    },
                });
                await tx.dailyReportTask.deleteMany({ where: { reportId: existing.id } });
            }
            else {
                report = await tx.dailyReport.create({
                    data: {
                        userId: me.id, teamId: me.teamId ?? 'unassigned', batchId: me.batchId ?? null,
                        reportDate: date, didToday: dto.didToday, blockers: dto.blockers ?? null,
                        planTomorrow: dto.planTomorrow, hoursWorked: dto.hoursWorked, isLate: late,
                    },
                });
            }
            if (taskIds.length)
                await tx.dailyReportTask.createMany({ data: taskIds.map((taskId) => ({ reportId: report.id, taskId })), skipDuplicates: true });
            await this.links.claim(tx, me.id, dto.fileIds, { context: 'REPORT' }, { reportId: report.id });
            return report.id;
        });
        await this.audit.log({ actorId: me.id, action: 'REPORT_SUBMIT', entity: 'daily_report', entityId: id, metadata: { date: day, late }, ip });
        return this.prisma.dailyReport.findUnique({ where: { id }, include: { files: file_links_service_1.LIVE_FILES, taskLinks: { include: { task: { select: { id: true, title: true, status: true } } } } } });
    }
    mine(me, from, to) {
        const f = needDay(from, 'from');
        const t = needDay(to, 'to');
        return this.prisma.dailyReport.findMany({
            where: {
                userId: me.id,
                ...(f || t ? { reportDate: { ...(f ? { gte: (0, time_1.dayToDate)(f) } : {}), ...(t ? { lte: (0, time_1.dayToDate)(t) } : {}) } } : {}),
            },
            orderBy: { reportDate: 'desc' },
            take: 100,
            include: { files: file_links_service_1.LIVE_FILES, taskLinks: { include: { task: { select: { id: true, title: true, status: true } } } } },
        });
    }
    async list(me, q) {
        if (me.role === 'EMPLOYEE')
            throw new common_1.ForbiddenException('Use /daily-reports/mine');
        const where = {};
        const d = needDay(q.date);
        if (d)
            where.reportDate = (0, time_1.dayToDate)(d);
        if (me.role === 'COORDINATOR')
            where.teamId = me.teamId ?? '__none__';
        else if (q.teamId)
            where.teamId = q.teamId;
        if (q.batchId)
            where.batchId = q.batchId;
        return this.prisma.dailyReport.findMany({
            where, orderBy: { submittedAt: 'desc' }, take: 200,
            include: { files: file_links_service_1.LIVE_FILES, user: { select: { id: true, displayName: true, email: true } } },
        });
    }
    async status(me, dateStr, teamId, batchId) {
        if (!['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role))
            throw new common_1.ForbiddenException('Forbidden');
        const day = needDay(dateStr) ?? (0, time_1.dayStr)();
        const date = (0, time_1.dayToDate)(day);
        const working = await this.calendar.isWorkingDay(day);
        const scope = { isActive: true, role: { not: 'ADMIN' }, createdAt: { lt: (0, time_1.dayRange)(day).end } };
        if (me.role === 'COORDINATOR')
            scope.teamId = me.teamId ?? '__none__';
        else if (teamId)
            scope.teamId = teamId;
        if (batchId)
            scope.batchId = batchId;
        const members = await this.prisma.user.findMany({
            where: scope, select: { id: true, displayName: true, email: true, teamId: true }, orderBy: { displayName: 'asc' },
        });
        const reports = await this.prisma.dailyReport.findMany({ where: { reportDate: date, userId: { in: members.map((m) => m.id) } } });
        const byUser = new Map(reports.map((r) => [r.userId, r]));
        return {
            date: day,
            workingDay: working,
            submitted: members.filter((m) => byUser.has(m.id)).map((m) => ({ ...m, report: byUser.get(m.id) })),
            missing: working ? members.filter((m) => !byUser.has(m.id)) : [],
        };
    }
    async upsertEvaluation(me, dto, ip) {
        if (!['ADMIN', 'TEAM_LEAD'].includes(me.role))
            throw new common_1.ForbiddenException('Only leads/admins evaluate');
        const clamp = (v) => (v === undefined ? undefined : Math.min(100, Math.max(0, v)));
        const data = {
            attendancePct: clamp(dto.attendancePct) ?? 0,
            taskCompletionPct: clamp(dto.taskCompletionPct) ?? 0,
            avgScore: clamp(dto.avgScore) ?? 0,
            remarks: dto.remarks ?? null,
            readiness: (dto.readiness ?? 'NOT_ASSESSED'),
            evaluatedById: me.id,
            evaluatedAt: new Date(),
        };
        const row = await this.prisma.batchEvaluation.upsert({
            where: { batchId_userId: { batchId: dto.batchId, userId: dto.userId } },
            update: data,
            create: { batchId: dto.batchId, userId: dto.userId, ...data },
        });
        await this.audit.log({ actorId: me.id, action: 'BATCH_EVALUATE', entity: 'batch_evaluation', entityId: row.id, ip });
        return row;
    }
    async computeEvaluations(me, batchId, ip) {
        if (!['ADMIN', 'TEAM_LEAD'].includes(me.role))
            throw new common_1.ForbiddenException('Only leads/admins evaluate');
        const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
        if (!batch)
            throw new common_1.BadRequestException('Invalid batchId');
        const today = (0, time_1.dayStr)();
        const start = (0, time_1.dayStr)(batch.startDate) < today ? (0, time_1.dayStr)(batch.startDate) : today;
        const endCap = (0, time_1.dayStr)(batch.endDate) < today ? (0, time_1.dayStr)(batch.endDate) : today;
        let workingDays = 0;
        for (let d = start, i = 0; d <= endCap && i < 800; d = (0, time_1.addDays)(d, 1), i++)
            if (await this.calendar.isWorkingDay(d))
                workingDays++;
        const [trainees, assessments] = await Promise.all([
            this.prisma.user.findMany({ where: { batchId, isActive: true, role: 'EMPLOYEE' }, select: { id: true } }),
            this.prisma.assessment.findMany({ where: { batchId }, select: { id: true, maxScore: true } }),
        ]);
        const ids = trainees.map((t) => t.id);
        if (!ids.length)
            return { updated: 0, workingDays };
        const [reportCounts, taskTotals, taskDone, attempts] = await Promise.all([
            this.prisma.dailyReport.groupBy({
                by: ['userId'], _count: { _all: true },
                where: { userId: { in: ids }, reportDate: { gte: (0, time_1.dayToDate)(start), lte: (0, time_1.dayToDate)(endCap) } },
            }),
            this.prisma.task.groupBy({ by: ['ownerId'], _count: { _all: true }, where: { ownerId: { in: ids } } }),
            this.prisma.task.groupBy({ by: ['ownerId'], _count: { _all: true }, where: { ownerId: { in: ids }, status: 'DONE' } }),
            assessments.length
                ? this.prisma.assessmentAttempt.findMany({
                    where: { userId: { in: ids }, assessmentId: { in: assessments.map((a) => a.id) }, score: { not: null } },
                    select: { userId: true, assessmentId: true, score: true, maxScore: true },
                })
                : Promise.resolve([]),
        ]);
        const rep = new Map(reportCounts.map((r) => [r.userId, r._count._all]));
        const tot = new Map(taskTotals.map((r) => [r.ownerId, r._count._all]));
        const done = new Map(taskDone.map((r) => [r.ownerId, r._count._all]));
        const best = new Map();
        for (const a of attempts) {
            const max = Number(a.maxScore) || 0;
            if (!max)
                continue;
            const k = `${a.userId}:${a.assessmentId}`;
            best.set(k, Math.max(best.get(k) ?? 0, (Number(a.score) / max) * 100));
        }
        const round1 = (n) => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
        await this.prisma.$transaction(ids.map((userId) => {
            const attendancePct = workingDays ? round1(((rep.get(userId) ?? 0) / workingDays) * 100) : 0;
            const taskCompletionPct = tot.get(userId) ? round1(((done.get(userId) ?? 0) / tot.get(userId)) * 100) : 0;
            const avgScore = assessments.length ? round1(assessments.reduce((s, a) => s + (best.get(`${userId}:${a.id}`) ?? 0), 0) / assessments.length) : 0;
            return this.prisma.batchEvaluation.upsert({
                where: { batchId_userId: { batchId, userId } },
                update: { attendancePct, taskCompletionPct, avgScore },
                create: { batchId, userId, attendancePct, taskCompletionPct, avgScore, readiness: 'NOT_ASSESSED', evaluatedById: me.id, evaluatedAt: new Date() },
            });
        }));
        await this.audit.log({ actorId: me.id, action: 'BATCH_EVALUATION_COMPUTE', entity: 'batch', entityId: batchId, metadata: { trainees: ids.length, workingDays }, ip });
        return { updated: ids.length, workingDays };
    }
    async listEvaluations(me, batchId) {
        if (!batchId)
            throw new common_1.BadRequestException('batchId required');
        return this.prisma.batchEvaluation.findMany({
            where: { batchId, ...(me.role === 'COORDINATOR' ? { user: { teamId: me.teamId ?? '__none__' } } : {}) },
            include: { user: { select: { id: true, displayName: true, email: true } } },
        });
    }
    listSettings() {
        return this.prisma.setting.findMany();
    }
    async putSetting(me, key, value, ip) {
        if (me.role !== 'ADMIN')
            throw new common_1.ForbiddenException('Only admin');
        if (!/^[a-zA-Z0-9_-]{1,80}$/.test(key))
            throw new common_1.BadRequestException('Invalid key');
        const check = SETTING_VALIDATORS[key];
        if (check) {
            const err = check(value);
            if (err)
                throw new common_1.BadRequestException(err);
        }
        else if (JSON.stringify(value ?? null).length > 20_000) {
            throw new common_1.BadRequestException('Value too large');
        }
        const s = await this.prisma.setting.upsert({ where: { key }, update: { value: value, updatedById: me.id }, create: { key, value: value, updatedById: me.id } });
        this.calendar.invalidate();
        await this.audit.log({ actorId: me.id, action: 'SETTING_UPDATE', entity: 'setting', entityId: key, ip });
        return s;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService, work_calendar_service_1.WorkCalendarService, file_links_service_1.FileLinkService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map