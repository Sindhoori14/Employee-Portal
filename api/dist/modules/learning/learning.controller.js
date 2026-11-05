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
exports.LearningController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const learning_service_1 = require("./learning.service");
const learning_dto_1 = require("./dto/learning.dto");
let LearningController = class LearningController {
    learning;
    constructor(learning) {
        this.learning = learning;
    }
    ip(req) {
        return req.ip;
    }
    createPlan(me, dto, req) {
        return this.learning.createPlan(me, dto, this.ip(req));
    }
    plans(me, batchId) {
        return this.learning.listPlans(me, batchId);
    }
    plan(id, me) {
        return this.learning.getPlan(id, me);
    }
    updatePlan(me, id, dto, req) {
        return this.learning.updatePlan(me, id, dto, this.ip(req));
    }
    addItem(me, id, dto, req) {
        return this.learning.addItem(me, id, dto, this.ip(req));
    }
    updateItem(me, id, dto) {
        return this.learning.updateItem(me, id, dto);
    }
    deleteItem(me, id, req) {
        return this.learning.deleteItem(me, id, this.ip(req));
    }
    addMaterial(me, id, dto) {
        return this.learning.addMaterial(me, id, dto);
    }
    deleteMaterial(me, id) {
        return this.learning.deleteMaterial(me, id);
    }
    progress(me, id, dto) {
        return this.learning.setProgress(me, id, dto.isDone ?? true);
    }
    batchProgress(me, id) {
        return this.learning.batchProgress(me, id);
    }
    createAssessment(me, dto, req) {
        return this.learning.createAssessment(me, dto, this.ip(req));
    }
    assessments(me, batchId) {
        return this.learning.listAssessments(me, batchId);
    }
    assessment(id, me) {
        return this.learning.getAssessment(id, me);
    }
    addQuestion(me, id, dto) {
        return this.learning.addQuestion(me, id, dto);
    }
    deleteQuestion(me, id) {
        return this.learning.deleteQuestion(me, id);
    }
    submit(me, id, dto, req) {
        return this.learning.submit(me, id, dto, this.ip(req));
    }
    mine(me, id) {
        return this.learning.myAttempts(me, id);
    }
    all(me, id) {
        return this.learning.allAttempts(me, id);
    }
    grade(me, id, dto, req) {
        return this.learning.grade(me, id, dto, this.ip(req));
    }
};
exports.LearningController = LearningController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('training-plans'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, learning_dto_1.CreatePlanDto, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('training-plans'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "plans", null);
__decorate([
    (0, common_1.Get)('training-plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "plan", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Patch)('training-plans/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, learning_dto_1.UpdatePlanDto, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "updatePlan", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('training-plans/:id/items'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, learning_dto_1.CreateItemDto, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "addItem", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Patch)('training-items/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, learning_dto_1.UpdateItemDto]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "updateItem", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Delete)('training-items/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "deleteItem", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('training-items/:id/materials'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, learning_dto_1.CreateMaterialDto]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "addMaterial", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Delete)('training-materials/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "deleteMaterial", null);
__decorate([
    (0, common_1.Post)('training-items/:id/progress'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, learning_dto_1.SetProgressDto]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "progress", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD', 'COORDINATOR'),
    (0, common_1.Get)('training-plans/:id/batch-progress'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "batchProgress", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('assessments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, learning_dto_1.CreateAssessmentDto, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "createAssessment", null);
__decorate([
    (0, common_1.Get)('assessments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "assessments", null);
__decorate([
    (0, common_1.Get)('assessments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "assessment", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('assessments/:id/questions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, learning_dto_1.CreateQuestionDto]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "addQuestion", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Delete)('assessment-questions/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "deleteQuestion", null);
__decorate([
    (0, common_1.Post)('assessments/:id/attempts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, learning_dto_1.SubmitAttemptDto, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('assessments/:id/my-attempts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "mine", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Get)('assessments/:id/attempts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "all", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD'),
    (0, common_1.Post)('assessment-attempts/:id/grade'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, learning_dto_1.GradeAttemptDto, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "grade", null);
exports.LearningController = LearningController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [learning_service_1.LearningService])
], LearningController);
//# sourceMappingURL=learning.controller.js.map