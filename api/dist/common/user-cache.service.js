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
exports.UserCacheService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UserCacheService = class UserCacheService {
    prisma;
    map = new Map();
    ttlMs = 15_000;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(id) {
        const hit = this.map.get(id);
        const now = Date.now();
        if (hit && hit.exp > now)
            return hit.u;
        const row = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, displayName: true, role: true, teamId: true, batchId: true, isActive: true, mustChangePassword: true },
        });
        const u = row;
        if (this.map.size > 5000)
            this.map.clear();
        this.map.set(id, { u, exp: now + this.ttlMs });
        return u;
    }
    invalidate(id) {
        if (id)
            this.map.delete(id);
        else
            this.map.clear();
    }
};
exports.UserCacheService = UserCacheService;
exports.UserCacheService = UserCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserCacheService);
//# sourceMappingURL=user-cache.service.js.map