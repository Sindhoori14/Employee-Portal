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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const insights_service_1 = require("./insights.service");
const exports_service_1 = require("./exports.service");
let InsightsController = class InsightsController {
    insights;
    exports;
    constructor(insights, exports) {
        this.insights = insights;
        this.exports = exports;
    }
    admin() {
        return this.insights.adminOverview();
    }
    lead(me, teamId) {
        return this.insights.leadOverview(me, teamId);
    }
    coordinator(me, teamId) {
        return this.insights.coordinatorToday(me, teamId);
    }
    attention(me, teamId) {
        return this.insights.attention(me, teamId);
    }
    me(me) {
        return this.insights.mySummary(me);
    }
    async tasksCsv(me, teamId, status, from, to, res) {
        const out = await this.exports.tasksCsv(me, { teamId: teamId || undefined, status: status || undefined, from: from || undefined, to: to || undefined });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`);
        res.send(out.body);
    }
    async tasksPdf(me, teamId, status, from, to, res) {
        const out = await this.exports.tasksPdf(me, { teamId: teamId || undefined, status: status || undefined, from: from || undefined, to: to || undefined });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`);
        res.send(out.body);
    }
    async reportsCsv(me, date, teamId, from, to, res) {
        const out = await this.exports.reportsCsv(me, { date: date || undefined, teamId: teamId || undefined, from: from || undefined, to: to || undefined });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`);
        res.send(out.body);
    }
    async reportsPdf(me, date, teamId, from, to, res) {
        const out = await this.exports.reportsPdf(me, { date: date || undefined, teamId: teamId || undefined, from: from || undefined, to: to || undefined });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`);
        res.send(out.body);
    }
};
exports.InsightsController = InsightsController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)('dashboard/admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InsightsController.prototype, "admin", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Get)('dashboard/lead'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InsightsController.prototype, "lead", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD', 'COORDINATOR'),
    (0, common_1.Get)('dashboard/coordinator'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InsightsController.prototype, "coordinator", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD', 'COORDINATOR'),
    (0, common_1.Get)('dashboard/attention'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InsightsController.prototype, "attention", null);
__decorate([
    (0, common_1.Get)('dashboard/me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InsightsController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('exports/tasks.csv'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('teamId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], InsightsController.prototype, "tasksCsv", null);
__decorate([
    (0, common_1.Get)('exports/tasks.pdf'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('teamId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], InsightsController.prototype, "tasksPdf", null);
__decorate([
    (0, common_1.Get)('exports/reports.csv'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('teamId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], InsightsController.prototype, "reportsCsv", null);
__decorate([
    (0, common_1.Get)('exports/reports.pdf'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('teamId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], InsightsController.prototype, "reportsPdf", null);
exports.InsightsController = InsightsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [insights_service_1.InsightsService, exports_service_1.ExportsService])
], InsightsController);
//# sourceMappingURL=insights.controller.js.map