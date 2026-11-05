import type { Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { UserCacheService } from '../../common/user-cache.service';
import { AuditService } from '../audit/audit.service';
import { RealtimeGateway } from '../comms/realtime.gateway';
import { NotificationsService } from '../comms/notifications.service';
export declare const UPLOAD_ROOT: string;
export declare class FilesService {
    private prisma;
    private audit;
    private cache;
    private gateway;
    private notifications;
    private log;
    private avatarCache;
    constructor(prisma: PrismaService, audit: AuditService, cache: UserCacheService, gateway: RealtimeGateway, notifications: NotificationsService);
    private receive;
    private commit;
    upload(me: RequestUser, req: Request, q: {
        context?: string;
        scopeId?: string;
        name?: string;
        w?: string;
        h?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        uploaderId: string;
        mime: string;
        size: number;
        width: number | null;
        height: number | null;
    }>;
    private assertCanUploadTo;
    setAvatar(me: RequestUser, req: Request): Promise<{
        avatarFileId: string;
    }>;
    removeAvatar(actor: RequestUser, userId: string, ip?: string): Promise<{
        ok: boolean;
    }>;
    private afterAvatarChange;
    avatarMap(): Promise<Record<string, string>>;
    serveAvatar(userId: string, v: string | undefined, res: Response): Promise<void>;
    private canAccess;
    serve(me: RequestUser, id: string, inline: boolean, res: Response): Promise<void>;
    private send;
    remove(me: RequestUser, id: string, ip?: string): Promise<{
        ok: boolean;
    }>;
    sweep(): Promise<{
        abandoned: number;
        purged: number;
        tmpRemoved: number;
    }>;
    stats(): Promise<{
        files: number;
        usedMb: number;
        diskFreeMb: number | null;
    }>;
}
