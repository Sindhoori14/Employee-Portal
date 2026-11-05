import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { SubmitReportDto, UpsertEvaluationDto } from '../learning/dto/learning.dto';
import { WorkCalendarService } from '../../common/work-calendar.service';
import { FileLinkService } from '../../common/file-links.service';
export declare class ReportsService {
    private prisma;
    private audit;
    private calendar;
    private links;
    constructor(prisma: PrismaService, audit: AuditService, calendar: WorkCalendarService, links: FileLinkService);
    submit(me: RequestUser, dto: SubmitReportDto, ip?: string): Promise<({
        taskLinks: ({
            task: {
                id: string;
                status: import(".prisma/client").$Enums.TaskStatus;
                title: string;
            };
        } & {
            taskId: string;
            reportId: string;
        })[];
        files: {
            id: string;
            createdAt: Date;
            name: string;
            uploaderId: string;
            mime: string;
            size: number;
            width: number | null;
            height: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        batchId: string | null;
        updatedAt: Date;
        userId: string;
        reportDate: Date;
        didToday: string;
        blockers: string | null;
        planTomorrow: string;
        hoursWorked: import("@prisma/client/runtime/library").Decimal;
        isLate: boolean;
        submittedAt: Date;
    }) | null>;
    mine(me: RequestUser, from?: string, to?: string): import(".prisma/client").Prisma.PrismaPromise<({
        taskLinks: ({
            task: {
                id: string;
                status: import(".prisma/client").$Enums.TaskStatus;
                title: string;
            };
        } & {
            taskId: string;
            reportId: string;
        })[];
        files: {
            id: string;
            createdAt: Date;
            name: string;
            uploaderId: string;
            mime: string;
            size: number;
            width: number | null;
            height: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        batchId: string | null;
        updatedAt: Date;
        userId: string;
        reportDate: Date;
        didToday: string;
        blockers: string | null;
        planTomorrow: string;
        hoursWorked: import("@prisma/client/runtime/library").Decimal;
        isLate: boolean;
        submittedAt: Date;
    })[]>;
    list(me: RequestUser, q: {
        date?: string;
        teamId?: string;
        batchId?: string;
    }): Promise<({
        user: {
            id: string;
            email: string;
            displayName: string;
        };
        files: {
            id: string;
            createdAt: Date;
            name: string;
            uploaderId: string;
            mime: string;
            size: number;
            width: number | null;
            height: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        teamId: string;
        batchId: string | null;
        updatedAt: Date;
        userId: string;
        reportDate: Date;
        didToday: string;
        blockers: string | null;
        planTomorrow: string;
        hoursWorked: import("@prisma/client/runtime/library").Decimal;
        isLate: boolean;
        submittedAt: Date;
    })[]>;
    status(me: RequestUser, dateStr?: string, teamId?: string, batchId?: string): Promise<{
        date: string;
        workingDay: boolean;
        submitted: {
            report: {
                id: string;
                createdAt: Date;
                teamId: string;
                batchId: string | null;
                updatedAt: Date;
                userId: string;
                reportDate: Date;
                didToday: string;
                blockers: string | null;
                planTomorrow: string;
                hoursWorked: import("@prisma/client/runtime/library").Decimal;
                isLate: boolean;
                submittedAt: Date;
            } | undefined;
            id: string;
            email: string;
            displayName: string;
            teamId: string | null;
        }[];
        missing: {
            id: string;
            email: string;
            displayName: string;
            teamId: string | null;
        }[];
    }>;
    upsertEvaluation(me: RequestUser, dto: UpsertEvaluationDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        userId: string;
        remarks: string | null;
        readiness: import(".prisma/client").$Enums.Readiness;
        attendancePct: number | null;
        taskCompletionPct: number | null;
        avgScore: number | null;
        evaluatedById: string | null;
        evaluatedAt: Date | null;
    }>;
    computeEvaluations(me: RequestUser, batchId: string, ip?: string): Promise<{
        updated: number;
        workingDays: number;
    }>;
    listEvaluations(me: RequestUser, batchId: string): Promise<({
        user: {
            id: string;
            email: string;
            displayName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        userId: string;
        remarks: string | null;
        readiness: import(".prisma/client").$Enums.Readiness;
        attendancePct: number | null;
        taskCompletionPct: number | null;
        avgScore: number | null;
        evaluatedById: string | null;
        evaluatedAt: Date | null;
    })[]>;
    listSettings(): import(".prisma/client").Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        updatedById: string | null;
    }[]>;
    putSetting(me: RequestUser, key: string, value: unknown, ip?: string): Promise<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        updatedById: string | null;
    }>;
}
