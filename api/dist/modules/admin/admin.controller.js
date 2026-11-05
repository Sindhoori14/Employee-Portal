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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../comms/realtime.gateway");
const files_service_1 = require("../files/files.service");
const time_1 = require("../../common/time");
let AdminController = class AdminController {
    prisma;
    gateway;
    files;
    constructor(prisma, gateway, files) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.files = files;
    }
    async audit(pageQ, limitQ, action, entity, actorId, from, to) {
        const page = Math.max(1, Number(pageQ) || 1);
        const limit = Math.min(100, Math.max(1, Number(limitQ) || 50));
        const where = {};
        if (action)
            where.action = { contains: action.slice(0, 60).toUpperCase() };
        if (entity)
            where.entity = entity.slice(0, 60);
        if (actorId)
            where.actorId = actorId;
        if (from || to) {
            if ((from && !(0, time_1.isValidDay)(from)) || (to && !(0, time_1.isValidDay)(to)))
                throw new common_1.BadRequestException('from/to must be YYYY-MM-DD');
            where.createdAt = { ...(from ? { gte: (0, time_1.dayRange)(from).start } : {}), ...(to ? { lt: (0, time_1.dayRange)(to).end } : {}) };
        }
        const [total, rows] = await Promise.all([
            this.prisma.auditLog.count({ where }),
            this.prisma.auditLog.findMany({
                where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
                include: { actor: { select: { id: true, displayName: true, email: true } } },
            }),
        ]);
        return { data: rows, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
    }
    async system() {
        const [dbSize, users, tasks, reports, audit] = await Promise.all([
            this.prisma.$queryRaw `SELECT pg_database_size(current_database()) AS size`,
            this.prisma.user.count(),
            this.prisma.task.count(),
            this.prisma.dailyReport.count(),
            this.prisma.auditLog.count(),
        ]);
        const storage = await this.files.stats();
        const mem = process.memoryUsage();
        return {
            uptimeSec: Math.round(process.uptime()),
            node: process.version,
            onlineUsers: this.gateway.onlineCount(),
            dbSizeMb: Math.round(Number(dbSize[0]?.size ?? 0) / 1048576),
            memoryMb: Math.round(mem.rss / 1048576),
            counts: { users, tasks, reports, auditLogs: audit },
            storage,
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('audit'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('entity')),
    __param(4, (0, common_1.Query)('actorId')),
    __param(5, (0, common_1.Query)('from')),
    __param(6, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "audit", null);
__decorate([
    (0, common_1.Get)('system'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "system", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, realtime_gateway_1.RealtimeGateway, files_service_1.FilesService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map