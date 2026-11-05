export declare class CheckInDto {
    mode?: 'OFFICE' | 'REMOTE';
    note?: string;
}
export declare class CheckOutDto {
    note?: string;
}
export declare class StartBreakDto {
    reason: 'LUNCH' | 'TEA' | 'PERSONAL' | 'OTHER';
    note?: string;
}
export declare class MarkAttendanceDto {
    userId: string;
    day: string;
    status?: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
    checkIn?: string;
    checkOut?: string;
    mode?: 'OFFICE' | 'REMOTE';
    reason: string;
}
