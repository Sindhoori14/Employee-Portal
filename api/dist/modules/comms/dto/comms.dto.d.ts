export declare class CreateAnnouncementDto {
    title: string;
    body: string;
    scope?: 'COMPANY' | 'TEAM' | 'BATCH';
    teamId?: string;
    batchId?: string;
    fileIds?: string[];
}
export declare class CreateChannelDto {
    type?: 'COMPANY' | 'TEAM' | 'BATCH' | 'GROUP' | 'DM';
    teamId?: string | null;
    batchId?: string;
    name?: string;
    description?: string;
    memberIds?: string[];
}
export declare class AddChannelMembersDto {
    userIds: string[];
}
export declare class PostMessageDto {
    body?: string;
    clientId?: string;
    fileIds?: string[];
}
