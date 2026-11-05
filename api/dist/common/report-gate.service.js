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
exports.ReportGateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const work_calendar_service_1 = require("./work-calendar.service");
const time_1 = require("./time");
let ReportGateService = class ReportGateService {
    prisma;
    calendar;
    constructor(prisma, calendar) {
        this.prisma = prisma;
        this.calendar = calendar;
    }
    async applies(role) {
        const gate = await this.calendar.reportGate();
        return gate.enabled && gate.roles.includes(role);
    }
    hasReportToday(userId) {
        return this.prisma.dailyReport.findUnique({
            where: { userId_reportDate: { userId, reportDate: (0, time_1.dayToDate)((0, time_1.dayStr)()) } },
            select: { id: true },
        });
    }
    async status(userId, role) {
        if (!(await this.applies(role)))
            return { required: false, submitted: true };
        return { required: true, submitted: Boolean(await this.hasReportToday(userId)) };
    }
    async assert(userId, role, action) {
        if (!(await this.applies(role)))
            return;
        if (action === 'LOG_OUT') {
            const rec = await this.prisma.attendanceDay.findUnique({
                where: { userId_day: { userId, day: (0, time_1.dayToDate)((0, time_1.dayStr)()) } },
                select: { checkInAt: true, checkOutAt: true },
            });
            if (!rec?.checkInAt || rec.checkOutAt)
                return;
        }
        if (await this.hasReportToday(userId))
            return;
        throw new common_1.BadRequestException({
            code: 'REPORT_REQUIRED',
            message: action === 'CHECK_OUT'
                ? "Write today's daily report before checking out — open Reports, submit it, then check out."
                : "You can't log out until you write today's daily report — open Reports, submit it, then log out.",
        });
    }
};
exports.ReportGateService = ReportGateService;
exports.ReportGateService = ReportGateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, work_calendar_service_1.WorkCalendarService])
], ReportGateService);
//# sourceMappingURL=report-gate.service.js.map