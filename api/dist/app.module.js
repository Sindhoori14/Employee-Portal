"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const teams_module_1 = require("./modules/teams/teams.module");
const batches_module_1 = require("./modules/batches/batches.module");
const goals_module_1 = require("./modules/goals/goals.module");
const projects_module_1 = require("./modules/projects/projects.module");
const tickets_module_1 = require("./modules/tickets/tickets.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const learning_module_1 = require("./modules/learning/learning.module");
const reports_module_1 = require("./modules/reports/reports.module");
const insights_module_1 = require("./modules/insights/insights.module");
const comms_module_1 = require("./modules/comms/comms.module");
const health_module_1 = require("./modules/health/health.module");
const audit_module_1 = require("./modules/audit/audit.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const user_throttler_guard_1 = require("./common/guards/user-throttler.guard");
const common_module_1 = require("./common/common.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const files_module_1 = require("./modules/files/files.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const admin_module_1 = require("./modules/admin/admin.module");
const workplace_module_1 = require("./modules/workplace/workplace.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 600 }]),
            common_module_1.CommonModule,
            prisma_module_1.PrismaModule,
            audit_module_1.AuditModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            teams_module_1.TeamsModule,
            batches_module_1.BatchesModule,
            goals_module_1.GoalsModule,
            projects_module_1.ProjectsModule,
            tickets_module_1.TicketsModule,
            tasks_module_1.TasksModule,
            learning_module_1.LearningModule,
            reports_module_1.ReportsModule,
            insights_module_1.InsightsModule,
            comms_module_1.CommsModule,
            health_module_1.HealthModule,
            files_module_1.FilesModule,
            attendance_module_1.AttendanceModule,
            jobs_module_1.JobsModule,
            admin_module_1.AdminModule,
            workplace_module_1.WorkplaceModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: user_throttler_guard_1.UserThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map