export interface RequestUser {
    id: string;
    email: string;
    displayName: string;
    role: 'ADMIN' | 'TEAM_LEAD' | 'COORDINATOR' | 'EMPLOYEE';
    teamId: string | null;
    batchId: string | null;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
