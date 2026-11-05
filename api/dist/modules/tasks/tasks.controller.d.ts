import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { AddCommentDto, ChangeStatusDto, CreateTaskDto, ListTasksQuery, UpdateTaskDto } from './dto/tasks.dto';
export declare class TasksController {
    private tasks;
    constructor(tasks: TasksService);
    list(me: RequestUser, q: ListTasksQuery): Promise<{
        data: ({
            project: {
                id: string;
                name: string;
            } | null;
            owner: {
                id: string;
                displayName: string;
            };
            collaborators: {
                userId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            teamId: string;
            batchId: string | null;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
            description: string | null;
            createdById: string;
            title: string;
            goalId: string | null;
            projectId: string | null;
            ownerId: string;
            priority: import(".prisma/client").$Enums.Priority;
            dueDate: Date | null;
            recurrence: string;
            recurrenceUntil: Date | null;
            seriesId: string | null;
            estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
            blockedReason: string | null;
            reviewNote: string | null;
            completedAt: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(me: RequestUser, id: string): Promise<{
        project: {
            id: string;
            name: string;
        } | null;
        files: {
            id: string;
            createdAt: Date;
            name: string;
            uploaderId: string;
            mime: string;
            size: number;
            width: number | null;
            height: number | null;
        }[];
        owner: {
            id: string;
            email: string;
            displayName: string;
        };
        collaborators: ({
            user: {
                id: string;
                displayName: string;
            };
        } & {
            createdAt: Date;
            userId: string;
            taskId: string;
        })[];
        comments: ({
            files: {
                id: string;
                createdAt: Date;
                name: string;
                uploaderId: string;
                mime: string;
                size: number;
                width: number | null;
                height: number | null;
            }[];
            author: {
                id: string;
                displayName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taskId: string;
            body: string;
            authorId: string;
        })[];
        activities: {
            id: string;
            action: string;
            createdAt: Date;
            actorId: string;
            taskId: string;
            fromStatus: import(".prisma/client").$Enums.TaskStatus | null;
            toStatus: import(".prisma/client").$Enums.TaskStatus | null;
            detail: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        description: string | null;
        createdById: string;
        title: string;
        goalId: string | null;
        projectId: string | null;
        ownerId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        recurrence: string;
        recurrenceUntil: Date | null;
        seriesId: string | null;
        estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
        blockedReason: string | null;
        reviewNote: string | null;
        completedAt: Date | null;
    }>;
    create(me: RequestUser, dto: CreateTaskDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        description: string | null;
        createdById: string;
        title: string;
        goalId: string | null;
        projectId: string | null;
        ownerId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        recurrence: string;
        recurrenceUntil: Date | null;
        seriesId: string | null;
        estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
        blockedReason: string | null;
        reviewNote: string | null;
        completedAt: Date | null;
    } | {
        id: string;
        title: string;
        status: string;
        createdCount: number;
        message: string;
        tasks: {
            id: string;
            createdAt: Date;
            teamId: string;
            batchId: string | null;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
            description: string | null;
            createdById: string;
            title: string;
            goalId: string | null;
            projectId: string | null;
            ownerId: string;
            priority: import(".prisma/client").$Enums.Priority;
            dueDate: Date | null;
            recurrence: string;
            recurrenceUntil: Date | null;
            seriesId: string | null;
            estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
            blockedReason: string | null;
            reviewNote: string | null;
            completedAt: Date | null;
        }[];
    }>;
    update(me: RequestUser, id: string, dto: UpdateTaskDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        description: string | null;
        createdById: string;
        title: string;
        goalId: string | null;
        projectId: string | null;
        ownerId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        recurrence: string;
        recurrenceUntil: Date | null;
        seriesId: string | null;
        estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
        blockedReason: string | null;
        reviewNote: string | null;
        completedAt: Date | null;
    }>;
    status(me: RequestUser, id: string, dto: ChangeStatusDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        batchId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        description: string | null;
        createdById: string;
        title: string;
        goalId: string | null;
        projectId: string | null;
        ownerId: string;
        priority: import(".prisma/client").$Enums.Priority;
        dueDate: Date | null;
        recurrence: string;
        recurrenceUntil: Date | null;
        seriesId: string | null;
        estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
        blockedReason: string | null;
        reviewNote: string | null;
        completedAt: Date | null;
    }>;
    stopSeries(me: RequestUser, id: string, req: Request): Promise<{
        ok: boolean;
        removed: number;
    }>;
    removeAttachment(me: RequestUser, id: string, fileId: string, req: Request): Promise<{
        ok: boolean;
    }>;
    comment(me: RequestUser, id: string, dto: AddCommentDto): Promise<{
        files: {
            id: string;
            createdAt: Date;
            name: string;
            uploaderId: string;
            mime: string;
            size: number;
            width: number | null;
            height: number | null;
        }[];
        author: {
            id: string;
            displayName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        body: string;
        authorId: string;
    }>;
}
