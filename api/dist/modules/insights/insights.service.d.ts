import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { WorkCalendarService } from '../../common/work-calendar.service';
export declare function istDay(d: Date): string;
export declare function istMidnight(dateStr: string): Date;
type Severity = 'high' | 'medium' | 'low';
export interface AttentionItem {
    userId: string;
    name: string;
    severity: Severity;
    score: number;
    reasons: string[];
    taskIds: string[];
}
export declare class InsightsService {
    private prisma;
    private calendar;
    constructor(prisma: PrismaService, calendar: WorkCalendarService);
    private memo;
    private cached;
    adminOverview(): Promise<{
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
    private computeAdmin;
    leadOverview(me: RequestUser, teamId?: string): Promise<{
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
    coordinatorToday(me: RequestUser, teamId?: string): Promise<{
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
        items: AttentionItem[];
    }>;
    mySummary(me: RequestUser): Promise<{
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
}
export {};
