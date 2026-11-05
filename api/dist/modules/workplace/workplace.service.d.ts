import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../comms/notifications.service';
import { WorkCalendarService } from '../../common/work-calendar.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { CreateMeetingDto, RequestLeaveDto } from './dto/workplace.dto';
export declare class WorkplaceService {
    private prisma;
    private audit;
    private notifications;
    private calendar;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService, calendar: WorkCalendarService);
    createMeeting(me: RequestUser, dto: CreateMeetingDto, ip?: string): Promise<{
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
    listMeetings(me: RequestUser, scope?: 'upcoming' | 'past' | 'all'): import(".prisma/client").Prisma.PrismaPromise<({
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
    deleteMeeting(me: RequestUser, id: string, ip?: string): Promise<{
        ok: boolean;
    }>;
    requestLeave(me: RequestUser, dto: RequestLeaveDto, ip?: string): Promise<{
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
    decide(me: RequestUser, id: string, approve: boolean, note: string | undefined, ip?: string): Promise<{
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
    cancel(me: RequestUser, id: string, ip?: string): Promise<{
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
    revoke(me: RequestUser, id: string, ip?: string): Promise<{
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
    getStats(me: RequestUser): Promise<{
        pending: number;
        onLeaveToday: number;
        approvedThisMonth: number;
        total: number;
    }>;
    listLeaves(me: RequestUser, q: {
        status?: string;
        teamId?: string;
        userId?: string;
    }): Promise<({
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
    saveNote(me: RequestUser, id: string, note: string, ip?: string): Promise<{
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
    monthView(me: RequestUser, month: string): Promise<{
        month: string;
        days: Record<string, {
            meetings: unknown[];
            tasks: unknown[];
            leaves: unknown[];
            isHoliday: boolean;
            isWorkingDay: boolean;
        }>;
    }>;
    private canSeeMeeting;
    private fmt;
    private markOnLeave;
    private scopeUserIds;
}
