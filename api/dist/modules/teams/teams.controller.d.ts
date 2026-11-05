import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { TeamsService } from './teams.service';
import { AddTeamMembersDto, CreateTeamDto, TransferTeamMemberDto, UpdateTeamDto } from './dto/teams.dto';
export declare class TeamsController {
    private teams;
    constructor(teams: TeamsService);
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
    get(me: RequestUser, id: string): Promise<{
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
    create(me: RequestUser, dto: CreateTeamDto, req: Request): Promise<{
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
    update(me: RequestUser, id: string, dto: UpdateTeamDto, req: Request): Promise<{
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
    addMembers(me: RequestUser, id: string, dto: AddTeamMembersDto, req: Request): Promise<{
        added: number;
    }>;
    removeMember(me: RequestUser, id: string, userId: string, req: Request): Promise<{
        removed: boolean;
    }>;
    transferMember(me: RequestUser, id: string, dto: TransferTeamMemberDto, req: Request): Promise<{
        transferred: boolean;
    }>;
}
