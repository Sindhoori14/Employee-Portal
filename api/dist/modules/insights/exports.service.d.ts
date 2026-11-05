import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
export declare class ExportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private taskScope;
    tasksCsv(me: RequestUser, q: {
        teamId?: string;
        status?: string;
        from?: string;
        to?: string;
    }): Promise<{
        filename: string;
        body: string;
    }>;
    tasksPdf(me: RequestUser, q: {
        teamId?: string;
        status?: string;
        from?: string;
        to?: string;
    }): Promise<{
        filename: string;
        body: Buffer<ArrayBufferLike>;
    }>;
    reportsCsv(me: RequestUser, q: {
        date?: string;
        teamId?: string;
        from?: string;
        to?: string;
    }): Promise<{
        filename: string;
        body: string;
    }>;
    reportsPdf(me: RequestUser, q: {
        date?: string;
        teamId?: string;
        from?: string;
        to?: string;
    }): Promise<{
        filename: string;
        body: Buffer<ArrayBufferLike>;
    }>;
}
