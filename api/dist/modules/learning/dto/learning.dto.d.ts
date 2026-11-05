export declare class CreatePlanDto {
    batchId: string;
    title: string;
    description?: string;
}
export declare class UpdatePlanDto {
    title?: string;
    description?: string;
}
export declare class CreateItemDto {
    dayNumber: number;
    weekNumber?: number;
    topic: string;
    description?: string;
    practiceTask?: string;
    expectedOutput?: string;
}
export declare class UpdateItemDto {
    dayNumber?: number;
    weekNumber?: number;
    topic?: string;
    description?: string;
    practiceTask?: string;
    expectedOutput?: string;
}
export declare class CreateMaterialDto {
    kind?: 'LINK' | 'DOCUMENT' | 'VIDEO' | 'OTHER';
    title: string;
    url?: string;
    fileKey?: string;
}
export declare class SetProgressDto {
    isDone?: boolean;
}
export declare class CreateAssessmentDto {
    batchId: string;
    title: string;
    description?: string;
    type?: 'QUIZ' | 'TASK_BASED';
    weekNumber?: number;
    maxScore?: number;
    dueDate?: string;
}
export declare class CreateQuestionDto {
    prompt: string;
    options?: string[];
    correctIndex?: number;
    points?: number;
}
export declare class SubmitAttemptDto {
    answers: Array<number | string | null>;
    questionIds?: string[];
}
export declare class GradeAttemptDto {
    score: number;
    remarks?: string;
}
export declare class SubmitReportDto {
    reportDate?: string;
    didToday: string;
    blockers?: string;
    planTomorrow: string;
    hoursWorked: number;
    taskIds?: string[];
    fileIds?: string[];
}
export declare class UpsertEvaluationDto {
    batchId: string;
    userId: string;
    remarks?: string;
    readiness?: 'NOT_ASSESSED' | 'NOT_READY' | 'DEVELOPING' | 'READY' | 'EXCELLENT';
    attendancePct?: number;
    taskCompletionPct?: number;
    avgScore?: number;
}
