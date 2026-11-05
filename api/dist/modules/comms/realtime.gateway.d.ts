import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { UserCacheService } from '../../common/user-cache.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private prisma;
    private jwt;
    private users;
    server: Server;
    private online;
    private offlineTimers;
    private teamIdsCache;
    constructor(prisma: PrismaService, jwt: JwtService, users: UserCacheService);
    private allTeamIds;
    handleConnection(client: Socket): Promise<Socket<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any> | undefined>;
    handleDisconnect(client: Socket): undefined;
    onlineIds(): string[];
    onlineCount(): number;
    joinTask(client: Socket, body: {
        taskId?: string;
    }): Promise<{
        ok: boolean;
    }>;
    joinChannel(client: Socket, body: {
        channelId?: string;
    }): Promise<{
        ok: boolean;
    }>;
    leaveChannel(client: Socket, body: {
        channelId?: string;
    }): {
        ok: boolean;
    };
    typing(client: Socket, body: {
        channelId?: string;
        name?: string;
    }): void;
    emitTask(taskId: string, teamId: string | null, event: string, payload: unknown): void;
    disconnectUser(userId: string): void;
    emitChannelMessage(ch: {
        id: string;
        type?: string;
        teamId: string | null;
        batchId?: string | null;
        memberIds?: string[];
    }, message: unknown, authorId: string): void;
    emitChannelDeleted(channelId: string, messageId: string): void;
    emitAttendance(teamId: string | null, userId: string): void;
    emitToUsers(userIds: string[], payload: unknown): void;
}
