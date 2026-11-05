import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { BatchesService } from './batches.service';
import { AddBatchMembersDto, CreateBatchDto, UpdateBatchDto } from './dto/batches.dto';
export declare class BatchesController {
    private batches;
    constructor(batches: BatchesService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            members: number;
        };
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
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        createdById: string | null;
        startDate: Date;
        endDate: Date;
        durationDays: number;
    })[]>;
    get(me: RequestUser, id: string): Promise<{
        stats: {
            totalMembers: number;
            activeMembers: number;
            totalTasks: number;
            doneTasks: number;
            taskDoneRate: number;
            reportsToday: number;
        };
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
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        createdById: string | null;
        startDate: Date;
        endDate: Date;
        durationDays: number;
    }>;
    create(me: RequestUser, dto: CreateBatchDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        createdById: string | null;
        startDate: Date;
        endDate: Date;
        durationDays: number;
    }>;
    update(me: RequestUser, id: string, dto: UpdateBatchDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        createdById: string | null;
        startDate: Date;
        endDate: Date;
        durationDays: number;
    }>;
    addMembers(me: RequestUser, id: string, dto: AddBatchMembersDto, req: Request): Promise<{
        added: number;
    }>;
    removeMember(me: RequestUser, id: string, userId: string, req: Request): Promise<{
        removed: boolean;
    }>;
}
