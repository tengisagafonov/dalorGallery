import type { Core } from '@strapi/strapi';

const PUBLIC_CATALOG_ACTIONS = [
  'api::category.category.find',
  'api::category.category.findOne',
  'api::template.template.find',
  'api::template.template.findOne',
  'api::analytics.analytics.track',
  'api::analytics.analytics.popular',
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
}
