import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { RealtimeGateway } from './realtime.gateway';
import { MailService } from '../../common/mail.service';
export interface NotifyInput {
    type: 'TASK_ASSIGNED' | 'TASK_STATUS_CHANGED' | 'TASK_BLOCKED' | 'REVIEW_REQUESTED' | 'REVIEW_DECISION' | 'REPORT_MISSING' | 'REPORT_REMINDER' | 'ANNOUNCEMENT' | 'ASSESSMENT_ASSIGNED' | 'ASSESSMENT_GRADED' | 'MENTION' | 'PASSWORD_RESET_REQUEST' | 'TASK_COMMENT' | 'ATTENTION' | 'ATTENDANCE' | 'SYSTEM' | 'MEETING_REMINDER' | 'TICKET';
    title: string;
    body?: string;
    link?: string;
}
export declare class NotificationsService {
    private prisma;
    private realtime;
    private mail;
    constructor(prisma: PrismaService, realtime: RealtimeGateway, mail: MailService);
    notify(userIds: string[], n: NotifyInput): Promise<Array<{
        userId: string;
    }>>;
    list(me: RequestUser, q: {
        unread?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        data: {
            id: string;
            createdAt: Date;
            link: string | null;
            userId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            body: string | null;
            isRead: boolean;
        }[];
        unread: number;
    }>;
    markRead(me: RequestUser, id: string): Promise<{
        ok: boolean;
    }>;
    markAllRead(me: RequestUser): Promise<{
        ok: boolean;
    }>;
}
