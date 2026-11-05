"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const notifications_service_1 = require("./notifications.service");
const announcements_service_1 = require("./announcements.service");
const channels_service_1 = require("./channels.service");
const realtime_gateway_1 = require("./realtime.gateway");
const comms_controller_1 = require("./comms.controller");
let CommsModule = class CommsModule {
};
exports.CommsModule = CommsModule;
exports.CommsModule = CommsModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({})],
        providers: [notifications_service_1.NotificationsService, announcements_service_1.AnnouncementsService, channels_service_1.ChannelsService, realtime_gateway_1.RealtimeGateway],
        controllers: [comms_controller_1.CommsController],
        exports: [notifications_service_1.NotificationsService, realtime_gateway_1.RealtimeGateway],
    })
], CommsModule);
//# sourceMappingURL=comms.module.js.map