import type { Request, Response } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto, MarkAttendanceDto, StartBreakDto } from './attendance.dto';
export declare class AttendanceController {
    private att;
    constructor(att: AttendanceService);
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
            status: import("./attendance.logic").StoredStatus;
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
    checkIn(me: RequestUser, dto: CheckInDto, req: Request): Promise<{
        id: any;
        status: import("./attendance.logic").StoredStatus;
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
            status: import("./attendance.logic").StoredStatus;
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
            status: import("./attendance.logic").StoredStatus;
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
            status: import("./attendance.logic").StoredStatus;
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
    mine(me: RequestUser, month?: string): Promise<{
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
        days: (import("./attendance.service").Row | {
            day: string;
            state: "FUTURE" | "OFF";
        })[];
        workingDays: number;
    }>;
    board(me: RequestUser, date?: string, teamId?: string, batchId?: string): Promise<any>;
    person(me: RequestUser, userId: string, month?: string, from?: string, to?: string): Promise<{
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
        days: (import("./attendance.service").Row | {
            day: string;
            state: "FUTURE" | "OFF";
        })[];
        workingDays: number;
    }>;
    mark(me: RequestUser, dto: MarkAttendanceDto, req: Request): Promise<{
        ok: boolean;
        id: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
    }>;
    export(me: RequestUser, res: Response, q: {
        type?: string;
        date?: string;
        month?: string;
        from?: string;
        to?: string;
        userId?: string;
        teamId?: string;
        batchId?: string;
        format?: string;
    }): Promise<void>;
}
