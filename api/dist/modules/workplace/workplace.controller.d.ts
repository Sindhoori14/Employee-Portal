import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { WorkplaceService } from './workplace.service';
import { CreateMeetingDto, DecideLeaveDto, ListLeavesDto, RequestLeaveDto, UpdateMeetingNoteDto } from './dto/workplace.dto';
export declare class WorkplaceController {
    private work;
    constructor(work: WorkplaceService);
    private ip;
    createMeeting(me: RequestUser, dto: CreateMeetingDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        note: string | null;
        createdById: string;
        title: string;
        recurrence: string;
        meetUrl: string;
        startsAt: Date;
        endsAt: Date | null;
        parentId: string | null;
        noteUpdatedAt: Date | null;
        noteUpdatedById: string | null;
    }>;
    meetings(me: RequestUser, scope?: 'upcoming' | 'past' | 'all'): import(".prisma/client").Prisma.PrismaPromise<({
        team: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        note: string | null;
        createdById: string;
        title: string;
        recurrence: string;
        meetUrl: string;
        startsAt: Date;
        endsAt: Date | null;
        parentId: string | null;
        noteUpdatedAt: Date | null;
        noteUpdatedById: string | null;
    })[]>;
    deleteMeeting(me: RequestUser, id: string, req: Request): Promise<{
        ok: boolean;
    }>;
    saveNote(me: RequestUser, id: string, dto: UpdateMeetingNoteDto, req: Request): Promise<{
        noteUpdatedBy: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        note: string | null;
        createdById: string;
        title: string;
        recurrence: string;
        meetUrl: string;
        startsAt: Date;
        endsAt: Date | null;
        parentId: string | null;
        noteUpdatedAt: Date | null;
        noteUpdatedById: string | null;
    }>;
    calendar(me: RequestUser, month: string): Promise<{
        month: string;
        days: Record<string, {
            meetings: unknown[];
            tasks: unknown[];
            leaves: unknown[];
            isHoliday: boolean;
            isWorkingDay: boolean;
        }>;
    }>;
    request(me: RequestUser, dto: RequestLeaveDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
    mine(me: RequestUser): import(".prisma/client").Prisma.PrismaPromise<({
        decidedBy: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    })[]>;
    pending(me: RequestUser): Promise<({
        user: {
            id: string;
            email: string;
            displayName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    })[]>;
    onLeaveToday(me: RequestUser): Promise<never[]> | import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            displayName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    })[]>;
    stats(me: RequestUser): Promise<{
        pending: number;
        onLeaveToday: number;
        approvedThisMonth: number;
        total: number;
    }>;
    listAll(me: RequestUser, q: ListLeavesDto): Promise<({
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
        };
        team: {
            id: string;
            name: string;
        } | null;
        decidedBy: {
            id: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    })[]>;
    approve(me: RequestUser, id: string, dto: DecideLeaveDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
    reject(me: RequestUser, id: string, dto: DecideLeaveDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
    cancel(me: RequestUser, id: string, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
    revoke(me: RequestUser, id: string, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string;
        fromDate: Date;
        toDate: Date;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
}
