import type { Core } from '@strapi/strapi';

/**
 * Schreibt Einträge ins Aktivitätsprotokoll.
 *
 * Strapi bringt ein Audit-Log nur in der Enterprise-Fassung mit – diese Installation
 * läuft auf Community. Deshalb hier eine schlanke eigene Variante, die genau das
 * festhält, was in dieser Anwendung relevant ist: Inhaltsänderungen, KI-Aufrufe samt
 * Dauer, abgewiesene Anfragen und Systemläufe.
 *
 * Protokollieren darf niemals den eigentlichen Vorgang stören: alle Fehler werden hier
 * geschluckt und landen nur im Serverlog.
 */

export const ACTIVITY_UID = 'api::activity-log.activity-log' as const;

/** Nach dieser Zeit werden Einträge beim Serverstart entfernt. */
const RETENTION_DAYS = 30;

export type ActivityLevel = 'info' | 'warning' | 'error';
export type ActivityCategory = 'content' | 'ai' | 'security' | 'system';

export type ActivityEntry = {
  level?: ActivityLevel;
  category: ActivityCategory;
  action: string;
  message: string;
  actor?: string | null;
  context?: Record<string, unknown> | null;
  durationMs?: number | null;
};

/**
 * Name des angemeldeten Admins, sofern der Vorgang aus einer Anfrage stammt.
 * Bei Hintergrundläufen gibt es keinen Anfragekontext – dann bleibt es leer.
 */
export function currentActor(strapi: Core.Strapi): string | null {
  try {
    const user = strapi.requestContext.get()?.state?.user as
      | { firstname?: string; lastname?: string; email?: string }
      | undefined;
    if (!user) return null;
    const name = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
    return name || user.email || null;
  } catch {
    return null;
  }
}

export async function recordActivity(strapi: Core.Strapi, entry: ActivityEntry) {
  try {
    await strapi.db.query(ACTIVITY_UID).create({
      data: {
        level: entry.level ?? 'info',
        category: entry.category,
        action: entry.action.slice(0, 60),
        message: entry.message.slice(0, 1000),
        actor: entry.actor?.slice(0, 160) ?? null,
        context: entry.context ?? null,
        durationMs: Number.isFinite(entry.durationMs as number)
          ? Math.round(entry.durationMs as number)
          : null,
      },
    });
  } catch (error) {
    strapi.log.error('Aktivitätsprotokoll konnte nicht geschrieben werden.', error);
  }
}

/** Misst die Dauer eines Vorgangs und protokolliert Erfolg wie Fehlschlag. */
export async function recordTimed<T>(
  strapi: Core.Strapi,
  entry: Omit<ActivityEntry, 'level' | 'durationMs'> & { failureMessage?: string },
  run: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  try {
    const result = await run();
    void recordActivity(strapi, { ...entry, level: 'info', durationMs: Date.now() - startedAt });
    return result;
  } catch (error) {
    void recordActivity(strapi, {
      ...entry,
      level: 'error',
      durationMs: Date.now() - startedAt,
      message: entry.failureMessage ?? entry.message,
      context: {
        ...(entry.context ?? {}),
        fehler: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

export async function pruneActivityLog(strapi: Core.Strapi) {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  try {
    await strapi.db.query(ACTIVITY_UID).deleteMany({ where: { createdAt: { $lt: cutoff } } });
  } catch (error) {
    strapi.log.error('Aktivitätsprotokoll konnte nicht aufgeräumt werden.', error);
  }
}
