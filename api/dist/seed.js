"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD ?? '';
        if (!email || !password)
            throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars');
        if (password.length < 8)
            throw new Error('ADMIN_PASSWORD must be 8+ chars');
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            console.log(`Admin already exists: ${email}`);
            return;
        }
        const admin = await prisma.user.create({
            data: {
                email,
                passwordHash: await argon2.hash(password),
                displayName: 'Administrator',
                role: 'ADMIN',
                mustChangePassword: true,
            },
        });
        await prisma.setting.upsert({
            where: { key: 'reportDeadline' },
            update: {},
            create: { key: 'reportDeadline', value: { time: process.env.REPORT_DEADLINE ?? '18:00', tz: process.env.APP_TZ ?? 'Asia/Kolkata' } },
        });
        await prisma.setting.upsert({ where: { key: 'workDays' }, update: {}, create: { key: 'workDays', value: [1, 2, 3, 4, 5, 6] } });
        await prisma.setting.upsert({ where: { key: 'holidays' }, update: {}, create: { key: 'holidays', value: [] } });
        console.log(`Seeded admin: ${admin.email} (mustChangePassword=true)`);
    }
    finally {
        const { PrismaClient: PC } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        void PC;
    }
}
main()
    .catch((e) => {
    console.error(e.message);
    process.exit(1);
})
    .finally(async () => {
    const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
    await new PrismaClient().$disconnect().catch(() => null);
});
//# sourceMappingURL=seed.js.map