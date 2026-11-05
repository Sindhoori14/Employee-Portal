"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
exports.authCookies = authCookies;
exports.clearAuthCookies = clearAuthCookies;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const user_cache_service_1 = require("../../common/user-cache.service");
const report_gate_service_1 = require("../../common/report-gate.service");
const ACCESS_MINUTES = 15;
const REFRESH_DAYS = 30;
function sha256(s) {
    return crypto.createHash('sha256').update(s).digest('hex');
}
function passwordOk(pw) {
    return pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
}
function authCookies(res, access, refresh, refreshExp) {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('access', access, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        maxAge: ACCESS_MINUTES * 60 * 1000,
        path: '/',
    });
    if (refresh && refreshExp) {
        res.cookie('refresh', refresh, {
            httpOnly: true,
            sameSite: 'lax',
            secure,
            expires: refreshExp,
            path: '/',
        });
    }
}
function clearAuthCookies(res) {
    res.clearCookie('access', { path: '/' });
    res.clearCookie('refresh', { path: '/' });
}
let AuthService = class AuthService {
    static { AuthService_1 = this; }
    prisma;
    jwt;
    audit;
    cache;
    reportGate;
    constructor(prisma, jwt, audit, cache, reportGate) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.audit = audit;
        this.cache = cache;
        this.reportGate = reportGate;
    }
    dummyHash = argon2.hash('timing-equalizer-not-a-real-password');
    accessToken(userId, role) {
        return this.jwt.signAsync({ sub: userId, role }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: `${ACCESS_MINUTES}m` });
    }
    fails = new Map();
    static MAX_FAILS = 8;
    static WINDOW_MS = 15 * 60_000;
    assertNotLocked(email) {
        const f = this.fails.get(email);
        if (f && f.until > Date.now()) {
            throw new common_1.HttpException('Too many failed attempts. Try again in a few minutes or ask your admin to reset your password.', 429);
        }
    }
    recordFail(email) {
        const now = Date.now();
        let f = this.fails.get(email);
        if (!f || now - f.first > AuthService_1.WINDOW_MS)
            f = { n: 0, first: now, until: 0 };
        f.n++;
        if (f.n >= AuthService_1.MAX_FAILS)
            f.until = now + AuthService_1.WINDOW_MS;
        this.fails.set(email, f);
        if (this.fails.size > 10_000)
            this.fails.clear();
    }
    async login(email, password, ip, ua) {
        this.assertNotLocked(email);
        const user = await this.prisma.user.findUnique({ where: { email } });
        const hash = user?.passwordHash ?? (await this.dummyHash);
        const ok = await argon2.verify(hash, password).catch(() => false);
        if (!user || !user.isActive || !ok) {
            this.recordFail(email);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.fails.delete(email);
        const access = await this.accessToken(user.id, user.role);
        const rawRefresh = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 3600 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: sha256(rawRefresh),
                expiresAt,
                ip: ip?.slice(0, 45) ?? null,
                userAgent: ua?.slice(0, 500) ?? null,
            },
        });
        await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        await this.audit.log({ actorId: user.id, action: 'LOGIN', entity: 'user', entityId: user.id, ip });
        return { access, rawRefresh, refreshExp: expiresAt, user };
    }
    async refresh(rawRefresh, ip) {
        if (!rawRefresh)
            throw new common_1.UnauthorizedException('Missing refresh token');
        const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash: sha256(rawRefresh) } });
        if (!row)
            throw new common_1.UnauthorizedException('Invalid session');
        if (row.revokedAt) {
            if (Date.now() - row.revokedAt.getTime() > 30_000) {
                await this.prisma.refreshToken.updateMany({ where: { userId: row.userId, revokedAt: null }, data: { revokedAt: new Date() } });
                await this.audit.log({ actorId: row.userId, action: 'REFRESH_REUSE_DETECTED', entity: 'user', entityId: row.userId, ip });
            }
            throw new common_1.UnauthorizedException('Invalid session');
        }
        if (row.expiresAt < new Date())
            throw new common_1.UnauthorizedException('Invalid session');
        const user = await this.prisma.user.findUnique({ where: { id: row.userId } });
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Account inactive');
        await this.prisma.refreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });
        const access = await this.accessToken(user.id, user.role);
        const next = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 3600 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId: user.id, tokenHash: sha256(next), expiresAt, ip: ip?.slice(0, 45) ?? null },
        });
        return { access, rawRefresh: next, refreshExp: expiresAt, user };
    }
    async logout(rawRefresh, me) {
        if (!rawRefresh)
            return;
        const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash: sha256(rawRefresh) }, select: { userId: true } });
        const userId = me?.id ?? row?.userId;
        let role = me?.role;
        if (userId && !role) {
            role = (await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } }))?.role ?? undefined;
        }
        if (userId && role)
            await this.reportGate.assert(userId, role, 'LOG_OUT');
        await this.prisma.refreshToken
            .update({ where: { tokenHash: sha256(rawRefresh) }, data: { revokedAt: new Date() } })
            .catch(() => null);
    }
    async changePassword(userId, current, next, ip) {
        if (!passwordOk(next))
            throw new common_1.BadRequestException('Password must be 8+ chars with letter and number');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('Account not found');
        const ok = await argon2.verify(user.passwordHash, current).catch(() => false);
        if (!ok)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: await argon2.hash(next), mustChangePassword: false },
        });
        await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
        this.cache.invalidate(userId);
        await this.audit.log({ actorId: userId, action: 'PASSWORD_CHANGE', entity: 'user', entityId: userId, ip });
    }
    async forgot(email, ip) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && user.isActive) {
            const recent = await this.prisma.notification.count({
                where: { type: 'PASSWORD_RESET_REQUEST', link: `/users?focus=${user.id}`, createdAt: { gt: new Date(Date.now() - 15 * 60_000) } },
            });
            if (recent === 0) {
                const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { id: true } });
                if (admins.length) {
                    await this.prisma.notification.createMany({
                        data: admins.map((a) => ({
                            userId: a.id, type: 'PASSWORD_RESET_REQUEST',
                            title: `Password reset requested: ${user.displayName}`,
                            body: `${user.email} asked for a password reset. Verify it is really them, then issue a temporary password.`,
                            link: `/users?focus=${user.id}`,
                        })),
                    });
                }
                await this.audit.log({ actorId: user.id, action: 'PASSWORD_RESET_REQUESTED', entity: 'user', entityId: user.id, ip });
            }
        }
        return { ok: true };
    }
    sanitize(user) {
        const { passwordHash: _p, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        audit_service_1.AuditService,
        user_cache_service_1.UserCacheService,
        report_gate_service_1.ReportGateService])
], AuthService);
//# sourceMappingURL=auth.service.js.map