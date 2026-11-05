import { PrismaService } from '../../prisma/prisma.service';
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    health(): Promise<{
        status: string;
        db: string;
        dbMs: number;
        uptimeSec: number;
        time: string;
    }>;
}
