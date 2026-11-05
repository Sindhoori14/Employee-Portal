import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserCacheService } from '../user-cache.service';
export declare class JwtAuthGuard implements CanActivate {
    private reflector;
    private jwt;
    private users;
    constructor(reflector: Reflector, jwt: JwtService, users: UserCacheService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
    private bearer;
}
