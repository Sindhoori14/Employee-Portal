import type { AttendanceConfig } from '../../common/work-calendar.service';
export type DayState = 'WORKING' | 'ON_BREAK' | 'CHECKED_OUT' | 'LEAVE' | 'NOT_IN' | 'ABSENT' | 'OFF';
export type StoredStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
export interface BreakSpan {
    startAt: Date;
    endAt: Date | null;
}
export declare function breakMinutes(breaks: BreakSpan[], from: Date, to: Date, now: Date): number;
export declare function workedAndBreak(checkIn: Date, checkOut: Date | null, breaks: BreakSpan[], now: Date): {
    worked: number;
    breaks: number;
};
export declare function lateMinutes(checkIn: Date, cfg: AttendanceConfig): number;
export declare function statusFor(late: number, finished: boolean, worked: number, cfg: AttendanceConfig): StoredStatus;
export declare function stateFor(rec: {
    status: StoredStatus;
    checkInAt: Date | null;
    checkOutAt: Date | null;
} | null, hasOpenBreak: boolean, isToday: boolean, workingDay: boolean): DayState;
export declare const GRID_CODE: Record<DayState | 'LATE' | 'HALF', string>;
export declare function fmtMinutes(m: number): string;
