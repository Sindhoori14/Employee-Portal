import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateBatchDto, UpdateBatchDto } from './dto/batches.dto';
export declare class BatchesService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            members: number;
        };
        lead: {
            id: string;
            email: string;
            displayName: string;
        } | null;
        coordinator: {
            id: string;
            email: string;
            displayName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        createdById: string | null;
        startDate: Date;
        endDate: Date;
        durationDays: number;
    })[]>;
    get(id: string, viewerRole?: string): Promise<{
        stats: {
            totalMembers: number;
            activeMembers: number;
            totalTasks: number;
            doneTasks: number;
            taskDoneRate: number;
            reportsToday: number;
        };
        lead: {
            id: string;
            email: string;
            displayName: string;
        } | null;
        coordinator: {
            id: string;
            email: string;
            displayName: string;
        } | null;
        members: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            displayName: string;
            isActive: boolean;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        createdById: string | null;
        startDate: Date;
        endDate: Date;
        durationDays: number;
    }>;
    create(meId: string, dto: CreateBatchDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        createdById: string | null;
        startDate: Date;
        endDate: Date;
        durationDays: number;
    }>;
    update(meId: string, id: string, dto: UpdateBatchDto, ip?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        leadId: string | null;
        coordinatorId: string | null;
        createdById: string | null;
        startDate: Date;
        endDate: Date;
        durationDays: number;
    }>;
    addMembers(meId: string, batchId: string, userIds: string[], ip?: string): Promise<{
        added: number;
    }>;
    removeMember(meId: string, batchId: string, userId: string, ip?: string): Promise<{
        removed: boolean;
    }>;
}
