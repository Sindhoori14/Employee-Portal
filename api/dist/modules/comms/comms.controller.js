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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const realtime_gateway_1 = require("./realtime.gateway");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const announcements_service_1 = require("./announcements.service");
const channels_service_1 = require("./channels.service");
const notifications_service_1 = require("./notifications.service");
const comms_dto_1 = require("./dto/comms.dto");
let CommsController = class CommsController {
    announcements;
    channels;
    notifications;
    gateway;
    constructor(announcements, channels, notifications, gateway) {
        this.announcements = announcements;
        this.channels = channels;
        this.notifications = notifications;
        this.gateway = gateway;
    }
    ip(req) {
        return req.ip;
    }
    postAnnouncement(me, dto, req) {
        return this.announcements.create(me, dto, this.ip(req));
    }
    feed(me) {
        return this.announcements.feed(me);
    }
    deleteAnnouncement(me, id, req) {
        return this.announcements.remove(me, id, this.ip(req));
    }
    listChannels(me, teamId) {
        return this.channels.list(me, teamId);
    }
    createChannel(me, dto) {
        return this.channels.create(me, dto);
    }
    unread(me) {
        return this.channels.totalUnread(me);
    }
    contacts(me) {
        return this.channels.contacts(me);
    }
    addMembers(me, id, dto) {
        return this.channels.addMembers(me, id, dto.userIds);
    }
    removeMember(me, id, userId) {
        return this.channels.removeMember(me, id, userId);
    }
    messages(me, id, limit, before, after) {
        return this.channels.messages(me, id, { limit: limit ? Number(limit) : undefined, before, after });
    }
    post(me, id, dto) {
        return this.channels.post(me, id, dto);
    }
    deleteMessage(me, id, messageId) {
        return this.channels.remove(me, id, messageId);
    }
    markRead(me, id) {
        return this.channels.markRead(me, id);
    }
    presence() {
        return { online: this.gateway.onlineIds() };
    }
    notifs(me, unread) {
        return this.notifications.list(me, { unread });
    }
    read(me, id) {
        return this.notifications.markRead(me, id);
    }
    readAll(me) {
        return this.notifications.markAllRead(me);
    }
};
exports.CommsController = CommsController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'TEAM_LEAD', 'COORDINATOR'),
    (0, common_1.Post)('announcements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, comms_dto_1.CreateAnnouncementDto, Object]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "postAnnouncement", null);
__decorate([
    (0, common_1.Get)('announcements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "feed", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Get)('channels'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "listChannels", null);
__decorate([
    (0, common_1.Post)('channels'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, comms_dto_1.CreateChannelDto]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "createChannel", null);
__decorate([
    (0, common_1.Get)('channels-unread'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "unread", null);
__decorate([
    (0, common_1.Get)('channels/contacts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "contacts", null);
__decorate([
    (0, common_1.Post)('channels/:id/members'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, comms_dto_1.AddChannelMembersDto]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "addMembers", null);
__decorate([
    (0, common_1.Delete)('channels/:id/members/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)('channels/:id/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('before')),
    __param(4, (0, common_1.Query)('after')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "messages", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60_000 } }),
    (0, common_1.Post)('channels/:id/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, comms_dto_1.PostMessageDto]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "post", null);
__decorate([
    (0, common_1.Delete)('channels/:id/messages/:messageId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Post)('channels/:id/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Get)('presence'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "presence", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('unread')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "notifs", null);
__decorate([
    (0, common_1.Post)('notifications/:id/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "read", null);
__decorate([
    (0, common_1.Post)('notifications/read-all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommsController.prototype, "readAll", null);
exports.CommsController = CommsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [announcements_service_1.AnnouncementsService,
        channels_service_1.ChannelsService,
        notifications_service_1.NotificationsService,
        realtime_gateway_1.RealtimeGateway])
], CommsController);
//# sourceMappingURL=comms.controller.js.map