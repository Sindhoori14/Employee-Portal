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
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("./notifications.service");
const file_links_service_1 = require("../../common/file-links.service");
let AnnouncementsService = class AnnouncementsService {
    prisma;
    audit;
    notifications;
    links;
    constructor(prisma, audit, notifications, links) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
        this.links = links;
    }
    async create(me, dto, ip) {
        const scope = dto.scope ?? 'COMPANY';
        if (scope === 'COMPANY' && me.role !== 'ADMIN')
            throw new common_1.ForbiddenException('Company announcements are admin-only');
        if ((scope === 'TEAM' || scope === 'BATCH') && !['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role))
            throw new common_1.ForbiddenException('Only leads, coordinators and admins post team announcements');
        if (scope === 'BATCH' && me.role === 'COORDINATOR')
            throw new common_1.ForbiddenException('Coordinators can post to their own team only');
        if (scope === 'TEAM') {
            if (!dto.teamId && me.teamId)
                dto.teamId = me.teamId;
            if (!dto.teamId)
                throw new common_1.BadRequestException('teamId required for TEAM scope');
            if ((me.role === 'TEAM_LEAD' || me.role === 'COORDINATOR') && dto.teamId !== me.teamId)
                throw new common_1.ForbiddenException('Outside your team');
        }
        if (scope === 'BATCH') {
            if (!dto.batchId)
                throw new common_1.BadRequestException('batchId required for BATCH scope');
            const batch = await this.prisma.batch.findUnique({ where: { id: dto.batchId }, select: { leadId: true, coordinatorId: true } });
            if (!batch)
                throw new common_1.BadRequestException('Invalid batchId');
            if (me.role === 'TEAM_LEAD' && batch.leadId !== me.id) {
                const inTeam = me.teamId ? await this.prisma.user.count({ where: { batchId: dto.batchId, teamId: me.teamId } }) : 0;
                if (!inTeam)
                    throw new common_1.ForbiddenException('You can only post to batches you lead');
            }
        }
        const a = await this.prisma.$transaction(async (tx) => {
            const created = await tx.announcement.create({
                data: {
                    title: dto.title.trim(), body: dto.body.trim(), scope: scope,
                    teamId: scope === 'TEAM' ? dto.teamId ?? null : null,
                    batchId: scope === 'BATCH' ? dto.batchId ?? null : null,
                    createdById: me.id,
                },
            });
            await this.links.claim(tx, me.id, dto.fileIds, { context: 'ANNOUNCEMENT' }, { announcementId: created.id });
            return created;
        });
        const scopeWhere = { isActive: true };
        if (scope === 'TEAM')
            scopeWhere.teamId = dto.teamId;
        if (scope === 'BATCH')
            scopeWhere.batchId = dto.batchId;
        const ids = (await this.prisma.user.findMany({ where: scopeWhere, select: { id: true } })).map((u) => u.id);
        await this.notifications.notify(ids.filter((id) => id !== me.id), {
            type: 'ANNOUNCEMENT', title: dto.title.trim(), body: dto.body.trim().slice(0, 300), link: '/announcements',
        });
        await this.audit.log({ actorId: me.id, action: 'ANNOUNCEMENT_CREATE', entity: 'announcement', entityId: a.id, ip });
        return a;
    }
    feed(me) {
        if (me.role === 'ADMIN')
            return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { files: file_links_service_1.LIVE_FILES } });
        return this.prisma.announcement.findMany({
            where: {
                OR: [{ scope: 'COMPANY' }, ...(me.teamId ? [{ scope: 'TEAM', teamId: me.teamId }] : []), ...(me.batchId ? [{ scope: 'BATCH', batchId: me.batchId }] : [])],
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { files: file_links_service_1.LIVE_FILES },
        });
    }
    async remove(me, id, ip) {
        const a = await this.prisma.announcement.findUnique({ where: { id } });
        if (!a)
            throw new common_1.NotFoundException('Not found');
        if (me.role !== 'ADMIN' && a.createdById !== me.id)
            throw new common_1.ForbiddenException('Forbidden');
        await this.prisma.fileAsset.updateMany({ where: { announcementId: id }, data: { deletedAt: new Date() } });
        await this.prisma.announcement.delete({ where: { id } });
        await this.audit.log({ actorId: me.id, action: 'ANNOUNCEMENT_DELETE', entity: 'announcement', entityId: id, ip });
        return { ok: true };
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        file_links_service_1.FileLinkService])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map