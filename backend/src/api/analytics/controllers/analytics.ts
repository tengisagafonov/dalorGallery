import type { Core } from '@strapi/strapi';

const EVENTS = ['page_view', 'template_select', 'prompt_preview', 'prompt_copy'] as const;

type EventType = typeof EVENTS[number];
type AnalyticsEvent = {
  eventType: EventType;
  templateId?: number | null;
  templateKey?: string | null;
  templateTitle?: string | null;
  visitorId?: string | null;
  createdAt: string | Date;
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async track(ctx: any) {
    const body = ctx.request.body ?? {};
    if (!EVENTS.includes(body.eventType)) return ctx.badRequest('Ungültiges Ereignis');

    await strapi.db.query('api::analytics-event.analytics-event').create({
      data: {
        eventType: body.eventType,
        templateId: Number.isInteger(body.templateId) ? body.templateId : null,
        templateKey: typeof body.templateKey === 'string' ? body.templateKey.slice(0, 160) : null,
        templateTitle: typeof body.templateTitle === 'string' ? body.templateTitle.slice(0, 160) : null,
        visitorId: typeof body.visitorId === 'string' ? body.visitorId.slice(0, 80) : null,
        path: typeof body.path === 'string' ? body.path.slice(0, 200) : '/',
      },
    });
    ctx.body = { ok: true };
  },

  async popular(ctx: any) {
    const events = await strapi.db.query('api::analytics-event.analytics-event').findMany({
      where: { eventType: 'prompt_copy', templateId: { $notNull: true } },
      select: ['templateId', 'templateKey', 'templateTitle'],
    }) as Pick<AnalyticsEvent, 'templateId' | 'templateKey' | 'templateTitle'>[];
    const copies = new Map<string, number>();

    for (const event of events) {
      const key = event.templateKey ?? event.templateTitle;
      if (!key) continue;
      copies.set(key, (copies.get(key) ?? 0) + 1);
    }

    ctx.body = {
      data: [...copies.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 50)
        .map(([templateKey, copyCount], index) => ({ templateKey, copyCount, rank: index + 1 })),
    };
  },

  async stats(ctx: any) {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);
    const events = await strapi.db.query('api::analytics-event.analytics-event').findMany({
      where: { createdAt: { $gte: since } },
      orderBy: { createdAt: 'asc' },
    }) as AnalyticsEvent[];
    const count = (type: EventType) => events.filter((event) => event.eventType === type).length;
    const visitors = new Set(events.flatMap((event) => event.visitorId ? [event.visitorId] : [])).size;
    const days = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(since);
      date.setDate(date.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, views: events.filter((event) => event.eventType === 'page_view' && new Date(event.createdAt).toISOString().startsWith(key)).length };
    });
    const templateCounts = new Map<string, { title: string; views: number; copies: number }>();
    for (const event of events.filter((item) => item.templateId)) {
      const key = event.templateKey ?? event.templateTitle ?? String(event.templateId);
      const item = templateCounts.get(key) ?? { title: event.templateTitle ?? `Template ${key}`, views: 0, copies: 0 };
      if (event.eventType === 'template_select') item.views++;
      if (event.eventType === 'prompt_copy') item.copies++;
      templateCounts.set(key, item);
    }
    ctx.body = {
      totals: { views: count('page_view'), visitors, selections: count('template_select'), previews: count('prompt_preview'), copies: count('prompt_copy') },
      days,
      topTemplates: [...templateCounts.values()].sort((a, b) => b.views - a.views).slice(0, 8),
    };
  },
});
