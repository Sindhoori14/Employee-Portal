export declare class CreateTeamDto {
    name: string;
    description?: string;
    leadId?: string;
    coordinatorId?: string;
    hrId?: string;
}
export declare class UpdateTeamDto {
    name?: string;
    description?: string;
    leadId?: string | null;
    coordinatorId?: string | null;
    hrId?: string | null;
}
export declare class AddTeamMembersDto {
    userIds: string[];
}
export declare class TransferTeamMemberDto {
    userId: string;
    targetTeamId: string;
}
