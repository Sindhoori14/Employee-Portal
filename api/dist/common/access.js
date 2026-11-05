"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canSeeTask = canSeeTask;
exports.canSeeChannel = canSeeChannel;
function canSeeTask(me, task) {
    if (me.role === 'ADMIN' || me.role === 'TEAM_LEAD')
        return true;
    if (task.ownerId === me.id)
        return true;
    if (task.collaborators?.some((c) => c.userId === me.id))
        return true;
    if (me.role === 'COORDINATOR' && me.teamId && task.teamId === me.teamId)
        return true;
    return false;
}
function canSeeChannel(me, ch) {
    const type = ch.type ?? (ch.teamId ? 'TEAM' : 'COMPANY');
    if (type === 'GROUP' || type === 'DM') {
        return ch.createdById === me.id || !!ch.memberIds?.includes(me.id);
    }
    if (me.role === 'ADMIN')
        return true;
    if (type === 'COMPANY')
        return true;
    if (type === 'TEAM')
        return me.role === 'TEAM_LEAD' ? true : !!ch.teamId && me.teamId === ch.teamId;
    if (type === 'BATCH') {
        if (!ch.batchId)
            return false;
        if (me.batchId && me.batchId === ch.batchId)
            return true;
        return ch.batchLeadId === me.id || ch.batchCoordinatorId === me.id;
    }
    return false;
}
//# sourceMappingURL=access.js.map