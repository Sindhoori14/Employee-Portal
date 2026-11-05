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
exports.FileLinkService = exports.MAX_FILES_PER_ITEM = exports.LIVE_FILES = exports.FILE_SELECT = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
exports.FILE_SELECT = {
    id: true, name: true, mime: true, size: true, width: true, height: true, createdAt: true, uploaderId: true,
};
exports.LIVE_FILES = { where: { deletedAt: null }, select: exports.FILE_SELECT, orderBy: { createdAt: 'asc' } };
exports.MAX_FILES_PER_ITEM = 10;
let FileLinkService = class FileLinkService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async claim(tx, userId, fileIds, expect, link) {
        const ids = [...new Set(fileIds ?? [])];
        if (!ids.length)
            return 0;
        if (ids.length > exports.MAX_FILES_PER_ITEM)
            throw new common_1.BadRequestException(`You can attach up to ${exports.MAX_FILES_PER_ITEM} files at once`);
        const rows = await tx.fileAsset.findMany({ where: { id: { in: ids } } });
        const ok = rows.length === ids.length &&
            rows.every((f) => f.uploaderId === userId && !f.deletedAt && f.context === expect.context &&
                !f.taskId && !f.commentId && !f.messageId && !f.reportId && !f.announcementId &&
                (expect.scopeId === undefined || f.scopeId === expect.scopeId));
        if (!ok)
            throw new common_1.BadRequestException('One or more attachments are invalid or were already used. Upload them again.');
        await tx.fileAsset.updateMany({ where: { id: { in: ids } }, data: link });
        return ids.length;
    }
};
exports.FileLinkService = FileLinkService;
exports.FileLinkService = FileLinkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FileLinkService);
//# sourceMappingURL=file-links.service.js.map