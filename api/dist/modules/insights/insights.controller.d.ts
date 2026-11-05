import type { Response } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { InsightsService } from './insights.service';
import { ExportsService } from './exports.service';
export declare class InsightsController {
    private insights;
    private exports;
    constructor(insights: InsightsService, exports: ExportsService);
    admin(): Promise<{
        date: string;
        workingDay: boolean;
        users: {
            byRole: Record<string, number>;
        };
        tasks: {
            byStatus: Record<string, number>;
            overdue: number;
            blocked: number;
        };
        reports: {
            submittedToday: number;
            activeUsers: number;
            submissionRate: number;
            lateToday: number;
        };
        leaderboard: {
            teamId: string;
            name: string;
            members: number;
            reportRate: number;
            taskDoneRate: number;
            reportsToday: number;
        }[];
        batches: {
            batchId: string;
            name: string;
            members: number;
            reportsToday: number;
            reportRate: number;
        }[];
    }>;
    lead(me: RequestUser, teamId?: string): Promise<{
        teamId: string | null;
        tasksByStatus: Record<string, number>;
        overdue: number;
        pendingReviews: ({
            owner: {
                id: string;
                displayName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            teamId: string;
            batchId: string | null;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TaskStatus;
            description: string | null;
            createdById: string;
            title: string;
            goalId: string | null;
            projectId: string | null;
            ownerId: string;
            priority: import(".prisma/client").$Enums.Priority;
            dueDate: Date | null;
            recurrence: string;
            recurrenceUntil: Date | null;
            seriesId: string | null;
            estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
            blockedReason: string | null;
            reviewNote: string | null;
            completedAt: Date | null;
        })[];
        members: {
            tasksTotal: number;
            tasksDone: number;
            tasksBlocked: number;
            doneRate: number;
            reportsLast7: any;
            id: string;
            email: string;
            displayName: string;
        }[];
    }>;
    coordinator(me: RequestUser, teamId?: string): Promise<{
        date: string;
        workingDay: boolean;
        teamId: string | null;
        members: {
            openTasks: number;
            doneTasks: number;
            blockedTasks: number;
            reported: boolean;
            late: any;
            id: string;
            email: string;
            displayName: string;
        }[];
    }>;
    attention(me: RequestUser, teamId?: string): Promise<{
        date: string;
        items: import("./insights.service").AttentionItem[];
    }>;
    me(me: RequestUser): Promise<{
        tasks: {
            open: number;
            dueToday: number;
            overdue: number;
            blocked: number;
            inReview: number;
        };
        training: {
            planId: string;
            title: string;
            done: number;
            total: number;
            progressPct: number;
        }[];
        reports: {
            last7: number;
            lateLast7: number;
            streak: number;
            reportedToday: boolean;
        };
    }>;
    tasksCsv(me: RequestUser, teamId: string | undefined, status: string | undefined, from: string | undefined, to: string | undefined, res: Response): Promise<void>;
    tasksPdf(me: RequestUser, teamId: string | undefined, status: string | undefined, from: string | undefined, to: string | undefined, res: Response): Promise<void>;
    reportsCsv(me: RequestUser, date: string | undefined, teamId: string | undefined, from: string | undefined, to: string | undefined, res: Response): Promise<void>;
    reportsPdf(me: RequestUser, date: string | undefined, teamId: string | undefined, from: string | undefined, to: string | undefined, res: Response): Promise<void>;
}
