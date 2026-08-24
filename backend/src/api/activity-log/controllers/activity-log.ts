import type { Core } from '@strapi/strapi';
import { ACTIVITY_UID } from '../../../services/activity-log';

const LEVELS = ['info', 'warning', 'error'] as const;
const CATEGORIES = ['content', 'ai', 'security', 'system'] as const;
const PAGE_SIZES = [25, 50, 100, 200];

const oneOf = <T extends string>(options: readonly T[], value: unknown) =>
  typeof value === 'string' && (options as readonly string[]).includes(value)
    ? (value as T)
    : undefined;

/**
 * Bedient ausschließlich die Admin-Seite. Es gibt bewusst keine öffentliche Route –
 * das Protokoll nennt Namen von Bearbeitern und Fehlermeldungen aus dem Innenleben.
 * Registriert wird der Endpunkt in src/bootstrap/admin-routes.ts.
 */
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async list(ctx: any) {
    const query = strapi.db.query(ACTIVITY_UID);

    const level = oneOf(LEVELS, ctx.query?.level);
    const category = oneOf(CATEGORIES, ctx.query?.category);
    const search = typeof ctx.query?.search === 'string' ? ctx.query.search.trim().slice(0, 120) : '';
    const requestedSize = Number(ctx.query?.pageSize);
    const pageSize = PAGE_SIZES.includes(requestedSize) ? requestedSize : 50;
    const page = Math.max(1, Number(ctx.query?.page) || 1);

    const where: Record<string, unknown> = {};
    if (level) where.level = level;
    if (category) where.category = category;
    if (search) {
      where.$or = [
        { message: { $containsi: search } },
        { action: { $containsi: search } },
        { actor: { $containsi: search } },
      ];
    }

    const [entries, total] = await Promise.all([
      query.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        offset: (page - 1) * pageSize,
        limit: pageSize,
      }),
      query.count({ where }),
    ]);

    // Kennzahlen der letzten 24 Stunden – unabhängig von den gesetzten Filtern,
    // damit die Kopfzeile immer den tatsächlichen Zustand zeigt.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [errors, warnings, aiCalls, contentChanges] = await Promise.all([
      query.count({ where: { level: 'error', createdAt: { $gte: since } } }),
      query.count({ where: { level: 'warning', createdAt: { $gte: since } } }),
      query.count({ where: { category: 'ai', createdAt: { $gte: since } } }),
      query.count({ where: { category: 'content', createdAt: { $gte: since } } }),
    ]);

    ctx.body = {
      entries,
      pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
      lastDay: { errors, warnings, aiCalls, contentChanges },
    };
  },
});
