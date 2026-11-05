import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { WorkCalendarService } from '../../common/work-calendar.service';
import { UserCacheService } from '../../common/user-cache.service';
import { NotificationsService } from '../comms/notifications.service';
import { RealtimeGateway } from '../comms/realtime.gateway';
import { ReportGateService } from '../../common/report-gate.service';
import { CheckInDto, CheckOutDto, MarkAttendanceDto, StartBreakDto } from './attendance.dto';
import { DayState, StoredStatus } from './attendance.logic';
export interface Row {
    userId: string;
    name: string;
    email: string;
    role: string;
    teamId: string | null;
    teamName: string | null;
    batchName: string | null;
    day: string;
    state: DayState;
    status: StoredStatus | null;
    late: boolean;
    halfDay: boolean;
    mode: string | null;
    checkInAt: Date | null;
    checkOutAt: Date | null;
    lateMinutes: number;
    workedMinutes: number;
    breakMinutes: number;
    breakCount: number;
    overBreak: boolean;
    onBreakSince: Date | null;
    breakReason: string | null;
    autoClosed: boolean;
    edited: boolean;
    note: string | null;
    breaks: Array<{
        reason: string;
        note: string | null;
        startAt: Date;
        endAt: Date | null;
        minutes: number;
    }>;
}
export declare class AttendanceService {
    private prisma;
    private audit;
    private calendar;
    private cache;
    private notifications;
    private realtime;
    private reportGate;
    private memo;
    constructor(prisma: PrismaService, audit: AuditService, calendar: WorkCalendarService, cache: UserCacheService, notifications: NotificationsService, realtime: RealtimeGateway, reportGate: ReportGateService);
    private shapeRecord;
    today(me: RequestUser): Promise<{
        day: string;
        serverNow: string;
        workingDay: boolean;
        photoMissing: boolean;
        config: {
            shiftStart: number;
            shiftEnd: number;
            graceMinutes: number;
            maxBreakMinutes: number;
            maxSingleBreakMinutes: number;
        };
        reportGate: {
            required: boolean;
            submitted: boolean;
        };
        record: {
            id: any;
            status: StoredStatus;
            mode: any;
            checkInAt: any;
            checkOutAt: any;
            lateMinutes: any;
            note: any;
            autoClosed: any;
            workedMinutes: number;
            breakMinutes: number;
            breaks: {
                id: string;
                reason: string;
                note: string | null;
                startAt: Date;
                endAt: Date | null;
            }[];
            openBreak: {
                id: string;
                reason: string;
                note: string | null;
                startAt: Date;
                endAt: Date | null;
            } | null;
        } | null;
    }>;
    private changed;
    checkIn(me: RequestUser, dto: CheckInDto, ip?: string): Promise<{
        id: any;
        status: StoredStatus;
        mode: any;
        checkInAt: any;
        checkOutAt: any;
        lateMinutes: any;
        note: any;
        autoClosed: any;
        workedMinutes: number;
        breakMinutes: number;
        breaks: {
            id: string;
            reason: string;
            note: string | null;
            startAt: Date;
            endAt: Date | null;
        }[];
        openBreak: {
            id: string;
            reason: string;
            note: string | null;
            startAt: Date;
            endAt: Date | null;
        } | null;
    } | null>;
    private mustOpenRecord;
    startBreak(me: RequestUser, dto: StartBreakDto): Promise<{
        day: string;
        serverNow: string;
        workingDay: boolean;
        photoMissing: boolean;
        config: {
            shiftStart: number;
            shiftEnd: number;
            graceMinutes: number;
            maxBreakMinutes: number;
            maxSingleBreakMinutes: number;
        };
        reportGate: {
            required: boolean;
            submitted: boolean;
        };
        record: {
            id: any;
            status: StoredStatus;
            mode: any;
            checkInAt: any;
            checkOutAt: any;
            lateMinutes: any;
            note: any;
            autoClosed: any;
            workedMinutes: number;
            breakMinutes: number;
            breaks: {
                id: string;
                reason: string;
                note: string | null;
                startAt: Date;
                endAt: Date | null;
            }[];
            openBreak: {
                id: string;
                reason: string;
                note: string | null;
                startAt: Date;
                endAt: Date | null;
            } | null;
        } | null;
    }>;
    endBreak(me: RequestUser): Promise<{
        day: string;
        serverNow: string;
        workingDay: boolean;
        photoMissing: boolean;
        config: {
            shiftStart: number;
            shiftEnd: number;
            graceMinutes: number;
            maxBreakMinutes: number;
            maxSingleBreakMinutes: number;
        };
        reportGate: {
            required: boolean;
            submitted: boolean;
        };
        record: {
            id: any;
            status: StoredStatus;
            mode: any;
            checkInAt: any;
            checkOutAt: any;
            lateMinutes: any;
            note: any;
            autoClosed: any;
            workedMinutes: number;
            breakMinutes: number;
            breaks: {
                id: string;
                reason: string;
                note: string | null;
                startAt: Date;
                endAt: Date | null;
            }[];
            openBreak: {
                id: string;
                reason: string;
                note: string | null;
                startAt: Date;
                endAt: Date | null;
            } | null;
        } | null;
    }>;
    checkOut(me: RequestUser, dto: CheckOutDto): Promise<{
        day: string;
        serverNow: string;
        workingDay: boolean;
        photoMissing: boolean;
        config: {
            shiftStart: number;
            shiftEnd: number;
            graceMinutes: number;
            maxBreakMinutes: number;
            maxSingleBreakMinutes: number;
        };
        reportGate: {
            required: boolean;
            submitted: boolean;
        };
        record: {
            id: any;
            status: StoredStatus;
            mode: any;
            checkInAt: any;
            checkOutAt: any;
            lateMinutes: any;
            note: any;
            autoClosed: any;
            workedMinutes: number;
            breakMinutes: number;
            breaks: {
                id: string;
                reason: string;
                note: string | null;
                startAt: Date;
                endAt: Date | null;
            }[];
            openBreak: {
                id: string;
                reason: string;
                note: string | null;
                startAt: Date;
                endAt: Date | null;
            } | null;
        } | null;
    }>;
    private closeRecord;
    private scopeWhere;
    private assertCanSee;
    private compute;
    private summarize;
    private scopedUsers;
    board(me: RequestUser, q: {
        date?: string;
        teamId?: string;
        batchId?: string;
    }): Promise<any>;
    private rangeFrom;
    private personSummary;
    person(me: RequestUser, userId: string, q: {
        month?: string;
        from?: string;
        to?: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            team: string | null;
        };
        from: string;
        to: string;
        summary: {
            workingDays: number;
            present: number;
            onTime: number;
            late: number;
            halfDay: number;
            leave: number;
            absent: number;
            notIn: number;
            workedMinutes: number;
            breakMinutes: number;
            attendancePct: number;
            avgWorkedMinutes: number;
        };
        days: (Row | {
            day: string;
            state: "FUTURE" | "OFF";
        })[];
        workingDays: number;
    }>;
    mine(me: RequestUser, q: {
        month?: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            team: string | null;
        };
        from: string;
        to: string;
        summary: {
            workingDays: number;
            present: number;
            onTime: number;
            late: number;
            halfDay: number;
            leave: number;
            absent: number;
            notIn: number;
            workedMinutes: number;
            breakMinutes: number;
            attendancePct: number;
            avgWorkedMinutes: number;
        };
        days: (Row | {
            day: string;
            state: "FUTURE" | "OFF";
        })[];
        workingDays: number;
    }>;
    mark(me: RequestUser, dto: MarkAttendanceDto, ip?: string): Promise<{
        ok: boolean;
        id: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
    }>;
    private hours;
    private t;
    private stateText;
    private stateCell;
    private dailySheet;
    private breaksSheet;
    export(me: RequestUser, q: {
        type?: string;
        date?: string;
        month?: string;
        from?: string;
        to?: string;
        userId?: string;
        teamId?: string;
        batchId?: string;
        format?: string;
    }): Promise<{
        filename: string;
        mime: string;
        body: Buffer<ArrayBufferLike>;
    }>;
    private toCsv;
    private alreadySent;
    runJobs(): Promise<void>;
    private breakWatch;
    private nudgeNotCheckedIn;
    private endOfDaySummary;
    private autoClose;
}
