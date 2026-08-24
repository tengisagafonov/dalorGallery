import type { Core } from '@strapi/strapi';
import { resolveCountry } from '../../../services/geo';

const EVENTS = ['page_view', 'template_select', 'prompt_preview', 'prompt_copy'] as const;
const RANGES = [7, 30, 90] as const;

type EventType = typeof EVENTS[number];
type AnalyticsEvent = {
  eventType: EventType;
  templateId?: number | null;
  templateKey?: string | null;
  templateTitle?: string | null;
  visitorId?: string | null;
  country?: string | null;
  createdAt: string | Date;
};

type Counter = { views: number; visitors: Set<string>; selections: number; previews: number; copies: number };

const emptyCounter = (): Counter => ({ views: 0, visitors: new Set(), selections: 0, previews: 0, copies: 0 });

function tally(counter: Counter, event: AnalyticsEvent) {
  if (event.eventType === 'page_view') counter.views++;
  if (event.eventType === 'template_select') counter.selections++;
  if (event.eventType === 'prompt_preview') counter.previews++;
  if (event.eventType === 'prompt_copy') counter.copies++;
  if (event.visitorId) counter.visitors.add(event.visitorId);
}

const totalsOf = (counter: Counter) => ({
  views: counter.views,
  visitors: counter.visitors.size,
  selections: counter.selections,
  previews: counter.previews,
  copies: counter.copies,
});

/** Lokaler Tagesschlüssel `YYYY-MM-DD` – bewusst nicht UTC, damit Tagesgrenzen zur Serverzeit passen. */
function dayKey(value: string | Date) {
  const date = new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function startOfDayBefore(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

/** Veränderung in Prozent gegenüber der Vorperiode; `null`, wenn es keine Vergleichsbasis gibt. */
function trend(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

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
        country: resolveCountry(ctx.request.headers, body),
        timeZone: typeof body.timeZone === 'string' ? body.timeZone.slice(0, 60) : null,
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
    const requested = Number(ctx.query?.days);
    const range = (RANGES as readonly number[]).includes(requested) ? requested : 30;
    const periodStart = startOfDayBefore(range - 1);
    const comparisonStart = startOfDayBefore(range * 2 - 1);

    const events = await strapi.db.query('api::analytics-event.analytics-event').findMany({
      where: { createdAt: { $gte: comparisonStart } },
      orderBy: { createdAt: 'asc' },
    }) as AnalyticsEvent[];

    const current = events.filter((event) => new Date(event.createdAt) >= periodStart);
    const previous = events.filter((event) => new Date(event.createdAt) < periodStart);

    const currentCounter = emptyCounter();
    const previousCounter = emptyCounter();
    const byDay = new Map<string, Counter>();
    const byCountry = new Map<string, Counter>();
    const byTemplate = new Map<string, { title: string; views: number; copies: number; countries: Set<string> }>();

    for (const event of previous) tally(previousCounter, event);

    for (const event of current) {
      tally(currentCounter, event);

      const day = dayKey(event.createdAt);
      if (!byDay.has(day)) byDay.set(day, emptyCounter());
      tally(byDay.get(day)!, event);

      const country = event.country ?? 'unknown';
      if (!byCountry.has(country)) byCountry.set(country, emptyCounter());
      tally(byCountry.get(country)!, event);

      if (!event.templateId && !event.templateKey) continue;
      const key = event.templateKey ?? event.templateTitle ?? String(event.templateId);
      const template = byTemplate.get(key)
        ?? { title: event.templateTitle ?? `Template ${key}`, views: 0, copies: 0, countries: new Set<string>() };
      if (event.eventType === 'template_select') template.views++;
      if (event.eventType === 'prompt_copy') template.copies++;
      if (event.country) template.countries.add(event.country);
      byTemplate.set(key, template);
    }

    const days = Array.from({ length: range }, (_, index) => {
      const date = new Date(periodStart);
      date.setDate(date.getDate() + index);
      const key = dayKey(date);
      const counter = byDay.get(key) ?? emptyCounter();
      return { date: key, ...totalsOf(counter) };
    });

    const totals = totalsOf(currentCounter);
    const previousTotals = totalsOf(previousCounter);
    const countryEvents = current.filter((event) => event.country).length;

    const countries = [...byCountry.entries()]
      .filter(([code]) => code !== 'unknown')
      .map(([code, counter]) => {
        const interactions = counter.views + counter.selections + counter.previews + counter.copies;
        return {
          code,
          ...totalsOf(counter),
          interactions,
          share: countryEvents ? Math.round((interactions / countryEvents) * 1000) / 10 : 0,
        };
      })
      .sort((left, right) => right.interactions - left.interactions || right.visitors - left.visitors);

    ctx.body = {
      range: { days: range, from: dayKey(periodStart), to: dayKey(new Date()) },
      totals,
      trends: {
        views: trend(totals.views, previousTotals.views),
        visitors: trend(totals.visitors, previousTotals.visitors),
        selections: trend(totals.selections, previousTotals.selections),
        previews: trend(totals.previews, previousTotals.previews),
        copies: trend(totals.copies, previousTotals.copies),
      },
      days,
      countries,
      countrySummary: {
        tracked: countryEvents,
        unknown: current.length - countryEvents,
        distinct: countries.length,
      },
      topTemplates: [...byTemplate.values()]
        .map(({ countries: used, ...template }) => ({ ...template, countries: used.size }))
        .sort((left, right) => right.views - left.views || right.copies - left.copies)
        .slice(0, 10),
    };
  },
});
