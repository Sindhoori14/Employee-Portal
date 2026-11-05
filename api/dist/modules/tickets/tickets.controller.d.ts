import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { TicketsService } from './tickets.service';
import { AddTicketMessageDto, CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
export declare class TicketsController {
    private tickets;
    constructor(tickets: TicketsService);
    list(me: RequestUser, status?: string, category?: string, priority?: string, escalated?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(me: RequestUser, dto: CreateTicketDto, req: Request): Promise<{
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
    update(me: RequestUser, id: string, dto: UpdateTicketDto, req: Request): Promise<{
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
