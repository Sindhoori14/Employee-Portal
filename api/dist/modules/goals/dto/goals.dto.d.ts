export declare class CreateGoalDto {
    title: string;
    description?: string;
    type?: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    targetScope?: 'INDIVIDUAL' | 'TEAM';
    ownerId?: string;
    teamId?: string;
    batchId?: string;
    progress?: number;
    startDate?: string;
    endDate?: string;
}
export declare class UpdateGoalDto {
    title?: string;
    description?: string;
    type?: 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    status?: 'ACTIVE' | 'DONE' | 'ARCHIVED';
    ownerId?: string | null;
    teamId?: string | null;
    progress?: number;
    startDate?: string;
    endDate?: string;
}
export declare class UpdateGoalProgressDto {
    progress: number;
}
