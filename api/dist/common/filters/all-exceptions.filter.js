"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    log = new common_1.Logger('Exceptions');
    catch(err, host) {
        const res = host.switchToHttp().getResponse();
        const req = host.switchToHttp().getRequest();
        if (res.headersSent)
            return;
        if (err instanceof common_1.HttpException) {
            const status = err.getStatus();
            const body = err.getResponse();
            return res.status(status).json(typeof body === 'string' ? { statusCode: status, message: body } : body);
        }
        const code = err?.code;
        const name = err?.constructor?.name ?? '';
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Something went wrong on our side.';
        if (code === 'P2002') {
            status = 409;
            message = 'That value already exists.';
        }
        else if (code === 'P2025') {
            status = 404;
            message = 'Record not found.';
        }
        else if (code === 'P2003') {
            status = 400;
            message = 'Related record does not exist or is still in use.';
        }
        else if (code === 'P2004' || code === 'P2010' || /check constraint/i.test(String(err?.message))) {
            status = 400;
            message = 'Value rejected by a database rule.';
        }
        else if (name === 'PrismaClientValidationError') {
            status = 400;
            message = 'Invalid input.';
        }
        if (status === 500) {
            const ref = Math.random().toString(36).slice(2, 8);
            this.log.error(`[${ref}] ${req?.method} ${req?.url}: ${err?.stack ?? err}`);
            message = `${message} (ref ${ref})`;
        }
        res.status(status).json({ statusCode: status, message, error: common_1.HttpStatus[status] ?? 'Error' });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map