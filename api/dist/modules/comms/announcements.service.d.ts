import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { CreateAnnouncementDto } from './dto/comms.dto';
import { NotificationsService } from './notifications.service';
import { FileLinkService } from '../../common/file-links.service';
export declare class AnnouncementsService {
    private prisma;
    private audit;
    private notifications;
    private links;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService, links: FileLinkService);
    create(me: RequestUser, dto: CreateAnnouncementDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        createdById: string;
        title: string;
        body: string;
        scope: import(".prisma/client").$Enums.AnnouncementScope;
    }>;
    feed(me: RequestUser): import(".prisma/client").Prisma.PrismaPromise<({
        files: {
            id: string;
            createdAt: Date;
            name: string;
            uploaderId: string;
            mime: string;
            size: number;
            width: number | null;
            height: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        createdById: string;
        title: string;
        body: string;
        scope: import(".prisma/client").$Enums.AnnouncementScope;
    })[]>;
    remove(me: RequestUser, id: string, ip?: string): Promise<{
        ok: boolean;
    }>;
}
