import type { Core } from '@strapi/strapi';

/**
 * Registriert die eigenen Auswertungen als Admin-Routen statt als Content-API-Routen.
 *
 * Hintergrund: Strapi setzt für alles unter `src/api/*` den Routertyp fest auf
 * `content-api` (siehe `@strapi/core/services/server/register-routes.js`) – ein
 * `type: 'admin'` in einem Routenordner würde stillschweigend ignoriert. Deshalb wird
 * der Router hier direkt am Server angemeldet.
 *
 * Admin-Routen laufen durch die Admin-Auth-Strategie: ohne gültiges Admin-Token
 * antwortet Strapi mit 401. Ein Scope wird bewusst nicht gesetzt, damit jeder
 * angemeldete Admin die Daten sehen darf – ohne extra Rollenrecht.
 */
export function registerAdminRoutes(strapi: Core.Strapi) {
  const handler = (uid: string, action: string) => (ctx: any, next: any) =>
    strapi.controller(uid as any)[action](ctx, next);

  strapi.server.routes({
    type: 'admin',
    prefix: '/dalor-statistics',
    routes: [
      {
        method: 'GET',
        path: '/stats',
        handler: handler('api::analytics.analytics', 'stats'),
      },
      {
        method: 'GET',
        path: '/activity',
        handler: handler('api::activity-log.activity-log', 'list'),
      },
    ],
  } as any);
}
