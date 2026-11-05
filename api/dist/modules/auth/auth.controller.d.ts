import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto } from './dto/auth.dto';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthController {
    private auth;
    private prisma;
    constructor(auth: AuthService, prisma: PrismaService);
    private ip;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        user: any;
    }>;
    refresh(req: Request, res: Response): Promise<{
        user: any;
    }>;
    logout(req: Request, res: Response, me: RequestUser): Promise<{
        ok: boolean;
    }>;
    me(u: RequestUser): Promise<any>;
    change(u: RequestUser, dto: ChangePasswordDto, req: Request): Promise<{
        ok: boolean;
    }>;
    forgot(dto: ForgotPasswordDto, req: Request): Promise<{
        message: string;
    }>;
}
