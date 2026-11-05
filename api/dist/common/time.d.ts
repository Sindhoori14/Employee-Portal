export declare const APP_TZ: string;
export declare function dayStr(d?: Date): string;
export declare function minutesOfDay(d?: Date): number;
export declare function isValidDay(s: unknown): s is string;
export declare function dayToDate(day: string): Date;
export declare function addDays(day: string, n: number): string;
export declare function weekday(day: string): number;
export declare function offsetMs(at: Date, tz: string): number;
export declare function dayRange(day: string, tz?: string): {
    start: Date;
    end: Date;
};
export declare function parseDay(s: unknown): string | null;
export declare function tzShift(d: Date): Date;
export declare function localTimeToInstant(day: string, hhmm: string): Date;
export declare function monthRange(month: string): {
    from: string;
    to: string;
} | null;
