export declare class CreateUserDto {
    email: string;
    password?: string;
    displayName: string;
    role: 'ADMIN' | 'TEAM_LEAD' | 'COORDINATOR' | 'EMPLOYEE';
    teamId?: string;
    batchId?: string;
    assignAsLead?: boolean;
    assignAsCoordinator?: boolean;
}
export declare class UpdateUserDto {
    displayName?: string;
    role?: 'ADMIN' | 'TEAM_LEAD' | 'COORDINATOR' | 'EMPLOYEE';
    teamId?: string | null;
    batchId?: string | null;
    isActive?: boolean;
    mustChangePassword?: boolean;
    assignAsLead?: boolean;
    assignAsCoordinator?: boolean;
}
export declare class ListUsersQuery {
    page?: number;
    limit?: number;
    teamId?: string;
    role?: string;
    batchId?: string;
    search?: string;
    active?: string;
}
export declare class BulkUserRow {
    email: string;
    displayName: string;
    role?: 'TEAM_LEAD' | 'COORDINATOR' | 'EMPLOYEE';
    team?: string;
    batch?: string;
}
export declare class BulkCreateUsersDto {
    rows: BulkUserRow[];
}
export declare class ListUsersQueryExt {
    search?: string;
}
