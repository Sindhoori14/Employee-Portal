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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("./realtime.gateway");
const mail_service_1 = require("../../common/mail.service");
const EMAIL_TYPES = new Set(['TASK_ASSIGNED', 'REVIEW_REQUESTED', 'REVIEW_DECISION', 'TICKET', 'PASSWORD_RESET_REQUEST']);
let NotificationsService = class NotificationsService {
    prisma;
    realtime;
    mail;
    constructor(prisma, realtime, mail) {
        this.prisma = prisma;
        this.realtime = realtime;
        this.mail = mail;
    }
    async notify(userIds, n) {
        const uniq = [...new Set(userIds)].filter(Boolean).slice(0, 1000);
        if (!uniq.length)
            return [];
        await this.prisma.notification.createMany({
            data: uniq.map((userId) => ({
                userId,
                type: n.type,
                title: n.title.slice(0, 200),
                body: n.body?.slice(0, 5000) ?? null,
                link: n.link?.slice(0, 500) ?? null,
            })),
        });
        this.realtime.emitToUsers(uniq, { type: n.type, title: n.title.slice(0, 200), link: n.link });
        if (this.mail.enabled && EMAIL_TYPES.has(n.type)) {
            const users = await this.prisma.user.findMany({
                where: { id: { in: uniq }, isActive: true }, select: { email: true },
            });
            for (const u of users)
                void this.mail.send(u.email, n.title, n.body ?? '', n.link);
        }
        return uniq.map((userId) => ({ userId }));
    }
    async list(me, q) {
        const page = Math.max(1, Number(q.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
        const where = { userId: me.id };
        if (q.unread === 'true')
            where.isRead = false;
        const [data, unread] = await Promise.all([
            this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
            this.prisma.notification.count({ where: { userId: me.id, isRead: false } }),
        ]);
        return { data, unread };
    }
    async markRead(me, id) {
        await this.prisma.notification.updateMany({ where: { id, userId: me.id }, data: { isRead: true } });
        return { ok: true };
    }
    async markAllRead(me) {
        await this.prisma.notification.updateMany({ where: { userId: me.id, isRead: false }, data: { isRead: true } });
        return { ok: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, realtime_gateway_1.RealtimeGateway, mail_service_1.MailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map