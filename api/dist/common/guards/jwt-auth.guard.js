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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const roles_decorator_1 = require("../decorators/roles.decorator");
const user_cache_service_1 = require("../user-cache.service");
let JwtAuthGuard = class JwtAuthGuard {
    reflector;
    jwt;
    users;
    constructor(reflector, jwt, users) {
        this.reflector = reflector;
        this.jwt = jwt;
        this.users = users;
    }
    async canActivate(ctx) {
        const isPublic = this.reflector.getAllAndOverride(roles_decorator_1.IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
        if (isPublic)
            return true;
        const req = ctx.switchToHttp().getRequest();
        const token = req.cookies?.access ?? this.bearer(req.headers?.authorization);
        if (!token)
            throw new common_1.UnauthorizedException('Not authenticated');
        let payload;
        try {
            payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET });
        }
        catch {
            throw new common_1.UnauthorizedException('Session expired');
        }
        const user = await this.users.get(payload.sub);
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Account inactive');
        req.user = {
            id: user.id, email: user.email, displayName: user.displayName,
            role: user.role, teamId: user.teamId, batchId: user.batchId,
        };
        if (user.mustChangePassword) {
            const path = req.path ?? req.url ?? '';
            const allowed = path.includes('/auth/change-password') || path.includes('/auth/me') ||
                path.includes('/auth/logout') || path.includes('/healthz');
            if (!allowed)
                throw new common_1.ForbiddenException('PASSWORD_CHANGE_REQUIRED');
        }
        return true;
    }
    bearer(h) {
        if (!h)
            return undefined;
        const [scheme, token] = h.split(' ');
        return scheme === 'Bearer' && token ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector, jwt_1.JwtService, user_cache_service_1.UserCacheService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map