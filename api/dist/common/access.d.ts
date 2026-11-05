import { RequestUser } from './decorators/current-user.decorator';
export declare function canSeeTask(me: Pick<RequestUser, 'id' | 'role' | 'teamId'>, task: {
    ownerId: string;
    teamId: string | null;
    collaborators?: Array<{
        userId: string;
    }>;
}): boolean;
export interface ChannelAccessInfo {
    type?: string;
    teamId: string | null;
    batchId?: string | null;
    createdById?: string;
    memberIds?: string[];
    batchLeadId?: string | null;
    batchCoordinatorId?: string | null;
}
export declare function canSeeChannel(me: Pick<RequestUser, 'id' | 'role' | 'teamId' | 'batchId'>, ch: ChannelAccessInfo): boolean;
