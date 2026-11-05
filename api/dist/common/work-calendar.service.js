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
exports.WorkCalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const time_1 = require("./time");
const ALL_ROLES = ['ADMIN', 'TEAM_LEAD', 'COORDINATOR', 'EMPLOYEE'];
const DEFAULT_GATE_ROLES = ['EMPLOYEE', 'COORDINATOR', 'TEAM_LEAD'];
let WorkCalendarService = class WorkCalendarService {
    prisma;
    cache = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    invalidate() {
        this.cache = null;
        this.attCache = null;
    }
    attCache = null;
    async attendanceConfig() {
        return (await this.loadAtt()).cfg;
    }
    async photoRequired() {
        return (await this.loadAtt()).photo;
    }
    async reportGate() {
        return (await this.loadAtt()).gate;
    }
    async loadAtt() {
        if (this.attCache && this.attCache.exp > Date.now())
            return this.attCache;
        const rows = await this.prisma.setting.findMany({ where: { key: { in: ['attendance', 'requireProfilePhoto', 'reportGate'] } } });
        const by = new Map(rows.map((r) => [r.key, r.value]));
        const a = (by.get('attendance') ?? {});
        const rg = (by.get('reportGate') ?? {});
        const gateRoles = Array.isArray(rg.roles) ? rg.roles.map(String).filter((r) => ALL_ROLES.includes(r)) : null;
        const toMin = (v, d) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(v ?? d)) ?? /^(\d{1,2}):(\d{2})$/.exec(d); return Number(m[1]) * 60 + Number(m[2]); };
        const num = (v, d) => (Number.isFinite(Number(v)) && v !== undefined && v !== null ? Number(v) : d);
        this.attCache = {
            exp: Date.now() + 60_000,
            photo: by.get('requireProfilePhoto') !== false,
            gate: { enabled: rg.enabled !== false, roles: gateRoles ?? DEFAULT_GATE_ROLES },
            cfg: {
                shiftStart: toMin(a.shiftStart, '09:30'),
                shiftEnd: toMin(a.shiftEnd, '18:30'),
                autoCheckout: toMin(a.autoCheckout, '23:30'),
                graceMinutes: num(a.graceMinutes, 15),
                halfDayMinutes: num(a.halfDayMinutes, 240),
                maxBreakMinutes: num(a.maxBreakMinutes, 60),
                maxSingleBreakMinutes: num(a.maxSingleBreakMinutes, 45),
            },
        };
        return this.attCache;
    }
    async load() {
        if (this.cache && this.cache.exp > Date.now())
            return this.cache;
        const rows = await this.prisma.setting.findMany({ where: { key: { in: ['workDays', 'holidays', 'reportDeadline'] } } });
        const by = new Map(rows.map((r) => [r.key, r.value]));
        const wd = by.get('workDays');
        const hol = by.get('holidays');
        const dl = by.get('reportDeadline');
        const time = String(dl?.time ?? process.env.REPORT_DEADLINE ?? '18:00');
        const m = time.match(/^(\d{1,2}):(\d{2})$/);
        this.cache = {
            exp: Date.now() + 60_000,
            workDays: Array.isArray(wd) && wd.length ? wd.map(Number) : [1, 2, 3, 4, 5, 6],
            holidays: new Set(Array.isArray(hol) ? hol.map(String) : []),
            deadline: m ? Number(m[1]) * 60 + Number(m[2]) : 18 * 60,
        };
        return this.cache;
    }
    async isWorkingDay(day) {
        const c = await this.load();
        return c.workDays.includes((0, time_1.weekday)(day)) && !c.holidays.has(day);
    }
    async deadlineMinutes() {
        return (await this.load()).deadline;
    }
    async holidaySet() {
        return new Set((await this.load()).holidays);
    }
    async isLate(reportDay, today, now = new Date()) {
        if (reportDay < today)
            return true;
        if (reportDay > today)
            return false;
        return (0, time_1.minutesOfDay)(now) > (await this.deadlineMinutes());
    }
};
exports.WorkCalendarService = WorkCalendarService;
exports.WorkCalendarService = WorkCalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkCalendarService);
//# sourceMappingURL=work-calendar.service.js.map