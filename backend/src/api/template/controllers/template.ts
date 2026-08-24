import { factories } from '@strapi/strapi';

/**
 * Prompts werden aus den Listen-Antworten entfernt.
 *
 * Vorher lieferte /api/templates alle 163 Prompts auf einen Schlag aus – und weil die
 * Galerie sie serverseitig lud, standen sie zusätzlich im ausgelieferten HTML jeder
 * Seite (~740 KB). Ein einziger Aufruf genügte, um den kompletten Bestand abzugreifen.
 *
 * Der Prompt eines einzelnen Templates bleibt öffentlich abrufbar – die Galerie ist
 * offen und jeder darf einen Prompt kopieren. Es gibt ihn aber nur noch einzeln über
 * /api/templates/:id/prompt. Das ist ausdrücklich kein Kopierschutz: wer will, kann die
 * Endpunkte weiterhin nacheinander abklappern. Es verhindert nur, dass der gesamte
 * Bestand mit einem einzigen Aufruf oder beim bloßen Laden der Startseite mitgeht.
 */

const MAX_PROMPT_LENGTH = 20_000;

function stripPrompt<T extends Record<string, any>>(entry: T) {
  if (!entry || typeof entry !== 'object') return entry;
  const { prompt, ...rest } = entry;
  return {
    ...rest,
    hasPrompt: typeof prompt === 'string' && prompt.trim().length > 0,
  };
}

export default factories.createCoreController('api::template.template', ({ strapi }) => ({
  async find(ctx: any) {
    const response = await super.find(ctx);
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data.map(stripPrompt) : response.data,
    };
  },

  async findOne(ctx: any) {
    const response = await super.findOne(ctx);
    return { ...response, data: stripPrompt(response.data) };
  },

  /** Liefert genau einen Prompt – bewusst der einzige Weg, an den Text zu kommen. */
  async prompt(ctx: any) {
    const documentId = String(ctx.params.id ?? '');
    if (!documentId) return ctx.badRequest('Template fehlt.');

    const entry = await strapi.documents('api::template.template').findOne({
      documentId,
      status: 'published',
      fields: ['prompt'],
    }) as { prompt?: unknown } | null;

    if (!entry || typeof entry.prompt !== 'string' || !entry.prompt.trim()) {
      return ctx.notFound('Für dieses Template gibt es keinen Prompt.');
    }

    ctx.body = { prompt: entry.prompt.slice(0, MAX_PROMPT_LENGTH) };
  },
}));
