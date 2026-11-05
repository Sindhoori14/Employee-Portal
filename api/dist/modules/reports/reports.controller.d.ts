import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { SubmitReportDto, UpsertEvaluationDto } from '../learning/dto/learning.dto';
export declare class ReportsController {
    private reports;
    constructor(reports: ReportsService);
    private ip;
    submit(me: RequestUser, dto: SubmitReportDto, req: Request): Promise<({
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
    status(me: RequestUser, date?: string, teamId?: string, batchId?: string): Promise<{
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
    list(me: RequestUser, date?: string, teamId?: string, batchId?: string): Promise<({
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
    evaluate(me: RequestUser, dto: UpsertEvaluationDto, req: Request): Promise<{
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
    compute(me: RequestUser, body: {
        batchId: string;
    }, req: Request): Promise<{
        updated: number;
        workingDays: number;
    }>;
    evaluations(me: RequestUser, batchId: string): Promise<({
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
    settings(): import(".prisma/client").Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        updatedById: string | null;
    }[]>;
    setting(me: RequestUser, key: string, body: {
        value: unknown;
    }, req: Request): Promise<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        updatedById: string | null;
    }>;
}
