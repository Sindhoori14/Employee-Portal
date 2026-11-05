import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../comms/notifications.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { AddTicketMessageDto, CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
export declare class TicketsService {
    private prisma;
    private audit;
    private notifications;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService);
    private where;
    list(me: RequestUser, q: {
        status?: string;
        category?: string;
        priority?: string;
        escalated?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<({
        team: {
            id: string;
            name: string;
        } | null;
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
        };
        assignee: {
            id: string;
            displayName: string;
        } | null;
        resolvedBy: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        subject: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        resolution: string | null;
        assigneeId: string | null;
        escalated: boolean;
        requesterId: string;
        resolvedById: string | null;
        resolvedAt: Date | null;
    })[]>;
    private mustSee;
    get(me: RequestUser, id: string): Promise<{
        team: {
            id: string;
            name: string;
        } | null;
        messages: ({
            author: {
                id: string;
                role: import(".prisma/client").$Enums.Role;
                displayName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            body: string;
            authorId: string;
            ticketId: string;
        })[];
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
        };
        assignee: {
            id: string;
            displayName: string;
        } | null;
        resolvedBy: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        subject: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        resolution: string | null;
        assigneeId: string | null;
        escalated: boolean;
        requesterId: string;
        resolvedById: string | null;
        resolvedAt: Date | null;
    }>;
    create(me: RequestUser, dto: CreateTicketDto, ip?: string): Promise<{
        team: {
            id: string;
            name: string;
        } | null;
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
        };
        assignee: {
            id: string;
            displayName: string;
        } | null;
        resolvedBy: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        subject: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        resolution: string | null;
        assigneeId: string | null;
        escalated: boolean;
        requesterId: string;
        resolvedById: string | null;
        resolvedAt: Date | null;
    }>;
    update(me: RequestUser, id: string, dto: UpdateTicketDto, ip?: string): Promise<{
        team: {
            id: string;
            name: string;
        } | null;
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
        };
        assignee: {
            id: string;
            displayName: string;
        } | null;
        resolvedBy: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        subject: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        resolution: string | null;
        assigneeId: string | null;
        escalated: boolean;
        requesterId: string;
        resolvedById: string | null;
        resolvedAt: Date | null;
    }>;
    addMessage(me: RequestUser, id: string, dto: AddTicketMessageDto): Promise<{
        author: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        body: string;
        authorId: string;
        ticketId: string;
    }>;
}
