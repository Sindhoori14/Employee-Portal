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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../comms/notifications.service");
const TICKET_INCLUDE = {
    requester: { select: { id: true, displayName: true, role: true } },
    assignee: { select: { id: true, displayName: true } },
    resolvedBy: { select: { id: true, displayName: true } },
    team: { select: { id: true, name: true } },
};
let TicketsService = class TicketsService {
    prisma;
    audit;
    notifications;
    constructor(prisma, audit, notifications) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
    }
    where(me) {
        if (me.role === 'ADMIN')
            return {};
        const or = [{ requesterId: me.id }, { assigneeId: me.id }];
        if ((me.role === 'TEAM_LEAD' || me.role === 'COORDINATOR') && me.teamId)
            or.push({ teamId: me.teamId });
        return { OR: or };
    }
    list(me, q) {
        const where = this.where(me);
        if (q.status)
            where.status = q.status;
        if (q.category)
            where.category = q.category;
        if (q.priority)
            where.priority = q.priority;
        if (q.escalated === 'true')
            where.escalated = true;
        return this.prisma.ticket.findMany({
            where, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 300, include: TICKET_INCLUDE,
        });
    }
    async mustSee(me, id) {
        const t = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                ...TICKET_INCLUDE,
                messages: { orderBy: { createdAt: 'asc' }, take: 500, include: { author: { select: { id: true, displayName: true, role: true } } } },
            },
        });
        if (!t)
            throw new common_1.NotFoundException('Ticket not found');
        const allowed = me.role === 'ADMIN' || t.requesterId === me.id || t.assigneeId === me.id ||
            ((me.role === 'TEAM_LEAD' || me.role === 'COORDINATOR') && !!me.teamId && t.teamId === me.teamId);
        if (!allowed)
            throw new common_1.ForbiddenException('Forbidden');
        return t;
    }
    get(me, id) {
        return this.mustSee(me, id);
    }
    async create(me, dto, ip) {
        let assigneeId = null;
        let escalated = Boolean(dto.escalateToAdmin);
        if (me.role === 'ADMIN') {
            assigneeId = null;
        }
        else if (escalated) {
            assigneeId = (await this.prisma.user.findFirst({ where: { role: 'ADMIN', isActive: true }, orderBy: { createdAt: 'asc' }, select: { id: true } }))?.id ?? null;
        }
        else {
            const team = me.teamId
                ? await this.prisma.team.findUnique({ where: { id: me.teamId }, select: { leadId: true, coordinatorId: true } })
                : null;
            if (me.role === 'TEAM_LEAD') {
                escalated = true;
                assigneeId = (await this.prisma.user.findFirst({ where: { role: 'ADMIN', isActive: true }, orderBy: { createdAt: 'asc' }, select: { id: true } }))?.id ?? null;
            }
            else {
                assigneeId = team?.leadId ?? team?.coordinatorId ?? null;
            }
        }
        const t = await this.prisma.ticket.create({
            data: {
                subject: dto.subject.trim(),
                description: dto.description.trim(),
                category: (dto.category ?? 'OTHER'),
                priority: (escalated ? 'URGENT' : dto.priority ?? 'MEDIUM'),
                escalated,
                requesterId: me.id,
                assigneeId,
                teamId: me.teamId,
            },
            include: TICKET_INCLUDE,
        });
        await this.audit.log({ actorId: me.id, action: 'TICKET_CREATE', entity: 'ticket', entityId: t.id, metadata: { escalated, assigneeId }, ip });
        if (assigneeId && assigneeId !== me.id) {
            await this.notifications.notify([assigneeId], {
                type: 'TICKET',
                title: `${escalated ? 'Escalated ticket' : 'New ticket'}: ${t.subject}`,
                body: `Raised by ${me.displayName}`,
                link: `/tickets/${t.id}`,
            });
        }
        return t;
    }
    async update(me, id, dto, ip) {
        const t = await this.mustSee(me, id);
        const isStaff = me.role === 'ADMIN' || t.assigneeId === me.id ||
            ((me.role === 'TEAM_LEAD' || me.role === 'COORDINATOR') && !!me.teamId && t.teamId === me.teamId);
        const requesterClosing = t.requesterId === me.id && dto.status !== undefined && ['RESOLVED', 'CLOSED'].includes(dto.status) && Object.keys(dto).length === 1;
        if (!isStaff && !requesterClosing)
            throw new common_1.ForbiddenException('Only the assignee, team lead or admin can update this ticket');
        if (dto.assigneeId) {
            if (!isStaff)
                throw new common_1.ForbiddenException('Only the assignee, team lead or admin can reassign');
            const u = await this.prisma.user.findFirst({ where: { id: dto.assigneeId, isActive: true }, select: { id: true, teamId: true } });
            if (!u)
                throw new common_1.BadRequestException('Invalid assignee');
            if (me.role !== 'ADMIN' && t.teamId && u.teamId !== t.teamId)
                throw new common_1.BadRequestException('The assignee is not in this team');
        }
        const closing = dto.status === 'RESOLVED' || dto.status === 'CLOSED';
        const reopening = dto.status === 'OPEN' || dto.status === 'IN_PROGRESS';
        let targetAssigneeId = dto.assigneeId;
        let targetPriority = undefined;
        let isEscalating = false;
        if (dto.escalated === true && !t.escalated) {
            isEscalating = true;
            const admin = await this.prisma.user.findFirst({
                where: { role: 'ADMIN', isActive: true },
                orderBy: { createdAt: 'asc' },
                select: { id: true },
            });
            if (admin)
                targetAssigneeId = admin.id;
            targetPriority = 'URGENT';
        }
        const updated = await this.prisma.ticket.update({
            where: { id },
            data: {
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.resolution !== undefined ? { resolution: dto.resolution } : {}),
                ...(targetAssigneeId !== undefined ? { assigneeId: targetAssigneeId } : {}),
                ...(targetPriority !== undefined ? { priority: targetPriority } : {}),
                ...(dto.escalated !== undefined ? { escalated: dto.escalated } : {}),
                ...(closing ? { resolvedById: me.id, resolvedAt: new Date() } : {}),
                ...(reopening ? { resolvedById: null, resolvedAt: null } : {}),
            },
            include: TICKET_INCLUDE,
        });
        await this.audit.log({ actorId: me.id, action: 'TICKET_UPDATE', entity: 'ticket', entityId: id, metadata: dto, ip });
        if (isEscalating && targetAssigneeId) {
            await this.notifications.notify([targetAssigneeId], {
                type: 'TICKET',
                title: `🚨 Escalated Ticket: ${updated.subject}`,
                body: `Escalated to Admin by ${me.displayName}`,
                link: `/tickets/${id}`,
            });
        }
        if (dto.status && dto.status !== t.status) {
            const audience = [t.requesterId, t.assigneeId, dto.assigneeId].filter((x) => !!x && x !== me.id);
            await this.notifications.notify(audience, {
                type: 'TICKET',
                title: `Ticket ${updated.status.toLowerCase().replace('_', ' ')}: ${updated.subject}`,
                body: dto.resolution ? dto.resolution.slice(0, 300) : `Updated by ${me.displayName}`,
                link: `/tickets/${id}`,
            });
        }
        return updated;
    }
    async addMessage(me, id, dto) {
        const t = await this.mustSee(me, id);
        const body = dto.body.trim();
        if (!body)
            throw new common_1.BadRequestException('Write a message');
        const m = await this.prisma.ticketMessage.create({
            data: { ticketId: id, authorId: me.id, body },
            include: { author: { select: { id: true, displayName: true, role: true } } },
        });
        const audience = [t.requesterId, t.assigneeId].filter((x) => !!x && x !== me.id);
        await this.notifications.notify(audience, {
            type: 'TICKET', title: `New reply on: ${t.subject}`, body: `${me.displayName}: ${body.slice(0, 200)}`, link: `/tickets/${id}`,
        });
        return m;
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map