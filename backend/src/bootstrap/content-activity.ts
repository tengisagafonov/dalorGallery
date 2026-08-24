import type { Core } from '@strapi/strapi';
import { currentActor, recordActivity } from '../services/activity-log';

const WATCHED: Record<string, string> = {
  'api::template.template': 'Template',
  'api::category.category': 'Kategorie',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'angelegt',
  update: 'geändert',
  delete: 'gelöscht',
  publish: 'veröffentlicht',
  unpublish: 'zurückgezogen',
  discardDraft: 'Entwurf verworfen',
};

function titleOf(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const entry = value as Record<string, unknown>;
  const title = entry.title ?? entry.name;
  return typeof title === 'string' && title.trim() ? title.trim() : null;
}

/**
 * Protokolliert Inhaltsänderungen an Templates und Kategorien.
 *
 * Bewusst nur Vorgänge mit erkennbarem Bearbeiter: Seed- und Nachrüstläufe beim
 * Serverstart schreiben ebenfalls über dieselbe Schicht und würden das Protokoll
 * sonst mit hunderten Einträgen fluten. Systemläufe melden sich stattdessen selbst
 * mit einer Zusammenfassung.
 */
export function registerContentActivity(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    const label = WATCHED[context.uid as string];
    const actionLabel = ACTION_LABELS[context.action as string];
    const params = context.params as Record<string, any> | undefined;

    // Beim Löschen gibt es hinterher nichts mehr zu lesen – der Name muss vorher
    // geholt werden, sonst stünde im Protokoll nur „ohne Titel".
    let previousTitle: string | null = null;
    if (label && actionLabel && params?.documentId && currentActor(strapi)) {
      try {
        previousTitle = titleOf(
          await strapi.documents(context.uid as any).findOne({ documentId: params.documentId }),
        );
      } catch {
        previousTitle = null;
      }
    }

    const result = await next();

    if (!label || !actionLabel) return result;

    const actor = currentActor(strapi);
    if (!actor) return result;

    const title = titleOf(result) ?? previousTitle ?? titleOf(params?.data) ?? 'ohne Titel';

    void recordActivity(strapi, {
      category: 'content',
      action: `${context.uid}.${context.action}`,
      message: `${label} „${title}" ${actionLabel}`,
      actor,
      context: {
        typ: label,
        vorgang: actionLabel,
        documentId:
          (result as Record<string, unknown> | undefined)?.documentId ?? params?.documentId ?? null,
      },
    });

    return result;
  });
}
