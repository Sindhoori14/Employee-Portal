export declare class CreateBatchDto {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    leadId?: string;
    coordinatorId?: string;
}
export declare class UpdateBatchDto {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
    leadId?: string | null;
    coordinatorId?: string | null;
}
export declare class AddBatchMembersDto {
    userIds: string[];
}
