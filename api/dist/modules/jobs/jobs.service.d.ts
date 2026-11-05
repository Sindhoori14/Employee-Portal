import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../comms/notifications.service';
import { WorkCalendarService } from '../../common/work-calendar.service';
import { AttendanceService } from '../attendance/attendance.service';
import { FilesService } from '../files/files.service';
export declare class JobsService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private notifications;
    private calendar;
    private attendance;
    private files;
    private log;
    private timer?;
    private running;
    constructor(prisma: PrismaService, notifications: NotificationsService, calendar: WorkCalendarService, attendance: AttendanceService, files: FilesService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    tick(): Promise<void>;
    private reportReminders;
    private missingReportDigest;
    meetingReminders(): Promise<void>;
    ensureDailyMeetings(): Promise<void>;
    private dailyCleanup;
}
