import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UserCacheService } from '../../common/user-cache.service';
import { CreateTeamDto, UpdateTeamDto } from './dto/teams.dto';
export declare class TeamsService {
    private prisma;
    private audit;
    private cache;
    constructor(prisma: PrismaService, audit: AuditService, cache: UserCacheService);
    private syncStaff;
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            members: number;
            tasks: number;
        };
        hr: {
            id: string;
            email: string;
            displayName: string;
        } | null;
        lead: {
            id: string;
            email: string;
            displayName: string;
        } | null;
        coordinator: {
            id: string;
            email: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        hrId: string | null;
        createdById: string | null;
    })[]>;
    get(id: string, viewerRole?: string): Promise<{
        stats: {
            totalMembers: number;
            activeMembers: number;
            openTasks: number;
            doneTasks: number;
            blockedTasks: number;
            totalTasks: number;
            taskDoneRate: number;
            presentToday: number;
            reportsToday: number;
        };
        hr: {
            id: string;
            email: string;
            displayName: string;
        } | null;
        lead: {
            id: string;
            email: string;
            displayName: string;
        } | null;
        coordinator: {
            id: string;
            email: string;
            displayName: string;
        } | null;
        members: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
            isActive: boolean;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        hrId: string | null;
        createdById: string | null;
    }>;
    create(meId: string, dto: CreateTeamDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        hrId: string | null;
        createdById: string | null;
    }>;
    update(meId: string, id: string, dto: UpdateTeamDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        hrId: string | null;
        createdById: string | null;
    }>;
    addMembers(meId: string, teamId: string, userIds: string[], ip?: string): Promise<{
        added: number;
    }>;
    removeMember(meId: string, teamId: string, userId: string, ip?: string): Promise<{
        removed: boolean;
    }>;
    transferMember(meId: string, fromTeamId: string, userId: string, targetTeamId: string, ip?: string): Promise<{
        transferred: boolean;
    }>;
    private assertUser;
}
