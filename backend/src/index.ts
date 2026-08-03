import type { Core } from '@strapi/strapi';
import { seedDefaultCategories } from './bootstrap/default-categories';
import { configureGermanAdmin } from './bootstrap/german-admin';
import { enablePublicCatalogRead } from './bootstrap/public-category-permissions';
import { seedDefaultSearchKeywords } from './bootstrap/default-search-keywords';
import { seedImageDescriptionInput } from './bootstrap/image-description-input';
import { ensureImageDescriptionInput } from './services/image-description-input';
import { translateTemplate } from './services/auto-translate';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (context, next) => {
      if (
        context.uid === 'api::template.template' &&
        (context.action === 'create' || context.action === 'update') &&
        context.params.data
      ) {
        ensureImageDescriptionInput(context.params.data as Record<string, any>);
        try {
          await translateTemplate(context.params.data as Record<string, any>);
        } catch (error) {
          strapi.log.error('Variable konnte nicht automatisch übersetzt werden.', error);
        }
      }
      return next();
    });
  },

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
    await seedImageDescriptionInput(strapi);
    await configureGermanAdmin(strapi);
  },
};
