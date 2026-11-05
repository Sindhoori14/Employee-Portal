import { FileContext, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare const FILE_SELECT: {
    readonly id: true;
    readonly name: true;
    readonly mime: true;
    readonly size: true;
    readonly width: true;
    readonly height: true;
    readonly createdAt: true;
    readonly uploaderId: true;
};
export declare const LIVE_FILES: {
    where: {
        deletedAt: null;
    };
    select: {
        readonly id: true;
        readonly name: true;
        readonly mime: true;
        readonly size: true;
        readonly width: true;
        readonly height: true;
        readonly createdAt: true;
        readonly uploaderId: true;
    };
    orderBy: {
        createdAt: "asc";
    };
};
export declare const MAX_FILES_PER_ITEM = 10;
export declare class FileLinkService {
    private prisma;
    constructor(prisma: PrismaService);
    claim(tx: Prisma.TransactionClient | PrismaService, userId: string, fileIds: string[] | undefined, expect: {
        context: FileContext;
        scopeId?: string | null;
    }, link: Partial<Record<'taskId' | 'commentId' | 'messageId' | 'reportId' | 'announcementId', string>>): Promise<number>;
}
