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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const prisma_service_1 = require("../../prisma/prisma.service");
const insights_service_1 = require("./insights.service");
const MAX_ROWS = 5000;
function d(v) {
    const x = new Date(v);
    if (Number.isNaN(x.getTime()))
        throw new common_1.BadRequestException(`Invalid date: ${v}`);
    return x;
}
function csvCell(v) {
    let s = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s))
        s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function csv(rows) {
    return '\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}
function pdfTable(title, filters, headers, rows) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.fontSize(16).text(title);
        doc.fontSize(9).fillColor('gray').text(`TeamFlow export · ${(0, insights_service_1.istDay)(new Date())}${filters ? ` · ${filters}` : ''}`);
        doc.moveDown().fillColor('black');
        const colW = Math.min(170, Math.floor(515 / Math.max(1, headers.length)));
        doc.fontSize(9);
        headers.forEach((h, i) => {
            doc.text(h, 40 + i * colW, doc.y, { width: colW, continued: i < headers.length - 1 });
        });
        doc.moveDown(0.5);
        doc.fontSize(8);
        for (const row of rows.slice(0, 500)) {
            if (doc.y > 740)
                doc.addPage();
            row.forEach((cell, i) => {
                doc.text(String(cell).slice(0, 60), 40 + i * colW, doc.y, { width: colW, continued: i < row.length - 1 });
            });
            doc.moveDown(0.4);
        }
        doc.end();
    });
}
let ExportsService = class ExportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    taskScope(me, teamId) {
        if (me.role === 'EMPLOYEE')
            throw new common_1.ForbiddenException('Export not available for your role');
        if (me.role === 'COORDINATOR') {
            if (!me.teamId)
                throw new common_1.ForbiddenException('You are not assigned to a team');
            if (teamId && teamId !== me.teamId)
                throw new common_1.ForbiddenException('Outside your team');
            return { teamId: me.teamId };
        }
        return teamId ? { teamId } : {};
    }
    async tasksCsv(me, q) {
        const where = this.taskScope(me, q.teamId);
        if (q.status)
            where.status = q.status;
        if (q.from || q.to)
            where.createdAt = { ...(q.from ? { gte: d(q.from) } : {}), ...(q.to ? { lte: d(q.to) } : {}) };
        const rows = await this.prisma.task.findMany({
            where, take: MAX_ROWS, orderBy: { createdAt: 'desc' },
            include: { owner: { select: { displayName: true, email: true } }, team: { select: { name: true } } },
        });
        const data = [['Title', 'Status', 'Priority', 'Owner', 'Owner email', 'Team', 'Due date', 'Est hours', 'Created']];
        for (const t of rows) {
            data.push([t.title, t.status, t.priority, t.owner.displayName, t.owner.email, t.team.name, t.dueDate ? (0, insights_service_1.istDay)(t.dueDate) : '', t.estimatedHours?.toString() ?? '', t.createdAt.toISOString()]);
        }
        return { filename: `tasks-${(0, insights_service_1.istDay)(new Date())}.csv`, body: csv(data) };
    }
    async tasksPdf(me, q) {
        const where = this.taskScope(me, q.teamId);
        if (q.status)
            where.status = q.status;
        if (q.from || q.to)
            where.createdAt = { ...(q.from ? { gte: d(q.from) } : {}), ...(q.to ? { lte: d(q.to) } : {}) };
        const rows = await this.prisma.task.findMany({
            where, take: 500, orderBy: { createdAt: 'desc' },
            include: { owner: { select: { displayName: true } }, team: { select: { name: true } } },
        });
        const filter = [q.teamId && `team=${q.teamId}`, q.status && `status=${q.status}`, q.from && `from=${q.from}`, q.to && `to=${q.to}`].filter(Boolean).join(' ');
        const buf = await pdfTable('Tasks report', filter, ['Title', 'Status', 'Owner', 'Team', 'Due'], rows.map((t) => [t.title, t.status, t.owner.displayName, t.team.name, t.dueDate ? (0, insights_service_1.istDay)(t.dueDate) : '—']));
        return { filename: `tasks-${(0, insights_service_1.istDay)(new Date())}.pdf`, body: buf };
    }
    async reportsCsv(me, q) {
        if (me.role === 'EMPLOYEE')
            throw new common_1.ForbiddenException('Export not available for your role');
        const where = {};
        if (q.date)
            where.reportDate = d(q.date);
        else if (q.from || q.to)
            where.reportDate = { ...(q.from ? { gte: d(q.from) } : {}), ...(q.to ? { lte: d(q.to) } : {}) };
        if (me.role === 'COORDINATOR') {
            if (!me.teamId)
                throw new common_1.ForbiddenException('You are not assigned to a team');
            if (q.teamId && q.teamId !== me.teamId)
                throw new common_1.ForbiddenException('Outside your team');
            where.teamId = me.teamId;
        }
        else if (q.teamId)
            where.teamId = q.teamId;
        const rows = await this.prisma.dailyReport.findMany({
            where, take: MAX_ROWS, orderBy: { reportDate: 'desc' },
            include: { user: { select: { displayName: true, email: true } } },
        });
        const data = [['Date', 'User', 'Email', 'Hours', 'Late', 'Did', 'Plan']];
        for (const r of rows) {
            data.push([(0, insights_service_1.istDay)(r.reportDate), r.user.displayName, r.user.email, String(r.hoursWorked), r.isLate ? 'yes' : 'no', r.didToday.slice(0, 200), r.planTomorrow.slice(0, 200)]);
        }
        return { filename: `reports-${(0, insights_service_1.istDay)(new Date())}.csv`, body: csv(data) };
    }
    async reportsPdf(me, q) {
        if (me.role === 'EMPLOYEE')
            throw new common_1.ForbiddenException('Export not available for your role');
        const where = {};
        if (q.date)
            where.reportDate = d(q.date);
        else if (q.from || q.to)
            where.reportDate = { ...(q.from ? { gte: d(q.from) } : {}), ...(q.to ? { lte: d(q.to) } : {}) };
        if (me.role === 'COORDINATOR') {
            if (!me.teamId)
                throw new common_1.ForbiddenException('You are not assigned to a team');
            if (q.teamId && q.teamId !== me.teamId)
                throw new common_1.ForbiddenException('Outside your team');
            where.teamId = me.teamId;
        }
        else if (q.teamId)
            where.teamId = q.teamId;
        const rows = await this.prisma.dailyReport.findMany({
            where, take: 500, orderBy: { reportDate: 'desc' },
            include: { user: { select: { displayName: true } } },
        });
        const filter = [q.date && `date=${q.date}`, q.teamId && `team=${q.teamId}`].filter(Boolean).join(' ');
        const buf = await pdfTable('Daily reports', filter, ['Date', 'User', 'Hours', 'Late', 'Did'], rows.map((r) => [(0, insights_service_1.istDay)(r.reportDate), r.user.displayName, String(r.hoursWorked), r.isLate ? 'yes' : 'no', r.didToday.slice(0, 80)]));
        return { filename: `reports-${(0, insights_service_1.istDay)(new Date())}.pdf`, body: buf };
    }
};
exports.ExportsService = ExportsService;
exports.ExportsService = ExportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportsService);
//# sourceMappingURL=exports.service.js.map