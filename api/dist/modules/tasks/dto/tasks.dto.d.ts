export declare class CreateTaskDto {
    title: string;
    description?: string;
    goalId?: string;
    projectId?: string;
    targetScope?: 'INDIVIDUAL' | 'TEAM' | 'ORGANIZATION';
    ownerId?: string;
    teamId?: string;
    batchId?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    recurrenceUntil?: string;
    estimatedHours?: number;
    collaboratorIds?: string[];
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string | null;
    estimatedHours?: number | null;
    ownerId?: string;
    projectId?: string;
}
export declare class ChangeStatusDto {
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
    blockedReason?: string;
    reviewNote?: string;
}
export declare class AddCommentDto {
    body?: string;
    fileIds?: string[];
}
export declare class ListTasksQuery {
    status?: string;
    ownerId?: string;
    teamId?: string;
    projectId?: string;
    page?: string;
    limit?: string;
    search?: string;
    overdue?: string;
}
