import { PrismaService } from '../prisma/prisma.service';
export interface AttendanceConfig {
    shiftStart: number;
    shiftEnd: number;
    autoCheckout: number;
    graceMinutes: number;
    halfDayMinutes: number;
    maxBreakMinutes: number;
    maxSingleBreakMinutes: number;
}
export interface ReportGateConfig {
    enabled: boolean;
    roles: string[];
}
export declare class WorkCalendarService {
    private prisma;
    private cache;
    constructor(prisma: PrismaService);
    invalidate(): void;
    private attCache;
    attendanceConfig(): Promise<AttendanceConfig>;
    photoRequired(): Promise<boolean>;
    reportGate(): Promise<ReportGateConfig>;
    private loadAtt;
    private load;
    isWorkingDay(day: string): Promise<boolean>;
    deadlineMinutes(): Promise<number>;
    holidaySet(): Promise<Set<string>>;
    isLate(reportDay: string, today: string, now?: Date): Promise<boolean>;
}
