export declare class CreateMeetingDto {
    teamId?: string | null;
    title: string;
    meetUrl: string;
    startsAt: string;
    endsAt?: string;
    recurrence?: 'NONE' | 'DAILY';
}
export declare class RequestLeaveDto {
    fromDate: string;
    toDate: string;
    reason: string;
}
export declare class UpdateMeetingNoteDto {
    note: string;
}
export declare class DecideLeaveDto {
    decision?: 'APPROVED' | 'REJECTED';
    note?: string;
}
export declare class ListLeavesDto {
    status?: string;
    teamId?: string;
    userId?: string;
}
