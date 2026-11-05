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
exports.LearningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../comms/notifications.service");
const LEAD_ROLES = ['ADMIN', 'TEAM_LEAD'];
const QUESTION_ORDER = [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }];
const QUIZ_MAX_ATTEMPTS = Number(process.env.QUIZ_MAX_ATTEMPTS ?? 3);
const OTHER_MAX_ATTEMPTS = 5;
function pct(done, total) {
    if (total === 0)
        return 0;
    return Math.round((done / total) * 1000) / 10;
}
let LearningService = class LearningService {
    prisma;
    audit;
    notifications;
    constructor(prisma, audit, notifications) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
    }
    batchGuard(me, batchId) {
        if (LEAD_ROLES.includes(me.role) || me.role === 'COORDINATOR')
            return;
        if (!me.batchId || me.batchId !== batchId)
            throw new common_1.ForbiddenException('This belongs to a different batch');
    }
    scopeBatch(me, batchId) {
        if (LEAD_ROLES.includes(me.role) || me.role === 'COORDINATOR')
            return batchId;
        return me.batchId ?? '__none__';
    }
    needLead(me) {
        if (!LEAD_ROLES.includes(me.role))
            throw new common_1.ForbiddenException('Only leads/admins');
    }
    async createPlan(me, dto, ip) {
        this.needLead(me);
        const batch = await this.prisma.batch.findUnique({ where: { id: dto.batchId } });
        if (!batch)
            throw new common_1.BadRequestException('Invalid batchId');
        const dupe = await this.prisma.trainingPlan.findUnique({ where: { batchId: dto.batchId } });
        if (dupe)
            throw new common_1.BadRequestException('This batch already has a training plan');
        const plan = await this.prisma.trainingPlan.create({
            data: { batchId: dto.batchId, title: dto.title.trim(), description: dto.description ?? null, createdById: me.id },
        });
        await this.audit.log({ actorId: me.id, action: 'TRAINING_PLAN_CREATE', entity: 'training_plan', entityId: plan.id, ip });
        return plan;
    }
    listPlans(me, batchId) {
        const scoped = this.scopeBatch(me, batchId);
        return this.prisma.trainingPlan.findMany({
            where: scoped ? { batchId: scoped } : {},
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { items: true } }, batch: { select: { id: true, name: true } } },
        });
    }
    async getPlan(id, me) {
        const plan = await this.prisma.trainingPlan.findUnique({
            where: { id },
            include: {
                items: { orderBy: [{ sortOrder: 'asc' }, { dayNumber: 'asc' }], include: { materials: { orderBy: { sortOrder: 'asc' } } } },
                batch: { select: { id: true, name: true } },
            },
        });
        if (!plan)
            throw new common_1.NotFoundException('Training plan not found');
        this.batchGuard(me, plan.batchId);
        const done = await this.prisma.trainingProgress.count({
            where: { userId: me.id, isDone: true, item: { planId: id } },
        });
        return { ...plan, myDone: done, myTotal: plan.items.length, myPct: pct(done, plan.items.length) };
    }
    async updatePlan(me, id, dto, ip) {
        this.needLead(me);
        await this.mustPlan(id);
        return this.prisma.trainingPlan.update({ where: { id }, data: { ...(dto.title ? { title: dto.title.trim() } : {}), ...(dto.description !== undefined ? { description: dto.description } : {}) } });
    }
    async addItem(me, planId, dto, ip) {
        this.needLead(me);
        const plan = await this.mustPlan(planId);
        const dupe = await this.prisma.trainingItem.findUnique({ where: { planId_dayNumber: { planId, dayNumber: dto.dayNumber } } }).catch(() => null);
        if (dupe)
            throw new common_1.BadRequestException(`Day ${dto.dayNumber} already exists in this plan`);
        const count = await this.prisma.trainingItem.count({ where: { planId } });
        const item = await this.prisma.trainingItem.create({
            data: { ...dto, topic: dto.topic.trim(), planId, sortOrder: count },
        });
        await this.audit.log({ actorId: me.id, action: 'TRAINING_ITEM_CREATE', entity: 'training_item', entityId: item.id, ip });
        return item;
    }
    async updateItem(me, id, dto) {
        this.needLead(me);
        await this.mustItem(id);
        return this.prisma.trainingItem.update({ where: { id }, data: { ...dto } });
    }
    async deleteItem(me, id, ip) {
        this.needLead(me);
        await this.mustItem(id);
        await this.prisma.trainingItem.delete({ where: { id } });
        await this.audit.log({ actorId: me.id, action: 'TRAINING_ITEM_DELETE', entity: 'training_item', entityId: id, ip });
        return { ok: true };
    }
    async addMaterial(me, itemId, dto) {
        this.needLead(me);
        const item = await this.mustItem(itemId);
        if (!dto.url && !dto.fileKey)
            throw new common_1.BadRequestException('Provide url or fileKey');
        const count = await this.prisma.trainingMaterial.count({ where: { trainingItemId: itemId } });
        return this.prisma.trainingMaterial.create({
            data: { trainingItemId: itemId, kind: (dto.kind ?? 'LINK'), title: dto.title.trim(), url: dto.url ?? null, fileKey: dto.fileKey ?? null, sortOrder: count },
        });
    }
    async deleteMaterial(me, id) {
        this.needLead(me);
        await this.prisma.trainingMaterial.delete({ where: { id } }).catch(() => {
            throw new common_1.NotFoundException('Material not found');
        });
        return { ok: true };
    }
    async setProgress(me, itemId, isDone) {
        const item = await this.prisma.trainingItem.findUnique({ where: { id: itemId }, include: { plan: { select: { batchId: true } } } });
        if (!item)
            throw new common_1.NotFoundException('Training item not found');
        this.batchGuard(me, item.plan.batchId);
        return this.prisma.trainingProgress.upsert({
            where: { userId_trainingItemId: { userId: me.id, trainingItemId: itemId } },
            update: { isDone, completedAt: isDone ? new Date() : null },
            create: { userId: me.id, trainingItemId: itemId, isDone, completedAt: isDone ? new Date() : null },
        });
    }
    async batchProgress(me, planId) {
        if (!['ADMIN', 'TEAM_LEAD', 'COORDINATOR'].includes(me.role))
            throw new common_1.ForbiddenException('Forbidden');
        const plan = await this.mustPlan(planId);
        const [items, members] = await Promise.all([
            this.prisma.trainingItem.findMany({ where: { planId }, select: { id: true } }),
            this.prisma.user.findMany({
                where: { batchId: plan.batchId, isActive: true, ...(me.role === 'COORDINATOR' ? { teamId: me.teamId ?? '__none__' } : {}) },
                select: { id: true, displayName: true, email: true },
                orderBy: { displayName: 'asc' },
            }),
        ]);
        const ids = items.map((i) => i.id);
        const done = ids.length
            ? await this.prisma.trainingProgress.findMany({ where: { trainingItemId: { in: ids }, isDone: true }, select: { userId: true } })
            : [];
        const byUser = new Map();
        for (const d of done)
            byUser.set(d.userId, (byUser.get(d.userId) ?? 0) + 1);
        return {
            total: ids.length,
            trainees: members.map((m) => ({ ...m, done: byUser.get(m.id) ?? 0, progressPct: pct(byUser.get(m.id) ?? 0, ids.length) })),
        };
    }
    async createAssessment(me, dto, ip) {
        this.needLead(me);
        const batch = await this.prisma.batch.findUnique({ where: { id: dto.batchId } });
        if (!batch)
            throw new common_1.BadRequestException('Invalid batchId');
        const a = await this.prisma.assessment.create({
            data: {
                batchId: dto.batchId, title: dto.title.trim(), description: dto.description ?? null,
                type: (dto.type ?? 'QUIZ'), weekNumber: dto.weekNumber ?? null,
                maxScore: dto.maxScore ?? 100, dueDate: dto.dueDate ? new Date(dto.dueDate) : null, createdById: me.id,
            },
        });
        await this.audit.log({ actorId: me.id, action: 'ASSESSMENT_CREATE', entity: 'assessment', entityId: a.id, ip });
        const trainees = await this.prisma.user.findMany({ where: { batchId: dto.batchId, isActive: true, role: 'EMPLOYEE' }, select: { id: true } });
        await this.notifications.notify(trainees.map((t) => t.id), {
            type: 'ASSESSMENT_ASSIGNED', title: `New ${a.type === 'QUIZ' ? 'quiz' : 'assessment'}: ${a.title}`,
            body: a.dueDate ? `Due ${a.dueDate.toISOString().slice(0, 10)}` : undefined, link: `/assessments`,
        });
        return a;
    }
    listAssessments(me, batchId) {
        const scoped = this.scopeBatch(me, batchId);
        return this.prisma.assessment.findMany({
            where: scoped ? { batchId: scoped } : {}, orderBy: { createdAt: 'desc' },
            include: { _count: { select: { questions: true, attempts: true } } },
        });
    }
    async getAssessment(id, me) {
        const a = await this.prisma.assessment.findUnique({ where: { id }, include: { questions: { orderBy: QUESTION_ORDER } } });
        if (!a)
            throw new common_1.NotFoundException('Assessment not found');
        this.batchGuard(me, a.batchId);
        const lead = LEAD_ROLES.includes(me.role);
        return {
            ...a,
            questions: a.questions.map((q) => (lead ? q : { ...q, correctIndex: null })),
        };
    }
    async addQuestion(me, assessmentId, dto) {
        this.needLead(me);
        const a = await this.prisma.assessment.findUnique({ where: { id: assessmentId } });
        if (!a)
            throw new common_1.NotFoundException('Assessment not found');
        const last = await this.prisma.assessmentQuestion.aggregate({ where: { assessmentId }, _max: { sortOrder: true } });
        if (a.type === 'QUIZ') {
            if (!dto.options || dto.options.length < 2)
                throw new common_1.BadRequestException('MCQ needs 2+ options');
            if (dto.correctIndex === undefined || dto.correctIndex < 0 || dto.correctIndex >= dto.options.length)
                throw new common_1.BadRequestException('correctIndex out of range');
        }
        return this.prisma.assessmentQuestion.create({
            data: {
                assessmentId, prompt: dto.prompt, options: dto.options ?? undefined,
                correctIndex: dto.correctIndex ?? null, points: dto.points ?? 1, sortOrder: (last._max.sortOrder ?? -1) + 1,
            },
        });
    }
    async deleteQuestion(me, id) {
        this.needLead(me);
        await this.prisma.assessmentQuestion.delete({ where: { id } }).catch(() => {
            throw new common_1.NotFoundException('Question not found');
        });
        return { ok: true };
    }
    async submit(me, assessmentId, dto, ip) {
        const a = await this.prisma.assessment.findUnique({ where: { id: assessmentId }, include: { questions: { orderBy: QUESTION_ORDER } } });
        if (!a)
            throw new common_1.NotFoundException('Assessment not found');
        const isStaff = LEAD_ROLES.includes(me.role);
        if (!isStaff) {
            this.batchGuard(me, a.batchId);
            if (a.dueDate && a.dueDate.getTime() < Date.now())
                throw new common_1.BadRequestException('This assessment is past its due date');
            const used = await this.prisma.assessmentAttempt.count({ where: { assessmentId, userId: me.id } });
            const cap = a.type === 'QUIZ' ? QUIZ_MAX_ATTEMPTS : OTHER_MAX_ATTEMPTS;
            if (used >= cap)
                throw new common_1.BadRequestException(`You have used all ${cap} attempts`);
        }
        const answers = dto.answers ?? [];
        let score = null;
        let graded = false;
        let max = a.maxScore;
        if (a.type === 'QUIZ') {
            max = a.questions.reduce((s, q) => s + q.points, 0) || a.maxScore;
            const byId = dto.questionIds && dto.questionIds.length === answers.length
                ? new Map(dto.questionIds.map((qid, i) => [qid, answers[i]]))
                : null;
            let earned = 0;
            a.questions.forEach((q, i) => {
                const given = byId ? byId.get(q.id) : answers[i];
                if (q.correctIndex !== null && Number(given) === q.correctIndex && given !== null && given !== undefined && given !== '')
                    earned += q.points;
            });
            score = earned;
            graded = true;
        }
        const attempt = await this.prisma.assessmentAttempt.create({
            data: {
                assessmentId, userId: me.id, answers: answers,
                score, maxScore: max, isGraded: graded, gradedAt: graded ? new Date() : null,
            },
        });
        await this.audit.log({ actorId: me.id, action: 'ASSESSMENT_SUBMIT', entity: 'assessment_attempt', entityId: attempt.id, ip });
        return attempt;
    }
    async myAttempts(me, assessmentId) {
        const rows = await this.prisma.assessmentAttempt.findMany({ where: { assessmentId, userId: me.id }, orderBy: { createdAt: 'desc' } });
        const best = rows.filter((r) => r.score !== null).sort((x, y) => Number(y.score) - Number(x.score))[0] ?? null;
        return { attempts: rows, best, count: rows.length };
    }
    async allAttempts(me, assessmentId) {
        this.needLead(me);
        return this.prisma.assessmentAttempt.findMany({
            where: { assessmentId }, orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, displayName: true, email: true } } },
        });
    }
    async grade(me, attemptId, dto, ip) {
        this.needLead(me);
        const at = await this.prisma.assessmentAttempt.findUnique({ where: { id: attemptId } });
        if (!at)
            throw new common_1.NotFoundException('Attempt not found');
        const cap = Number(at.maxScore ?? 0);
        if (cap > 0 && dto.score > cap)
            throw new common_1.BadRequestException(`Score cannot exceed the maximum of ${cap}`);
        const graded = await this.prisma.assessmentAttempt.update({
            where: { id: attemptId },
            data: { score: dto.score, remarks: dto.remarks ?? null, isGraded: true, gradedById: me.id, gradedAt: new Date() },
        });
        await this.audit.log({ actorId: me.id, action: 'ASSESSMENT_GRADE', entity: 'assessment_attempt', entityId: attemptId, metadata: { score: dto.score }, ip });
        await this.notifications.notify([at.userId], {
            type: 'ASSESSMENT_GRADED', title: 'Your assessment was graded', body: `Score ${dto.score}${cap ? ` / ${cap}` : ''}${dto.remarks ? ` — ${dto.remarks}` : ''}`, link: '/assessments',
        });
        return graded;
    }
    async mustPlan(id) {
        const p = await this.prisma.trainingPlan.findUnique({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException('Training plan not found');
        return p;
    }
    async mustItem(id) {
        const i = await this.prisma.trainingItem.findUnique({ where: { id } });
        if (!i)
            throw new common_1.NotFoundException('Training item not found');
        return i;
    }
};
exports.LearningService = LearningService;
exports.LearningService = LearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService, notifications_service_1.NotificationsService])
], LearningService);
//# sourceMappingURL=learning.service.js.map