import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from '../comms/notifications.service';
import { CreateAssessmentDto, CreateItemDto, CreateMaterialDto, CreatePlanDto, CreateQuestionDto, GradeAttemptDto, SubmitAttemptDto, UpdateItemDto, UpdatePlanDto } from './dto/learning.dto';
export declare class LearningService {
    private prisma;
    private audit;
    private notifications;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService);
    private batchGuard;
    private scopeBatch;
    private needLead;
    createPlan(me: RequestUser, dto: CreatePlanDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        description: string | null;
        createdById: string;
        title: string;
    }>;
    listPlans(me: RequestUser, batchId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        batch: {
            id: string;
            name: string;
        };
        _count: {
            items: number;
        };
    } & {
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        description: string | null;
        createdById: string;
        title: string;
    })[]>;
    getPlan(id: string, me: RequestUser): Promise<{
        myDone: number;
        myTotal: number;
        myPct: number;
        batch: {
            id: string;
            name: string;
        };
        items: ({
            materials: {
                id: string;
                title: string;
                url: string | null;
                kind: import(".prisma/client").$Enums.TrainingMaterialKind;
                fileKey: string | null;
                sortOrder: number;
                trainingItemId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            dayNumber: number;
            weekNumber: number | null;
            topic: string;
            practiceTask: string | null;
            expectedOutput: string | null;
            sortOrder: number;
            planId: string;
        })[];
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        description: string | null;
        createdById: string;
        title: string;
    }>;
    updatePlan(me: RequestUser, id: string, dto: UpdatePlanDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        description: string | null;
        createdById: string;
        title: string;
    }>;
    addItem(me: RequestUser, planId: string, dto: CreateItemDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dayNumber: number;
        weekNumber: number | null;
        topic: string;
        practiceTask: string | null;
        expectedOutput: string | null;
        sortOrder: number;
        planId: string;
    }>;
    updateItem(me: RequestUser, id: string, dto: UpdateItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dayNumber: number;
        weekNumber: number | null;
        topic: string;
        practiceTask: string | null;
        expectedOutput: string | null;
        sortOrder: number;
        planId: string;
    }>;
    deleteItem(me: RequestUser, id: string, ip?: string): Promise<{
        ok: boolean;
    }>;
    addMaterial(me: RequestUser, itemId: string, dto: CreateMaterialDto): Promise<{
        id: string;
        title: string;
        url: string | null;
        kind: import(".prisma/client").$Enums.TrainingMaterialKind;
        fileKey: string | null;
        sortOrder: number;
        trainingItemId: string;
    }>;
    deleteMaterial(me: RequestUser, id: string): Promise<{
        ok: boolean;
    }>;
    setProgress(me: RequestUser, itemId: string, isDone: boolean): Promise<{
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        isDone: boolean;
        trainingItemId: string;
    }>;
    batchProgress(me: RequestUser, planId: string): Promise<{
        total: number;
        trainees: {
            done: number;
            progressPct: number;
            id: string;
            email: string;
            displayName: string;
        }[];
    }>;
    createAssessment(me: RequestUser, dto: CreateAssessmentDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AssessmentType;
        description: string | null;
        createdById: string;
        title: string;
        dueDate: Date | null;
        weekNumber: number | null;
        maxScore: number;
    }>;
    listAssessments(me: RequestUser, batchId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            questions: number;
            attempts: number;
        };
    } & {
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AssessmentType;
        description: string | null;
        createdById: string;
        title: string;
        dueDate: Date | null;
        weekNumber: number | null;
        maxScore: number;
    })[]>;
    getAssessment(id: string, me: RequestUser): Promise<{
        questions: {
            id: string;
            options: import("@prisma/client/runtime/library").JsonValue | null;
            prompt: string;
            correctIndex: number | null;
            points: number;
            sortOrder: number;
            assessmentId: string;
        }[];
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AssessmentType;
        description: string | null;
        createdById: string;
        title: string;
        dueDate: Date | null;
        weekNumber: number | null;
        maxScore: number;
    }>;
    addQuestion(me: RequestUser, assessmentId: string, dto: CreateQuestionDto): Promise<{
        id: string;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        prompt: string;
        correctIndex: number | null;
        points: number;
        sortOrder: number;
        assessmentId: string;
    }>;
    deleteQuestion(me: RequestUser, id: string): Promise<{
        ok: boolean;
    }>;
    submit(me: RequestUser, assessmentId: string, dto: SubmitAttemptDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        submittedAt: Date;
        maxScore: number;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        score: import("@prisma/client/runtime/library").Decimal | null;
        remarks: string | null;
        assessmentId: string;
        isGraded: boolean;
        gradedAt: Date | null;
        gradedById: string | null;
    }>;
    myAttempts(me: RequestUser, assessmentId: string): Promise<{
        attempts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            submittedAt: Date;
            maxScore: number;
            answers: import("@prisma/client/runtime/library").JsonValue | null;
            score: import("@prisma/client/runtime/library").Decimal | null;
            remarks: string | null;
            assessmentId: string;
            isGraded: boolean;
            gradedAt: Date | null;
            gradedById: string | null;
        }[];
        best: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            submittedAt: Date;
            maxScore: number;
            answers: import("@prisma/client/runtime/library").JsonValue | null;
            score: import("@prisma/client/runtime/library").Decimal | null;
            remarks: string | null;
            assessmentId: string;
            isGraded: boolean;
            gradedAt: Date | null;
            gradedById: string | null;
        };
        count: number;
    }>;
    allAttempts(me: RequestUser, assessmentId: string): Promise<({
        user: {
            id: string;
            email: string;
            displayName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        submittedAt: Date;
        maxScore: number;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        score: import("@prisma/client/runtime/library").Decimal | null;
        remarks: string | null;
        assessmentId: string;
        isGraded: boolean;
        gradedAt: Date | null;
        gradedById: string | null;
    })[]>;
    grade(me: RequestUser, attemptId: string, dto: GradeAttemptDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        submittedAt: Date;
        maxScore: number;
        answers: import("@prisma/client/runtime/library").JsonValue | null;
        score: import("@prisma/client/runtime/library").Decimal | null;
        remarks: string | null;
        assessmentId: string;
        isGraded: boolean;
        gradedAt: Date | null;
        gradedById: string | null;
    }>;
    private mustPlan;
    private mustItem;
}
