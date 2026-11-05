import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserCacheService } from '../../common/user-cache.service';
import { RealtimeGateway } from '../comms/realtime.gateway';
import { BulkCreateUsersDto, CreateUserDto, UpdateUserDto } from './dto/users.dto';
export declare function tempPassword(len?: number): string;
export declare class UsersService {
    private prisma;
    private audit;
    private cache;
    private gateway;
    constructor(prisma: PrismaService, audit: AuditService, cache: UserCacheService, gateway: RealtimeGateway);
    list(me: RequestUser, q: {
        page?: number;
        limit?: number;
        teamId?: string;
        batchId?: string;
        role?: string;
        search?: string;
        active?: string;
    }): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(me: RequestUser, id: string): Promise<any>;
    private assertCanManage;
    private resolveRefs;
    create(me: RequestUser, dto: CreateUserDto, ip?: string): Promise<any>;
    update(me: RequestUser, id: string, dto: UpdateUserDto, ip?: string): Promise<any>;
    resetPassword(me: RequestUser, id: string, ip?: string): Promise<{
        email: string;
        displayName: string;
        tempPassword: string;
    }>;
    bulkCreate(me: RequestUser, dto: BulkCreateUsersDto, ip?: string): Promise<{
        created: {
            email: string;
            displayName: string;
            role: string;
            team: string | null;
            batch: string | null;
            tempPassword: string;
        }[];
        skipped: {
            email: string;
            reason: string;
        }[];
    }>;
    private afterAccessChange;
    private safe;
}
