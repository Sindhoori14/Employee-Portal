"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../comms/notifications.service");
const realtime_gateway_1 = require("../comms/realtime.gateway");
const access_1 = require("../../common/access");
const file_links_service_1 = require("../../common/file-links.service");
const EMPLOYEE_OK = {
    TODO: ['IN_PROGRESS', 'BLOCKED'],
    IN_PROGRESS: ['IN_REVIEW', 'BLOCKED', 'TODO'],
    IN_REVIEW: ['IN_PROGRESS', 'BLOCKED'],
    BLOCKED: ['IN_PROGRESS', 'TODO'],
    DONE: [],
};
const canSee = access_1.canSeeTask;
function plusDays(d, n) {
    return new Date(d.getTime() + n * 86_400_000);
}
function plusMonths(d, n) {
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + n;
    const day = Math.min(d.getUTCDate(), new Date(Date.UTC(y, m + 1, 0)).getUTCDate());
    return new Date(Date.UTC(y, m, day, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()));
}
function occurrenceDates(start, recurrence, until) {
    if (recurrence === 'NONE')
        return [];
    const out = [new Date(start)];
    for (let i = 1; i < 60; i++) {
        const next = recurrence === 'DAILY' ? plusDays(start, i) : recurrence === 'WEEKLY' ? plusDays(start, i * 7) : plusMonths(start, i);
        if (next > until)
            break;
        out.push(next);
    }
    return out;
}
function plansOwnTeam(me, teamId) {
    if (me.role === 'ADMIN')
        return true;
    if (me.role !== 'TEAM_LEAD' && me.role !== 'COORDINATOR')
        return false;
    return !!me.teamId && me.teamId === teamId;
}
let TasksService = class TasksService {
    prisma;
    audit;
    notifications;
    realtime;
    links;
    constructor(prisma, audit, notifications, realtime, links) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
        this.realtime = realtime;
        this.links = links;
    }
    async list(me, q) {
        const page = Math.max(1, Number(q.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
        const where = {};
        if (q.status)
            where.status = q.status;
        if (q.ownerId)
            where.ownerId = q.ownerId;
        if (q.teamId)
            where.teamId = q.teamId;
        if (q.projectId)
            where.projectId = q.projectId;
        if (q.search?.trim())
            where.title = { contains: q.search.trim(), mode: 'insensitive' };
        if (q.overdue === 'true') {
            where.dueDate = { lt: new Date() };
            where.status = { not: 'DONE' };
        }
        if (me.role === 'EMPLOYEE') {
            const collab = await this.prisma.taskCollaborator.findMany({ where: { userId: me.id }, select: { taskId: true } });
            const ids = collab.map((c) => c.taskId);
            where.OR = [{ ownerId: me.id }, ...(ids.length ? [{ id: { in: ids } }] : [])];
        }
        else if (me.role === 'COORDINATOR') {
            if (!me.teamId)
                return { data: [], meta: { total: 0, page, limit, totalPages: 1 } };
            where.teamId = me.teamId;
        }
        const [total, rows] = await Promise.all([
            this.prisma.task.count({ where }),
            this.prisma.task.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                include: { owner: { select: { id: true, displayName: true } }, collaborators: { select: { userId: true } }, project: { select: { id: true, name: true } } },
            }),
        ]);
        return { data: rows, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
    }
    async get(me, id) {
        const t = await this.prisma.task.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, displayName: true, email: true } },
                project: { select: { id: true, name: true } },
                collaborators: { include: { user: { select: { id: true, displayName: true } } } },
                comments: { include: { author: { select: { id: true, displayName: true } }, files: file_links_service_1.LIVE_FILES }, orderBy: { createdAt: 'asc' } },
                files: { where: { deletedAt: null, commentId: null }, select: file_links_service_1.FILE_SELECT, orderBy: { createdAt: 'asc' } },
                activities: { orderBy: { createdAt: 'desc' }, take: 50 },
            },
        });
        if (!t)
            throw new common_1.NotFoundException('Task not found');
        if (!canSee(me, { ownerId: t.ownerId, teamId: t.teamId, collaborators: t.collaborators }))
            throw new common_1.ForbiddenException('Forbidden');
        return t;
    }
    async create(me, dto, ip) {
        if (!['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role)) {
            throw new common_1.ForbiddenException('Only leads, coordinators and admins assign tasks');
        }
        const targetScope = dto.targetScope || (dto.ownerId ? 'INDIVIDUAL' : dto.teamId ? 'TEAM' : 'ORGANIZATION');
        if (targetScope === 'ORGANIZATION') {
            if (me.role !== 'ADMIN')
                throw new common_1.ForbiddenException('Only admins can assign organization-wide tasks');
            const activeEmployees = await this.prisma.user.findMany({
                where: { isActive: true, role: { in: ['EMPLOYEE', 'COORDINATOR', 'TEAM_LEAD'] } },
                select: { id: true, displayName: true, teamId: true },
            });
            if (!activeEmployees.length)
                throw new common_1.BadRequestException('No active employees found to assign');
            let fallbackTeamId = dto.teamId;
            if (!fallbackTeamId) {
                const firstTeam = await this.prisma.team.findFirst({ select: { id: true } });
                fallbackTeamId = firstTeam?.id;
            }
            const tasksToCreate = activeEmployees
                .map((member) => ({
                title: dto.title.trim(),
                description: dto.description ?? null,
                goalId: dto.goalId ?? null,
                projectId: dto.projectId ?? null,
                ownerId: member.id,
                teamId: member.teamId || fallbackTeamId,
                batchId: dto.batchId ?? null,
                priority: (dto.priority ?? 'MEDIUM'),
                estimatedHours: dto.estimatedHours ?? null,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                createdById: me.id,
                recurrence: 'NONE',
            }))
                .filter((t) => Boolean(t.teamId));
            const created = await this.prisma.$transaction(tasksToCreate.map((data) => this.prisma.task.create({
                data: {
                    ...data,
                    activities: { create: { actorId: me.id, action: 'CREATED', toStatus: 'TODO' } },
                },
            })));
            await this.audit.log({
                actorId: me.id,
                action: 'TASK_CREATE_ORG_WIDE',
                entity: 'task',
                entityId: created[0]?.id || 'bulk',
                metadata: { title: dto.title, count: created.length },
                ip,
            });
            const userIdsToNotify = activeEmployees.map((m) => m.id).filter((id) => id !== me.id);
            await this.notifications.notify(userIdsToNotify, {
                type: 'TASK_ASSIGNED',
                title: `Company-wide Task: ${dto.title.trim()}`,
                body: `Assigned organization-wide by ${me.displayName}`,
                link: `/tasks`,
            });
            return {
                id: created[0]?.id,
                title: dto.title.trim(),
                status: 'TODO',
                createdCount: created.length,
                message: `Created ${created.length} independent tasks across the organization`,
                tasks: created,
            };
        }
        if (targetScope === 'TEAM') {
            if (!dto.teamId)
                throw new common_1.BadRequestException('teamId is required for team task assignment');
            if (!plansOwnTeam(me, dto.teamId))
                throw new common_1.ForbiddenException('You can assign tasks only within your own team');
            const teamMembers = await this.prisma.user.findMany({
                where: { teamId: dto.teamId, isActive: true },
                select: { id: true, displayName: true },
            });
            if (!teamMembers.length)
                throw new common_1.BadRequestException('No active members found in the selected team');
            const tasksToCreate = teamMembers.map((member) => ({
                title: dto.title.trim(),
                description: dto.description ?? null,
                goalId: dto.goalId ?? null,
                projectId: dto.projectId ?? null,
                ownerId: member.id,
                teamId: dto.teamId,
                batchId: dto.batchId ?? null,
                priority: (dto.priority ?? 'MEDIUM'),
                estimatedHours: dto.estimatedHours ?? null,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                createdById: me.id,
                recurrence: 'NONE',
            }));
            const created = await this.prisma.$transaction(tasksToCreate.map((data) => this.prisma.task.create({
                data: {
                    ...data,
                    activities: { create: { actorId: me.id, action: 'CREATED', toStatus: 'TODO' } },
                },
            })));
            await this.audit.log({
                actorId: me.id,
                action: 'TASK_CREATE_TEAM',
                entity: 'task',
                entityId: created[0]?.id || 'bulk',
                metadata: { title: dto.title, teamId: dto.teamId, count: created.length },
                ip,
            });
            const userIdsToNotify = teamMembers.map((m) => m.id).filter((id) => id !== me.id);
            await this.notifications.notify(userIdsToNotify, {
                type: 'TASK_ASSIGNED',
                title: `Team Task: ${dto.title.trim()}`,
                body: `Assigned to team by ${me.displayName}`,
                link: `/tasks`,
            });
            return {
                id: created[0]?.id,
                title: dto.title.trim(),
                status: 'TODO',
                createdCount: created.length,
                message: `Created ${created.length} independent tasks for team members`,
                tasks: created,
            };
        }
        if (!dto.ownerId)
            throw new common_1.BadRequestException('ownerId is required for individual task assignment');
        const owner = await this.prisma.user.findUnique({
            where: { id: dto.ownerId },
            select: { id: true, isActive: true, teamId: true },
        });
        if (!owner || !owner.isActive)
            throw new common_1.BadRequestException('Invalid owner');
        const effectiveTeamId = dto.teamId || owner.teamId;
        if (!effectiveTeamId)
            throw new common_1.BadRequestException('The assignee does not have an assigned team. Please specify a team.');
        if (!plansOwnTeam(me, effectiveTeamId))
            throw new common_1.ForbiddenException('You can assign tasks only within your own team');
        const team = await this.prisma.team.findUnique({ where: { id: effectiveTeamId }, select: { id: true } });
        if (!team)
            throw new common_1.BadRequestException('Invalid team');
        if (owner.teamId && owner.teamId !== effectiveTeamId) {
            throw new common_1.BadRequestException('The assignee does not belong to that team');
        }
        let collaboratorIds = [...new Set(dto.collaboratorIds ?? [])].filter((x) => x !== dto.ownerId);
        if (collaboratorIds.length) {
            const ok = await this.prisma.user.findMany({ where: { id: { in: collaboratorIds }, isActive: true }, select: { id: true } });
            collaboratorIds = ok.map((u) => u.id);
        }
        if (dto.projectId) {
            const project = await this.prisma.project.findUnique({ where: { id: dto.projectId }, select: { teamId: true } });
            if (!project)
                throw new common_1.BadRequestException('Invalid projectId');
            if (project.teamId && project.teamId !== effectiveTeamId)
                throw new common_1.BadRequestException('That project belongs to another team');
        }
        const recurrence = dto.recurrence ?? 'NONE';
        const firstDue = dto.dueDate ? new Date(dto.dueDate) : null;
        if (recurrence !== 'NONE' && !firstDue)
            throw new common_1.BadRequestException('Recurring tasks need a due date');
        let until = null;
        if (recurrence !== 'NONE' && firstDue) {
            const requested = dto.recurrenceUntil ? new Date(dto.recurrenceUntil) : plusDays(firstDue, 30);
            if (requested < firstDue)
                throw new common_1.BadRequestException('Repeat-until must be on or after the due date');
            until = new Date(Math.min(requested.getTime(), plusDays(firstDue, 90).getTime()));
        }
        const dates = recurrence !== 'NONE' && firstDue ? occurrenceDates(firstDue, recurrence, until) : [];
        const fields = {
            title: dto.title.trim(),
            description: dto.description ?? null,
            goalId: dto.goalId ?? null,
            projectId: dto.projectId ?? null,
            ownerId: dto.ownerId,
            teamId: effectiveTeamId,
            batchId: dto.batchId ?? null,
            priority: (dto.priority ?? 'MEDIUM'),
            estimatedHours: dto.estimatedHours ?? null,
            createdById: me.id,
            recurrence,
            recurrenceUntil: until,
        };
        const t = await this.prisma.$transaction(async (tx) => {
            const first = await tx.task.create({
                data: {
                    ...fields,
                    dueDate: firstDue,
                    collaborators: collaboratorIds.length ? { create: collaboratorIds.map((userId) => ({ userId })) } : undefined,
                    activities: { create: { actorId: me.id, action: 'CREATED', toStatus: 'TODO' } },
                },
            });
            if (dates.length > 1) {
                await tx.task.update({ where: { id: first.id }, data: { seriesId: first.id } });
                await tx.task.createMany({
                    data: dates.slice(1).map((dueDate) => ({ ...fields, dueDate, seriesId: first.id })),
                });
                first.seriesId = first.id;
            }
            return first;
        });
        await this.audit.log({
            actorId: me.id, action: 'TASK_CREATE', entity: 'task', entityId: t.id,
            metadata: { ownerId: dto.ownerId, teamId: effectiveTeamId, recurrence, occurrences: recurrence === 'NONE' ? 1 : dates.length }, ip,
        });
        await this.notifications.notify([dto.ownerId, ...collaboratorIds].filter((x) => x !== me.id), {
            type: 'TASK_ASSIGNED', title: `New task: ${t.title}`,
            body: `Assigned by ${me.displayName}${recurrence !== 'NONE' ? ` · repeats ${recurrence.toLowerCase()} (${dates.length} occurrences)` : ''}`,
            link: `/tasks/${t.id}`,
        });
        this.realtime.emitTask(t.id, t.teamId, 'task:created', { id: t.id, title: t.title, status: t.status });
        return t;
    }
    async stopSeries(me, id, ip) {
        const t = await this.prisma.task.findUnique({
            where: { id }, select: { id: true, seriesId: true, teamId: true, dueDate: true, recurrence: true },
        });
        if (!t)
            throw new common_1.NotFoundException('Task not found');
        if (!plansOwnTeam(me, t.teamId))
            throw new common_1.ForbiddenException('Only the team lead, coordinator or admin can stop a repeat');
        if (!t.seriesId || t.recurrence === 'NONE')
            throw new common_1.BadRequestException('This task does not repeat');
        const removed = t.dueDate
            ? await this.prisma.task.deleteMany({
                where: { seriesId: t.seriesId, dueDate: { gt: t.dueDate }, status: { not: 'DONE' }, id: { not: t.id } },
            })
            : { count: 0 };
        await this.prisma.task.update({ where: { id }, data: { recurrence: 'NONE', recurrenceUntil: null } });
        await this.audit.log({ actorId: me.id, action: 'TASK_SERIES_STOP', entity: 'task', entityId: id, metadata: { removed: removed.count }, ip });
        this.realtime.emitTask(t.id, t.teamId, 'task:updated', { id: t.id, stopsRepeat: true });
        return { ok: true, removed: removed.count };
    }
    async update(me, id, dto, ip) {
        const t = await this.prisma.task.findUnique({ where: { id } });
        if (!t)
            throw new common_1.NotFoundException('Task not found');
        if (me.role === 'EMPLOYEE') {
            if (t.ownerId !== me.id)
                throw new common_1.ForbiddenException('Forbidden');
            const restricted = ['title', 'priority', 'dueDate', 'estimatedHours', 'ownerId'];
            if (restricted.some((k) => dto[k] !== undefined))
                throw new common_1.ForbiddenException('Only your lead or coordinator can change title, priority, due date or assignee');
        }
        else if (!plansOwnTeam(me, t.teamId)) {
            throw new common_1.ForbiddenException('Outside your team');
        }
        if (dto.projectId) {
            const project = await this.prisma.project.findUnique({ where: { id: dto.projectId }, select: { teamId: true } });
            if (!project)
                throw new common_1.BadRequestException('Invalid projectId');
            if (project.teamId && project.teamId !== t.teamId)
                throw new common_1.BadRequestException('That project belongs to another team');
        }
        let newOwner = null;
        if (dto.ownerId && dto.ownerId !== t.ownerId) {
            const o = await this.prisma.user.findUnique({ where: { id: dto.ownerId }, select: { id: true, isActive: true, teamId: true } });
            if (!o || !o.isActive)
                throw new common_1.BadRequestException('Invalid owner');
            if (o.teamId !== t.teamId)
                throw new common_1.BadRequestException('The new assignee is not in this task\'s team');
            newOwner = o;
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const u = await tx.task.update({
                where: { id },
                data: {
                    ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
                    ...(dto.description !== undefined ? { description: dto.description } : {}),
                    ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
                    ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null } : {}),
                    ...(dto.estimatedHours !== undefined ? { estimatedHours: dto.estimatedHours } : {}),
                    ...(dto.projectId !== undefined ? { projectId: dto.projectId } : {}),
                    ...(newOwner ? { ownerId: newOwner.id } : {}),
                },
            });
            await tx.taskActivity.create({ data: { taskId: id, actorId: me.id, action: newOwner ? 'REASSIGNED' : 'UPDATED' } });
            return u;
        });
        await this.audit.log({ actorId: me.id, action: 'TASK_UPDATE', entity: 'task', entityId: id, metadata: dto, ip });
        if (newOwner) {
            await this.notifications.notify([newOwner.id], { type: 'TASK_ASSIGNED', title: `Task assigned to you: ${updated.title}`, body: `Reassigned by ${me.displayName}`, link: `/tasks/${id}` });
            await this.notifications.notify([t.ownerId], { type: 'TASK_STATUS_CHANGED', title: `Task reassigned: ${updated.title}`, body: `${me.displayName} moved this task to someone else`, link: `/tasks/${id}` });
        }
        this.realtime.emitTask(id, t.teamId, 'task:updated', { id, title: updated.title, status: updated.status });
        return updated;
    }
    async changeStatus(me, id, dto, ip) {
        const t = await this.prisma.task.findUnique({ where: { id } });
        if (!t)
            throw new common_1.NotFoundException('Task not found');
        const from = t.status;
        const to = dto.status;
        if (from === to)
            throw new common_1.BadRequestException('Task is already in that status');
        const isOwner = t.ownerId === me.id;
        const isLead = me.role === 'ADMIN' || (me.role === 'TEAM_LEAD' && plansOwnTeam(me, t.teamId));
        const isCoordinator = me.role === 'COORDINATOR' && plansOwnTeam(me, t.teamId);
        if (me.role === 'EMPLOYEE' && !isOwner)
            throw new common_1.ForbiddenException('Only the owner can update status');
        if (me.role === 'TEAM_LEAD' && !isLead && !isOwner)
            throw new common_1.ForbiddenException('Outside your team');
        if (me.role === 'COORDINATOR' && !isCoordinator && !isOwner)
            throw new common_1.ForbiddenException('Outside your team');
        if (to === 'DONE' && !isLead)
            throw new common_1.ForbiddenException('Only a team lead can mark Done (review approval)');
        if (to === 'DONE' && isOwner && me.role !== 'ADMIN')
            throw new common_1.ForbiddenException('Someone else must approve your own task');
        if (from === 'DONE' && !isLead)
            throw new common_1.ForbiddenException('Only a team lead can reopen a Done task');
        if (!isLead && !isCoordinator) {
            const allowed = EMPLOYEE_OK[from] ?? [];
            if (!allowed.includes(to))
                throw new common_1.BadRequestException(`Transition ${from} -> ${to} not allowed`);
        }
        if (to === 'BLOCKED' && !dto.blockedReason?.trim())
            throw new common_1.BadRequestException('blockedReason is required when status is BLOCKED');
        const updated = await this.prisma.$transaction(async (tx) => {
            const r = await tx.task.updateMany({
                where: { id, status: from },
                data: {
                    status: to,
                    blockedReason: to === 'BLOCKED' ? dto.blockedReason.trim() : null,
                    reviewNote: dto.reviewNote ?? t.reviewNote,
                    completedAt: to === 'DONE' ? new Date() : from === 'DONE' ? null : t.completedAt,
                },
            });
            if (r.count !== 1)
                throw new common_1.ConflictException('This task was just changed by someone else. Refresh and try again.');
            await tx.taskActivity.create({
                data: { taskId: id, actorId: me.id, action: 'STATUS_CHANGED', fromStatus: from, toStatus: to, detail: { blockedReason: dto.blockedReason ?? null, reviewNote: dto.reviewNote ?? null } },
            });
            return tx.task.findUniqueOrThrow({ where: { id } });
        });
        await this.audit.log({ actorId: me.id, action: 'TASK_STATUS_CHANGE', entity: 'task', entityId: id, metadata: { from, to }, ip });
        this.realtime.emitTask(id, t.teamId, 'task:updated', { id, from, to, title: t.title, status: to });
        const link = `/tasks/${id}`;
        if (to === 'BLOCKED') {
            const staff = await this.prisma.user.findMany({
                where: { teamId: t.teamId, isActive: true, role: { in: ['TEAM_LEAD', 'COORDINATOR'] } }, select: { id: true },
            });
            await this.notifications.notify(staff.map((s) => s.id).filter((x) => x !== me.id), { type: 'TASK_BLOCKED', title: `Blocked: ${t.title}`, body: dto.blockedReason ?? '', link });
        }
        else if (to === 'IN_REVIEW') {
            const leads = await this.prisma.user.findMany({
                where: { teamId: t.teamId, isActive: true, role: { in: ['TEAM_LEAD', 'ADMIN'] } }, select: { id: true },
            });
            await this.notifications.notify(leads.map((s) => s.id).filter((x) => x !== me.id), { type: 'REVIEW_REQUESTED', title: `Review: ${t.title}`, body: `${me.displayName} submitted this for review`, link });
        }
        else if (!isOwner && to === 'DONE') {
            await this.notifications.notify([t.ownerId], { type: 'REVIEW_DECISION', title: `Approved: ${t.title}`, body: dto.reviewNote ?? undefined, link });
        }
        else if (!isOwner && from === 'IN_REVIEW' && (to === 'IN_PROGRESS' || to === 'TODO')) {
            await this.notifications.notify([t.ownerId], { type: 'REVIEW_DECISION', title: `Sent back: ${t.title}`, body: dto.reviewNote ?? 'Your lead asked for changes.', link });
        }
        else if (!isOwner && from === 'DONE') {
            await this.notifications.notify([t.ownerId], { type: 'TASK_STATUS_CHANGED', title: `Reopened: ${t.title}`, body: dto.reviewNote ?? undefined, link });
        }
        return updated;
    }
    async comment(me, id, dto) {
        const t = await this.prisma.task.findUnique({ where: { id }, include: { collaborators: true } });
        if (!t)
            throw new common_1.NotFoundException('Task not found');
        if (!canSee(me, { ownerId: t.ownerId, teamId: t.teamId, collaborators: t.collaborators }))
            throw new common_1.ForbiddenException('Forbidden');
        const body = (dto.body ?? '').trim();
        if (!body && !dto.fileIds?.length)
            throw new common_1.BadRequestException('Write a comment or attach a file');
        const c = await this.prisma.$transaction(async (tx) => {
            const created = await tx.taskComment.create({ data: { taskId: id, authorId: me.id, body } });
            await this.links.claim(tx, me.id, dto.fileIds, { context: 'COMMENT', scopeId: id }, { commentId: created.id, taskId: id });
            return tx.taskComment.findUniqueOrThrow({ where: { id: created.id }, include: { author: { select: { id: true, displayName: true } }, files: file_links_service_1.LIVE_FILES } });
        });
        this.realtime.emitTask(id, t.teamId, 'comment:added', { id: c.id, taskId: id, body: c.body, authorId: me.id, createdAt: c.createdAt });
        const audience = [t.ownerId, ...t.collaborators.map((x) => x.userId)].filter((x) => x !== me.id);
        await this.notifications.notify(audience, {
            type: 'TASK_COMMENT', title: `New comment: ${t.title}`,
            body: `${me.displayName}: ${body ? body.slice(0, 200) : `sent ${c.files.length} file${c.files.length === 1 ? '' : 's'}`}`, link: `/tasks/${id}`,
        });
        return c;
    }
    async removeAttachment(me, taskId, fileId, ip) {
        const f = await this.prisma.fileAsset.findFirst({ where: { id: fileId, taskId, deletedAt: null } });
        if (!f)
            throw new common_1.NotFoundException('Attachment not found');
        const t = await this.prisma.task.findUnique({ where: { id: taskId }, select: { teamId: true } });
        if (f.uploaderId !== me.id && !plansOwnTeam(me, t?.teamId ?? null))
            throw new common_1.ForbiddenException('Only the uploader, team lead or coordinator can remove this');
        await this.prisma.fileAsset.update({ where: { id: fileId }, data: { deletedAt: new Date() } });
        await this.audit.log({ actorId: me.id, action: 'FILE_DELETE', entity: 'task', entityId: taskId, metadata: { file: f.name }, ip });
        return { ok: true };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        realtime_gateway_1.RealtimeGateway,
        file_links_service_1.FileLinkService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map