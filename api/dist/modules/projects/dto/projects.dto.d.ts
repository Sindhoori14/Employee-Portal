export declare class CreateProjectDto {
    name: string;
    description?: string;
    teamId?: string;
    batchId?: string;
    ownerId?: string;
    status?: 'ACTIVE' | 'PAUSED' | 'DONE' | 'ARCHIVED';
    startDate?: string;
    dueDate?: string;
}
export declare class UpdateProjectDto {
    name?: string;
    description?: string;
    teamId?: string;
    batchId?: string;
    status?: 'ACTIVE' | 'PAUSED' | 'DONE' | 'ARCHIVED';
    ownerId?: string;
    startDate?: string;
    dueDate?: string;
}
