import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto, UpdateGoalProgressDto } from './dto/goals.dto';
export declare class GoalsController {
    private goals;
    constructor(goals: GoalsService);
    list(me: RequestUser, teamId?: string, ownerId?: string, type?: string, status?: string): Promise<({
        team: {
            id: string;
            name: string;
        } | null;
        batch: {
            id: string;
            name: string;
        } | null;
        _count: {
            tasks: number;
        };
        createdBy: {
            id: string;
            displayName: string;
        };
        owner: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        type: import(".prisma/client").$Enums.GoalType;
        description: string | null;
        createdById: string;
        startDate: Date | null;
        endDate: Date | null;
        title: string;
        ownerId: string | null;
        progress: number;
    })[]>;
    get(me: RequestUser, id: string): Promise<{
        team: {
            id: string;
            name: string;
        } | null;
        batch: {
            id: string;
            name: string;
        } | null;
        createdBy: {
            id: string;
            displayName: string;
        };
        tasks: {
            id: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            title: string;
            priority: import(".prisma/client").$Enums.Priority;
            dueDate: Date | null;
            owner: {
                id: string;
                displayName: string;
            };
        }[];
        owner: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        type: import(".prisma/client").$Enums.GoalType;
        description: string | null;
        createdById: string;
        startDate: Date | null;
        endDate: Date | null;
        title: string;
        ownerId: string | null;
        progress: number;
    }>;
    create(me: RequestUser, dto: CreateGoalDto, req: Request): Promise<{
        team: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        type: import(".prisma/client").$Enums.GoalType;
        description: string | null;
        createdById: string;
        startDate: Date | null;
        endDate: Date | null;
        title: string;
        ownerId: string | null;
        progress: number;
    }>;
    update(me: RequestUser, id: string, dto: UpdateGoalDto, req: Request): Promise<{
        team: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        type: import(".prisma/client").$Enums.GoalType;
        description: string | null;
        createdById: string;
        startDate: Date | null;
        endDate: Date | null;
        title: string;
        ownerId: string | null;
        progress: number;
    }>;
    updateProgress(me: RequestUser, id: string, dto: UpdateGoalProgressDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        type: import(".prisma/client").$Enums.GoalType;
        description: string | null;
        createdById: string;
        startDate: Date | null;
        endDate: Date | null;
        title: string;
        ownerId: string | null;
        progress: number;
    }>;
}
