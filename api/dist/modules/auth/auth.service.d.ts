import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UserCacheService } from '../../common/user-cache.service';
import { ReportGateService } from '../../common/report-gate.service';
export declare function authCookies(res: Response, access: string, refresh: string | null, refreshExp: Date | null): void;
export declare function clearAuthCookies(res: Response): void;
export declare class AuthService {
    private prisma;
    private jwt;
    private audit;
    private cache;
    private reportGate;
    constructor(prisma: PrismaService, jwt: JwtService, audit: AuditService, cache: UserCacheService, reportGate: ReportGateService);
    private dummyHash;
    private accessToken;
    private fails;
    private static readonly MAX_FAILS;
    private static readonly WINDOW_MS;
    private assertNotLocked;
    private recordFail;
    login(email: string, password: string, ip: string | undefined, ua: string | undefined): Promise<{
        access: string;
        rawRefresh: string;
        refreshExp: Date;
        user: {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            mustChangePassword: boolean;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
            isActive: boolean;
            teamId: string | null;
            batchId: string | null;
            lastLoginAt: Date | null;
            avatarFileId: string | null;
            deactivatedAt: Date | null;
            updatedAt: Date;
        };
    }>;
    refresh(rawRefresh: string | undefined, ip: string | undefined): Promise<{
        access: string;
        rawRefresh: string;
        refreshExp: Date;
        user: {
            id: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
            mustChangePassword: boolean;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
            isActive: boolean;
            teamId: string | null;
            batchId: string | null;
            lastLoginAt: Date | null;
            avatarFileId: string | null;
            deactivatedAt: Date | null;
            updatedAt: Date;
        };
    }>;
    logout(rawRefresh: string | undefined, me?: {
        id: string;
        role: string;
    }): Promise<void>;
    changePassword(userId: string, current: string, next: string, ip?: string): Promise<void>;
    forgot(email: string, ip?: string): Promise<{
        ok: boolean;
    }>;
    sanitize(user: any): any;
}
