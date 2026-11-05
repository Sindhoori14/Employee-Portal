import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto';
export declare class ProjectsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    private scope;
    private wire;
    list(me: RequestUser): Promise<any[]>;
    private mustSee;
    get(me: RequestUser, id: string): Promise<any>;
    create(me: RequestUser, dto: CreateProjectDto, ip?: string): Promise<any>;
    update(me: RequestUser, id: string, dto: UpdateProjectDto, ip?: string): Promise<any>;
}
