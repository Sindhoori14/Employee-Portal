import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto';
export declare class ProjectsController {
    private projects;
    constructor(projects: ProjectsService);
    list(me: RequestUser): Promise<any[]>;
    get(me: RequestUser, id: string): Promise<any>;
    create(me: RequestUser, dto: CreateProjectDto, req: Request): Promise<any>;
    update(me: RequestUser, id: string, dto: UpdateProjectDto, req: Request): Promise<any>;
}
