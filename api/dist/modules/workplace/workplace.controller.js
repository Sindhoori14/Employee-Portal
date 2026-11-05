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
exports.WorkplaceController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const workplace_service_1 = require("./workplace.service");
const workplace_dto_1 = require("./dto/workplace.dto");
let WorkplaceController = class WorkplaceController {
    work;
    constructor(work) {
        this.work = work;
    }
    ip(req) {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? req.ip;
    }
    createMeeting(me, dto, req) {
        return this.work.createMeeting(me, dto, this.ip(req));
    }
    meetings(me, scope) {
        return this.work.listMeetings(me, scope ?? 'upcoming');
    }
    deleteMeeting(me, id, req) {
        return this.work.deleteMeeting(me, id, this.ip(req));
    }
    saveNote(me, id, dto, req) {
        return this.work.saveNote(me, id, dto.note, this.ip(req));
    }
    calendar(me, month) {
        return this.work.monthView(me, month);
    }
    request(me, dto, req) {
        return this.work.requestLeave(me, dto, this.ip(req));
    }
    mine(me) {
        return this.work.mine(me);
    }
    pending(me) {
        return this.work.pending(me);
    }
    onLeaveToday(me) {
        return this.work.onLeaveToday(me);
    }
    stats(me) {
        return this.work.getStats(me);
    }
    listAll(me, q) {
        return this.work.listLeaves(me, q);
    }
    approve(me, id, dto, req) {
        return this.work.decide(me, id, true, dto.note, this.ip(req));
    }
    reject(me, id, dto, req) {
        return this.work.decide(me, id, false, dto.note, this.ip(req));
    }
    cancel(me, id, req) {
        return this.work.cancel(me, id, this.ip(req));
    }
    revoke(me, id, req) {
        return this.work.revoke(me, id, this.ip(req));
    }
};
exports.WorkplaceController = WorkplaceController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('meetings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, workplace_dto_1.CreateMeetingDto, Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "createMeeting", null);
__decorate([
    (0, common_1.Get)('meetings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('scope')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "meetings", null);
__decorate([
    (0, common_1.Delete)('meetings/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "deleteMeeting", null);
__decorate([
    (0, common_1.Patch)('meetings/:id/note'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, workplace_dto_1.UpdateMeetingNoteDto, Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "saveNote", null);
__decorate([
    (0, common_1.Get)('calendar'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "calendar", null);
__decorate([
    (0, common_1.Post)('leaves'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, workplace_dto_1.RequestLeaveDto, Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "request", null);
__decorate([
    (0, common_1.Get)('leaves/mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "mine", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD', 'COORDINATOR'),
    (0, common_1.Get)('leaves/pending'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "pending", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD', 'COORDINATOR'),
    (0, common_1.Get)('leaves/on-leave-today'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "onLeaveToday", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD', 'COORDINATOR'),
    (0, common_1.Get)('leaves/stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "stats", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD', 'COORDINATOR'),
    (0, common_1.Get)('leaves'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, workplace_dto_1.ListLeavesDto]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "listAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('leaves/:id/approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, workplace_dto_1.DecideLeaveDto, Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "approve", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('leaves/:id/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, workplace_dto_1.DecideLeaveDto, Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('leaves/:id/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "cancel", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('leaves/:id/revoke'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WorkplaceController.prototype, "revoke", null);
exports.WorkplaceController = WorkplaceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [workplace_service_1.WorkplaceService])
], WorkplaceController);
//# sourceMappingURL=workplace.controller.js.map