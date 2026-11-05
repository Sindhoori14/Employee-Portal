import { PrismaService } from '../prisma/prisma.service';
export interface CachedUser {
    id: string;
    email: string;
    displayName: string;
    role: 'ADMIN' | 'TEAM_LEAD' | 'COORDINATOR' | 'EMPLOYEE';
    teamId: string | null;
    batchId: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
}
export declare class UserCacheService {
    private prisma;
    private map;
    private readonly ttlMs;
    constructor(prisma: PrismaService);
    get(id: string): Promise<CachedUser | null>;
    invalidate(id?: string): void;
}
