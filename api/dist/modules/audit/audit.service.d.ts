import { PrismaService } from '../../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        actorId?: string | null;
        action: string;
        entity: string;
        entityId?: string | null;
        metadata?: Record<string, unknown>;
        ip?: string | null;
    }): Promise<void>;
}
