"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = require("express");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const accessSecret = process.env.JWT_ACCESS_SECRET ?? '';
    if (accessSecret.length < 32 || /CHANGE_ME/i.test(accessSecret)) {
        throw new Error('JWT_ACCESS_SECRET must be set to a random 32+ char value (see .env.example)');
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: false, bodyParser: false });
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    app.use((0, helmet_1.default)({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
    app.use((0, express_1.json)({ limit: '1mb' }));
    app.use((0, express_1.urlencoded)({ extended: false, limit: '1mb' }));
    app.use((0, cookie_parser_1.default)());
    const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((s) => s.trim()).filter(Boolean);
    const isProd = process.env.NODE_ENV === 'production';
    app.enableCors({ origin: origins, credentials: true });
    app.use((req, res, next) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            const origin = req.headers.origin;
            if (origin && !origins.includes(origin)) {
                return res.status(403).json({ message: 'Forbidden (origin)', error: 'Forbidden', statusCode: 403 });
            }
        }
        next();
    });
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
    }));
    app.enableShutdownHooks();
    const port = Number(process.env.API_PORT ?? 4000);
    await app.listen(port, '0.0.0.0');
    console.log(`TeamFlow API listening on :${port} (prod=${isProd})`);
}
bootstrap();
//# sourceMappingURL=main.js.map