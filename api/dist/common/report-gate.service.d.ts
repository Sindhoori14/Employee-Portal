import { PrismaService } from '../prisma/prisma.service';
import { WorkCalendarService } from './work-calendar.service';
export declare class ReportGateService {
    private prisma;
    private calendar;
    constructor(prisma: PrismaService, calendar: WorkCalendarService);
    private applies;
    private hasReportToday;
    status(userId: string, role: string): Promise<{
        required: boolean;
        submitted: boolean;
    }>;
    assert(userId: string, role: string, action: 'CHECK_OUT' | 'LOG_OUT'): Promise<void>;
}
