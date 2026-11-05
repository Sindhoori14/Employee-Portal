import type { Request, Response } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { FilesService } from './files.service';
export declare class FilesController {
    private files;
    constructor(files: FilesService);
    upload(me: RequestUser, req: Request, q: {
        context?: string;
        scopeId?: string;
        name?: string;
        w?: string;
        h?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        uploaderId: string;
        mime: string;
        size: number;
        width: number | null;
        height: number | null;
    }>;
    download(me: RequestUser, id: string, inline: string | undefined, res: Response): Promise<void>;
    remove(me: RequestUser, id: string, req: Request): Promise<{
        ok: boolean;
    }>;
    map(): Promise<Record<string, string>>;
    setMine(me: RequestUser, req: Request): Promise<{
        avatarFileId: string;
    }>;
    avatar(userId: string, v: string | undefined, res: Response): Promise<void>;
    removeAvatar(me: RequestUser, userId: string, req: Request): Promise<{
        ok: boolean;
    }>;
}
