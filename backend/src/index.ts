import type { Core } from '@strapi/strapi';
import { seedDefaultCategories } from './bootstrap/default-categories';
import { configureGermanAdmin } from './bootstrap/german-admin';
import { enablePublicCatalogRead } from './bootstrap/public-category-permissions';
import { seedDefaultSearchKeywords } from './bootstrap/default-search-keywords';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await enablePublicCatalogRead(strapi);
    await seedDefaultCategories(strapi);
    await seedDefaultSearchKeywords(strapi);
    await configureGermanAdmin(strapi);
  },
};
