import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../comms/notifications.service';
import { RealtimeGateway } from '../comms/realtime.gateway';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { FileLinkService } from '../../common/file-links.service';
import { AddCommentDto, ChangeStatusDto, CreateTaskDto, UpdateTaskDto } from './dto/tasks.dto';
export declare class TasksService {
    private prisma;
    private audit;
    private notifications;
    private realtime;
    private links;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService, realtime: RealtimeGateway, links: FileLinkService);
    list(me: RequestUser, q: {
        status?: string;
        ownerId?: string;
        teamId?: string;
        projectId?: string;
        page?: string;
        limit?: string;
        search?: string;
        overdue?: string;
    }): Promise<{
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
    create(me: RequestUser, dto: CreateTaskDto, ip?: string): Promise<{
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
    stopSeries(me: RequestUser, id: string, ip?: string): Promise<{
        ok: boolean;
        removed: number;
    }>;
    update(me: RequestUser, id: string, dto: UpdateTaskDto, ip?: string): Promise<{
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
    changeStatus(me: RequestUser, id: string, dto: ChangeStatusDto, ip?: string): Promise<{
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
    removeAttachment(me: RequestUser, taskId: string, fileId: string, ip?: string): Promise<{
        ok: boolean;
    }>;
}
