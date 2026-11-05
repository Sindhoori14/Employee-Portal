import { RealtimeGateway } from './realtime.gateway';
import type { Request } from 'express';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { AnnouncementsService } from './announcements.service';
import { ChannelsService } from './channels.service';
import { NotificationsService } from './notifications.service';
import { AddChannelMembersDto, CreateAnnouncementDto, CreateChannelDto, PostMessageDto } from './dto/comms.dto';
export declare class CommsController {
    private announcements;
    private channels;
    private notifications;
    private gateway;
    constructor(announcements: AnnouncementsService, channels: ChannelsService, notifications: NotificationsService, gateway: RealtimeGateway);
    private ip;
    postAnnouncement(me: RequestUser, dto: CreateAnnouncementDto, req: Request): Promise<{
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        createdById: string;
        title: string;
        body: string;
        scope: import(".prisma/client").$Enums.AnnouncementScope;
    }>;
    feed(me: RequestUser): import(".prisma/client").Prisma.PrismaPromise<({
        files: {
            id: string;
            createdAt: Date;
            name: string;
            uploaderId: string;
            mime: string;
            size: number;
            width: number | null;
            height: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        teamId: string | null;
        batchId: string | null;
        updatedAt: Date;
        createdById: string;
        title: string;
        body: string;
        scope: import(".prisma/client").$Enums.AnnouncementScope;
    })[]>;
    deleteAnnouncement(me: RequestUser, id: string, req: Request): Promise<{
        ok: boolean;
    }>;
    listChannels(me: RequestUser, teamId?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ChannelType;
        name: string;
        description: string | null;
        teamId: string | null;
        batchId: string | null;
        team: {
            name: string;
        } | null;
        batch: {
            id: string;
            name: string;
        } | null;
        createdAt: Date;
        peer: {
            id: string;
            displayName: string;
        } | null;
        memberIds: string[];
        memberCount: number;
        unread: number;
        lastMessageAt: Date | null;
    }[]>;
    createChannel(me: RequestUser, dto: CreateChannelDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        teamId: string | null;
        batchId: string | null;
        type: import(".prisma/client").$Enums.ChannelType;
        description: string | null;
        createdById: string;
    }>;
    unread(me: RequestUser): Promise<{
        unread: number;
    }>;
    contacts(me: RequestUser): Promise<{
        team: {
            name: string;
        } | null;
        batch: {
            name: string;
        } | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        displayName: string;
    }[]>;
    addMembers(me: RequestUser, id: string, dto: AddChannelMembersDto): Promise<{
        ok: boolean;
    }>;
    removeMember(me: RequestUser, id: string, userId: string): Promise<{
        ok: boolean;
    }>;
    messages(me: RequestUser, id: string, limit?: string, before?: string, after?: string): Promise<{
        messages: {
            id: any;
            channelId: any;
            clientId: any;
            createdAt: any;
            author: any;
            body: any;
            deleted: boolean;
            files: any;
        }[];
        hasMore: boolean;
    }>;
    post(me: RequestUser, id: string, dto: PostMessageDto): Promise<{
        id: any;
        channelId: any;
        clientId: any;
        createdAt: any;
        author: any;
        body: any;
        deleted: boolean;
        files: any;
    }>;
    deleteMessage(me: RequestUser, id: string, messageId: string): Promise<{
        ok: boolean;
    }>;
    markRead(me: RequestUser, id: string): Promise<{
        ok: boolean;
    }>;
    presence(): {
        online: string[];
    };
    notifs(me: RequestUser, unread?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            link: string | null;
            userId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            body: string | null;
            isRead: boolean;
        }[];
        unread: number;
    }>;
    read(me: RequestUser, id: string): Promise<{
        ok: boolean;
    }>;
    readAll(me: RequestUser): Promise<{
        ok: boolean;
    }>;
}
