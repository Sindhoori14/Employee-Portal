export declare class CreateTicketDto {
    subject: string;
    description: string;
    category?: 'WORK' | 'ACCESS' | 'ATTENDANCE' | 'TECHNICAL' | 'OTHER';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    escalateToAdmin?: boolean;
}
export declare class UpdateTicketDto {
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    resolution?: string;
    assigneeId?: string;
    escalated?: boolean;
}
export declare class AddTicketMessageDto {
    body: string;
}
