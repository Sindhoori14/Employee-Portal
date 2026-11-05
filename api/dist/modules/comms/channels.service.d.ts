import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/decorators/current-user.decorator';
import { FileLinkService } from '../../common/file-links.service';
import { CreateChannelDto, PostMessageDto } from './dto/comms.dto';
import { RealtimeGateway } from './realtime.gateway';
export declare class ChannelsService {
    private prisma;
    private realtime;
    private links;
    constructor(prisma: PrismaService, realtime: RealtimeGateway, links: FileLinkService);
    private accessOf;
    private ensureBatchChannels;
    private visibleWhere;
    list(me: RequestUser, filter?: string): Promise<{
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
    totalUnread(me: RequestUser): Promise<{
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
    create(me: RequestUser, dto: CreateChannelDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        teamId: string | null;
        batchId: string | null;
        type: import(".prisma/client").$Enums.ChannelType;
        description: string | null;
        createdById: string;
    }>;
    private assertNameFree;
    private validMemberIds;
    addMembers(me: RequestUser, channelId: string, userIds: string[]): Promise<{
        ok: boolean;
    }>;
    removeMember(me: RequestUser, channelId: string, userId: string): Promise<{
        ok: boolean;
    }>;
    private mustSee;
    messages(me: RequestUser, channelId: string, q: {
        limit?: number;
        before?: string;
        after?: string;
    }): Promise<{
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
    post(me: RequestUser, channelId: string, dto: PostMessageDto): Promise<{
        id: any;
        channelId: any;
        clientId: any;
        createdAt: any;
        author: any;
        body: any;
        deleted: boolean;
        files: any;
    }>;
    remove(me: RequestUser, channelId: string, messageId: string): Promise<{
        ok: boolean;
    }>;
    markRead(me: RequestUser, channelId: string): Promise<{
        ok: boolean;
    }>;
}
