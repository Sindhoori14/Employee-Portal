import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../comms/realtime.gateway';
import { FilesService } from '../files/files.service';
export declare class AdminController {
    private prisma;
    private gateway;
    private files;
    constructor(prisma: PrismaService, gateway: RealtimeGateway, files: FilesService);
    audit(pageQ?: string, limitQ?: string, action?: string, entity?: string, actorId?: string, from?: string, to?: string): Promise<{
        data: ({
            actor: {
                id: string;
                email: string;
                displayName: string;
            } | null;
        } & {
            id: string;
            action: string;
            entity: string;
            entityId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            ip: string | null;
            createdAt: Date;
            actorId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    system(): Promise<{
        uptimeSec: number;
        node: string;
        onlineUsers: number;
        dbSizeMb: number;
        memoryMb: number;
        counts: {
            users: number;
            tasks: number;
            reports: number;
            auditLogs: number;
        };
        storage: {
            files: number;
            usedMb: number;
            diskFreeMb: number | null;
        };
    }>;
}
