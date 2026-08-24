import type { Core } from '@strapi/strapi';

const PUBLIC_CATALOG_ACTIONS = [
  'api::category.category.find',
  'api::category.category.findOne',
  'api::template.template.find',
  'api::template.template.findOne',
  'api::template.template.prompt',
  'api::analytics.analytics.track',
  'api::analytics.analytics.popular',
  'api::image-analysis.image-analysis.analyze',
];

/**
 * Rechte, die früher einmal vergeben wurden und wieder eingezogen gehören.
 * Ein Eintrag aus PUBLIC_CATALOG_ACTIONS zu löschen genügt nicht – die Zeile
 * bleibt sonst in der Datenbank bestehen und der Endpunkt weiter offen.
 */
const REVOKED_PUBLIC_ACTIONS = [
  // Auswertung läuft jetzt über die Admin-Route /dalor-statistics/stats
  'api::analytics.analytics.stats',
];

export async function enablePublicCatalogRead(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query('plugin::users-permissions.role');
  const permissionQuery = strapi.db.query('plugin::users-permissions.permission');
  const publicRole = await roleQuery.findOne({ where: { type: 'public' } });

  if (!publicRole) return;

  for (const action of PUBLIC_CATALOG_ACTIONS) {
    const existing = await permissionQuery.findOne({
      where: { action, role: publicRole.id },
    });

    if (!existing) {
      await permissionQuery.create({
        data: { action, role: publicRole.id },
      });
    }
  }

  for (const action of REVOKED_PUBLIC_ACTIONS) {
    const stale = await permissionQuery.findOne({
      where: { action, role: publicRole.id },
    });

    if (stale) {
      await permissionQuery.delete({ where: { id: stale.id } });
      strapi.log.info(`Öffentliches Recht entzogen: ${action}`);
    }
  }
}
