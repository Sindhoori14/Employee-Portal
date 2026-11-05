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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../comms/notifications.service");
const work_calendar_service_1 = require("../../common/work-calendar.service");
const attendance_service_1 = require("../attendance/attendance.service");
const files_service_1 = require("../files/files.service");
const time_1 = require("../../common/time");
let JobsService = class JobsService {
    prisma;
    notifications;
    calendar;
    attendance;
    files;
    log = new common_1.Logger('Jobs');
    timer;
    running = false;
    constructor(prisma, notifications, calendar, attendance, files) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.calendar = calendar;
        this.attendance = attendance;
        this.files = files;
    }
    onModuleInit() {
        if (process.env.JOBS_ENABLED === 'false' || process.env.NODE_ENV === 'test')
            return;
        this.timer = setInterval(() => void this.tick(), 60_000);
        this.timer.unref();
        setTimeout(() => void this.tick(), 15_000).unref();
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
    async tick() {
        if (this.running)
            return;
        this.running = true;
        try {
            await this.attendance.runJobs().catch((e) => this.log.error(`attendance jobs: ${e?.message ?? e}`));
            await this.reportReminders();
            await this.missingReportDigest();
            await this.meetingReminders();
            await this.ensureDailyMeetings();
            await this.dailyCleanup();
        }
        catch (e) {
            this.log.error(`tick failed: ${e?.message ?? e}`);
        }
        finally {
            this.running = false;
        }
    }
    async reportReminders() {
        const today = (0, time_1.dayStr)();
        if (!(await this.calendar.isWorkingDay(today)))
            return;
        const deadline = await this.calendar.deadlineMinutes();
        const now = (0, time_1.minutesOfDay)();
        if (now < deadline - 30 || now >= deadline)
            return;
        const { start } = (0, time_1.dayRange)(today);
        const members = await this.prisma.user.findMany({
            where: { isActive: true, role: { not: 'ADMIN' }, createdAt: { lt: start } },
            select: { id: true },
        });
        if (!members.length)
            return;
        const ids = members.map((m) => m.id);
        const [reported, reminded] = await Promise.all([
            this.prisma.dailyReport.findMany({ where: { reportDate: (0, time_1.dayToDate)(today), userId: { in: ids } }, select: { userId: true } }),
            this.prisma.notification.findMany({ where: { type: 'REPORT_REMINDER', userId: { in: ids }, createdAt: { gte: start } }, select: { userId: true } }),
        ]);
        const skip = new Set([...reported.map((r) => r.userId), ...reminded.map((r) => r.userId)]);
        const targets = ids.filter((id) => !skip.has(id));
        if (!targets.length)
            return;
        const hh = String(Math.floor(deadline / 60)).padStart(2, '0');
        const mm = String(deadline % 60).padStart(2, '0');
        await this.notifications.notify(targets, {
            type: 'REPORT_REMINDER', title: 'Daily report due soon', body: `Submit your update before ${hh}:${mm}.`, link: '/reports',
        });
        this.log.log(`report reminder sent to ${targets.length} people`);
    }
    async missingReportDigest() {
        const today = (0, time_1.dayStr)();
        if (!(await this.calendar.isWorkingDay(today)))
            return;
        const deadline = await this.calendar.deadlineMinutes();
        const now = (0, time_1.minutesOfDay)();
        if (now < deadline + 15 || now >= deadline + 180)
            return;
        const { start } = (0, time_1.dayRange)(today);
        const teams = await this.prisma.team.findMany({ select: { id: true, name: true, leadId: true, coordinatorId: true } });
        for (const t of teams) {
            const recipients = [t.leadId, t.coordinatorId].filter((x) => Boolean(x));
            if (!recipients.length)
                continue;
            const already = await this.prisma.notification.count({ where: { type: 'REPORT_MISSING', userId: { in: recipients }, createdAt: { gte: start }, link: `/reports?team=${t.id}` } });
            if (already)
                continue;
            const members = await this.prisma.user.findMany({
                where: { teamId: t.id, isActive: true, role: { not: 'ADMIN' }, createdAt: { lt: start } }, select: { id: true, displayName: true },
            });
            if (!members.length)
                continue;
            const reported = new Set((await this.prisma.dailyReport.findMany({ where: { reportDate: (0, time_1.dayToDate)(today), userId: { in: members.map((m) => m.id) } }, select: { userId: true } })).map((r) => r.userId));
            const missing = members.filter((m) => !reported.has(m.id));
            if (!missing.length)
                continue;
            const names = missing.slice(0, 6).map((m) => m.displayName).join(', ') + (missing.length > 6 ? ` +${missing.length - 6} more` : '');
            await this.notifications.notify(recipients, {
                type: 'REPORT_MISSING', title: `${missing.length} missing report${missing.length > 1 ? 's' : ''} in ${t.name}`, body: names, link: `/reports?team=${t.id}`,
            });
        }
    }
    async meetingReminders() {
        const now = new Date();
        const horizon = new Date(now.getTime() + 15 * 60_000);
        const upcoming = await this.prisma.meeting.findMany({
            where: { startsAt: { gt: now, lte: horizon } },
            select: { id: true, title: true, teamId: true, startsAt: true },
        });
        for (const m of upcoming) {
            const link = `/dashboard?meeting=${m.id}`;
            const already = await this.prisma.notification.count({ where: { type: 'MEETING_REMINDER', link } });
            if (already)
                continue;
            const members = await this.prisma.user.findMany({
                where: { isActive: true, ...(m.teamId ? { teamId: m.teamId } : { role: { not: 'ADMIN' } }) },
                select: { id: true },
            });
            if (!members.length)
                continue;
            const at = m.startsAt.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            await this.notifications.notify(members.map((x) => x.id), {
                type: 'MEETING_REMINDER', title: `Meeting in 15 min: ${m.title}`, body: `Starts at ${at}. Open Meetings on your dashboard to join.`, link,
            });
            this.log.log(`meeting reminder sent for "${m.title}" to ${members.length} people`);
        }
    }
    async ensureDailyMeetings() {
        const today = (0, time_1.dayStr)();
        const { start, end } = (0, time_1.dayRange)(today);
        const templates = await this.prisma.meeting.findMany({ where: { recurrence: 'DAILY' } });
        for (const t of templates) {
            const hm = new Intl.DateTimeFormat('en-GB', { timeZone: time_1.APP_TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(t.startsAt);
            const [hh, mm] = hm.split(':').map(Number);
            const at = new Date(start.getTime() + (hh * 60 + mm) * 60_000);
            const exists = await this.prisma.meeting.findFirst({ where: { parentId: t.id, startsAt: { gte: start, lt: end } }, select: { id: true } });
            if (exists)
                continue;
            await this.prisma.meeting.create({
                data: { teamId: t.teamId, title: t.title, meetUrl: t.meetUrl, startsAt: at, recurrence: 'NONE', parentId: t.id, createdById: t.createdById },
            });
            this.log.log(`materialized daily meeting "${t.title}" for ${today}`);
        }
    }
    async dailyCleanup() {
        if ((0, time_1.minutesOfDay)() < 120)
            return;
        const today = (0, time_1.dayStr)();
        const marker = await this.prisma.setting.findUnique({ where: { key: 'lastCleanupDay' } });
        if (marker?.value?.day === today)
            return;
        const days = (n) => new Date(Date.now() - n * 86_400_000);
        const [n1, n2, n3, n4] = await Promise.all([
            this.prisma.notification.deleteMany({ where: { isRead: true, createdAt: { lt: days(45) } } }),
            this.prisma.notification.deleteMany({ where: { createdAt: { lt: days(180) } } }),
            this.prisma.auditLog.deleteMany({ where: { createdAt: { lt: days(Number(process.env.AUDIT_RETENTION_DAYS ?? 365)) } } }),
            this.prisma.refreshToken.deleteMany({ where: { OR: [{ expiresAt: { lt: days(7) } }, { revokedAt: { lt: days(7) } }] } }),
        ]);
        await this.prisma.setting.upsert({ where: { key: 'lastCleanupDay' }, update: { value: { day: today } }, create: { key: 'lastCleanupDay', value: { day: today } } });
        const f = await this.files.sweep().catch((e) => { this.log.error(`file sweep: ${e?.message ?? e}`); return null; });
        if (f)
            this.log.log(`files: abandoned ${f.abandoned}, purged ${f.purged}, tmp ${f.tmpRemoved}`);
        this.log.log(`cleanup: notifications ${n1.count + n2.count}, audit ${n3.count}, tokens ${n4.count}`);
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        work_calendar_service_1.WorkCalendarService,
        attendance_service_1.AttendanceService,
        files_service_1.FilesService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map