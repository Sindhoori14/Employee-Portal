import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { BulkCreateUsersDto, CreateUserDto, ListUsersQuery, UpdateUserDto } from './dto/users.dto';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    list(me: RequestUser, q: ListUsersQuery): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    get(me: RequestUser, id: string): Promise<any>;
    create(me: RequestUser, dto: CreateUserDto, req: Request): Promise<any>;
    bulk(me: RequestUser, dto: BulkCreateUsersDto, req: Request): Promise<{
        created: {
            email: string;
            displayName: string;
            role: string;
            team: string | null;
            batch: string | null;
            tempPassword: string;
        }[];
        skipped: {
            email: string;
            reason: string;
        }[];
    }>;
    reset(me: RequestUser, id: string, req: Request): Promise<{
        email: string;
        displayName: string;
        tempPassword: string;
    }>;
    update(me: RequestUser, id: string, dto: UpdateUserDto, req: Request): Promise<any>;
}
