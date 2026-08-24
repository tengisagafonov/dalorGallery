import type { Core } from '@strapi/strapi';
import { registerAdminRoutes } from './bootstrap/admin-routes';
import { registerContentActivity } from './bootstrap/content-activity';
import { seedDefaultCategories } from './bootstrap/default-categories';
import { configureGermanAdmin } from './bootstrap/german-admin';
import { enablePublicCatalogRead } from './bootstrap/public-category-permissions';
import { seedDefaultSearchKeywords } from './bootstrap/default-search-keywords';
import { seedImageDescriptionInput } from './bootstrap/image-description-input';
import { backfillSubjectExamples, fillSubjectExample } from './bootstrap/subject-example-backfill';
import { pruneActivityLog, recordActivity } from './services/activity-log';
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
    registerAdminRoutes(strapi);
    registerContentActivity(strapi);

    strapi.documents.use(async (context, next) => {
      if (
        context.uid === 'api::template.template' &&
        (context.action === 'create' || context.action === 'update') &&
        context.params.data
      ) {
        const data = context.params.data as Record<string, any>;
        ensureImageDescriptionInput(data, context.action === 'create');
        try {
          await fillSubjectExample(data);
        } catch (error) {
          strapi.log.error('Motivvorschlag konnte nicht erzeugt werden.', error);
        }
        try {
          await translateTemplate(context.params.data as Record<string, any>);
        } catch (error) {
          strapi.log.error('Variable konnte nicht automatisch übersetzt werden.', error);
          void recordActivity(strapi, {
            level: 'error',
            category: 'ai',
            action: 'translate.failed',
            message: 'Automatische Übersetzung fehlgeschlagen',
            context: { fehler: error instanceof Error ? error.message : String(error) },
          });
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
    await pruneActivityLog(strapi);

    void recordActivity(strapi, {
      category: 'system',
      action: 'server.start',
      message: 'Server gestartet',
      context: { umgebung: process.env.NODE_ENV ?? 'development' },
    });

    // Läuft bewusst ohne await: bei vielen Templates dauert das Minuten und soll
    // den Serverstart nicht aufhalten.
    void backfillSubjectExamples(strapi).catch((error) => {
      strapi.log.error('Nachrüstung der Motivvorschläge fehlgeschlagen.', error);
    });
  },
};
