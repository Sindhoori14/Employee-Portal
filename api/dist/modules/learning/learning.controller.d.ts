import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { LearningService } from './learning.service';
import { CreateAssessmentDto, CreateItemDto, CreateMaterialDto, CreatePlanDto, CreateQuestionDto, GradeAttemptDto, SetProgressDto, SubmitAttemptDto, UpdateItemDto, UpdatePlanDto } from './dto/learning.dto';
export declare class LearningController {
    private learning;
    constructor(learning: LearningService);
    private ip;
    createPlan(me: RequestUser, dto: CreatePlanDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        description: string | null;
        createdById: string;
        title: string;
    }>;
    plans(me: RequestUser, batchId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    plan(id: string, me: RequestUser): Promise<{
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
    updatePlan(me: RequestUser, id: string, dto: UpdatePlanDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        batchId: string;
        updatedAt: Date;
        description: string | null;
        createdById: string;
        title: string;
    }>;
    addItem(me: RequestUser, id: string, dto: CreateItemDto, req: Request): Promise<{
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
    deleteItem(me: RequestUser, id: string, req: Request): Promise<{
        ok: boolean;
    }>;
    addMaterial(me: RequestUser, id: string, dto: CreateMaterialDto): Promise<{
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
    progress(me: RequestUser, id: string, dto: SetProgressDto): Promise<{
        updatedAt: Date;
        userId: string;
        completedAt: Date | null;
        isDone: boolean;
        trainingItemId: string;
    }>;
    batchProgress(me: RequestUser, id: string): Promise<{
        total: number;
        trainees: {
            done: number;
            progressPct: number;
            id: string;
            email: string;
            displayName: string;
        }[];
    }>;
    createAssessment(me: RequestUser, dto: CreateAssessmentDto, req: Request): Promise<{
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
    assessments(me: RequestUser, batchId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    assessment(id: string, me: RequestUser): Promise<{
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
    addQuestion(me: RequestUser, id: string, dto: CreateQuestionDto): Promise<{
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
    submit(me: RequestUser, id: string, dto: SubmitAttemptDto, req: Request): Promise<{
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
    mine(me: RequestUser, id: string): Promise<{
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
    all(me: RequestUser, id: string): Promise<({
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
    grade(me: RequestUser, id: string, dto: GradeAttemptDto, req: Request): Promise<{
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
}
