import type { Core } from '@strapi/strapi';
import { recordActivity } from '../services/activity-log';
import { generateSubjectExample } from '../services/subject-example';
import {
  IMAGE_DESCRIPTION_FIELD,
  isExamplePlaceholder,
} from '../services/image-description-input';

const UID = 'api::template.template' as const;
const CONCURRENCY = 3;

type InputField = Record<string, any> & { key?: string };
type TemplateDocument = {
  documentId: string;
  title?: string;
  description?: string;
  prompt?: string;
  inputFields?: InputField[];
};

const PLACEHOLDER_KEYS = [
  'placeholder',
  'placeholderDe',
  'placeholderRu',
  'placeholderHi',
  'placeholderPa',
];

/**
 * Setzt den generierten Motivvorschlag in allen Sprachfeldern.
 *
 * Bewusst überall derselbe englische Text: der Wert wandert in den englischen Prompt,
 * eine Übersetzung würde dort nur stören. Bliebe eine Sprachfassung auf dem alten
 * Beispielsatz stehen, bekäme z. B. ein deutscher Besucher weiterhin den roten Sportwagen.
 */
function applySubject(field: InputField, subject: string) {
  // Nur das englische Feld tragen: die Galerie fällt bei leeren Sprachfeldern darauf
  // zurück. Denselben Text fünfmal auszuliefern blähte den Seiten-Payload spürbar auf.
  field.placeholder = subject;
  for (const key of PLACEHOLDER_KEYS.slice(1)) field[key] = null;
}

/**
 * Entfernt Sprachfassungen, die wortgleich mit der englischen sind.
 * Bewusst nur bei exakter Gleichheit – echte Übersetzungen bleiben erhalten.
 */
function dropRedundantTranslations(field: InputField) {
  let changed = false;
  for (const key of PLACEHOLDER_KEYS.slice(1)) {
    if (typeof field[key] === 'string' && field[key] === field.placeholder) {
      field[key] = null;
      changed = true;
    }
  }
  return changed;
}

/** Findet das Motivfeld eines Templates, sofern es noch einen Beispieltext trägt. */
function pendingField(template: TemplateDocument): InputField | null {
  const field = template.inputFields?.find(({ key }) => key === IMAGE_DESCRIPTION_FIELD.key);
  return field && isExamplePlaceholder(field.placeholder) ? field : null;
}

/**
 * Ergänzt ein einzelnes Template. Wird auch beim Anlegen/Bearbeiten im Admin genutzt,
 * damit ein neues Template nicht bis zum nächsten Serverstart auf sein Beispiel wartet.
 */
export async function fillSubjectExample(data: Record<string, any>) {
  const field = pendingField(data as TemplateDocument);
  if (!field) return false;

  const subject = await generateSubjectExample({
    title: data.title,
    description: data.description,
    prompt: data.prompt,
  });
  if (!subject) return false;

  applySubject(field, subject);
  return true;
}

/**
 * Rüstet alle Templates nach, die noch den gesäten Beispielsatz tragen.
 *
 * Läuft absichtlich im Hintergrund nach dem Start: bei ~150 Templates dauert das einige
 * Minuten und soll den Serverstart nicht blockieren. Danach findet der Lauf nichts mehr
 * zu tun und ist in Millisekunden durch.
 */
/**
 * Räumt einmalig die redundanten Sprachfassungen des Motivfelds ab.
 * Reine Datenbankarbeit, keine KI-Aufrufe – läuft schnell durch.
 */
async function pruneRedundantTranslations(
  strapi: Core.Strapi,
  drafts: TemplateDocument[],
  published: TemplateDocument[],
) {
  const publishedIds = new Set(published.map(({ documentId }) => documentId));
  const manager = strapi.plugin('content-manager').service('document-manager');
  let cleaned = 0;

  for (const template of drafts) {
    const field = template.inputFields?.find(
      ({ key }) => key === IMAGE_DESCRIPTION_FIELD.key,
    );
    if (!field || !dropRedundantTranslations(field)) continue;

    try {
      await manager.update(template.documentId, UID, {
        data: { inputFields: template.inputFields },
        populate: {},
      });
      if (publishedIds.has(template.documentId)) {
        await manager.publish(template.documentId, UID, { populate: {} });
      }
      cleaned++;
    } catch (error) {
      strapi.log.error(`Sprachfassungen für "${template.title}" nicht bereinigt.`, error);
    }
  }

  if (cleaned) strapi.log.info(`Doppelte Sprachfassungen entfernt: ${cleaned} Templates.`);
}

export async function backfillSubjectExamples(strapi: Core.Strapi) {
  if (process.env.SUBJECT_EXAMPLES !== 'off' && !process.env.OPENAI_API_KEY) {
    strapi.log.warn('Motivvorschläge übersprungen: OPENAI_API_KEY fehlt.');
    return;
  }
  if (process.env.SUBJECT_EXAMPLES === 'off') return;

  const documents = strapi.documents(UID);
  const [drafts, published] = await Promise.all([
    documents.findMany({ status: 'draft', populate: { inputFields: true } }),
    documents.findMany({ status: 'published', fields: ['documentId'] }),
  ]) as [TemplateDocument[], TemplateDocument[]];

  await pruneRedundantTranslations(strapi, drafts, published);

  const pending = drafts.filter((template) => pendingField(template));
  if (pending.length === 0) return;

  const publishedIds = new Set(published.map(({ documentId }) => documentId));
  const manager = strapi.plugin('content-manager').service('document-manager');
  strapi.log.info(`Motivvorschläge werden für ${pending.length} Templates erzeugt …`);

  let done = 0;
  let failed = 0;
  const queue = [...pending];

  const worker = async () => {
    for (let template = queue.shift(); template; template = queue.shift()) {
      try {
        const data = { inputFields: template.inputFields ?? [] };
        const field = pendingField({ ...template, inputFields: data.inputFields });
        if (!field) continue;

        const subject = await generateSubjectExample(template);
        if (!subject) { failed++; continue; }
        applySubject(field, subject);

        await manager.update(template.documentId, UID, {
          data: { inputFields: data.inputFields },
          populate: {},
        });
        if (publishedIds.has(template.documentId)) {
          await manager.publish(template.documentId, UID, { populate: {} });
        }
        done++;
      } catch (error) {
        failed++;
        strapi.log.error(`Motivvorschlag für "${template.title}" fehlgeschlagen.`, error);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  strapi.log.info(`Motivvorschläge fertig: ${done} ergänzt, ${failed} fehlgeschlagen.`);

  // Eine Zusammenfassung statt eines Eintrags je Template – sonst überschwemmt
  // ein einziger Nachrüstlauf das gesamte Protokoll.
  void recordActivity(strapi, {
    level: failed > 0 ? 'warning' : 'info',
    category: 'system',
    action: 'subject-examples.backfill',
    message: `Motivvorschläge erzeugt: ${done} ergänzt, ${failed} fehlgeschlagen`,
    context: { geplant: pending.length, ergaenzt: done, fehlgeschlagen: failed },
  });
}
