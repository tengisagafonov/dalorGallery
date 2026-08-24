import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { Core } from '@strapi/strapi';
import { recordActivity } from '../../../services/activity-log';
import { IMAGE_DESCRIPTION_FIELD } from '../../../services/image-description-input';
import { callResponses, outputText } from '../../../services/openai-model';
import { SUBJECT_PHRASE_RULES, tidySubjectPhrase } from '../../../services/subject-phrase';
import { templateDomain } from '../../../services/template-domain';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = Number(process.env.IMAGE_ANALYSIS_LIMIT) || 10;
const HIT_UID = 'api::image-analysis-hit.image-analysis-hit' as const;

/**
 * Aufrufe aus dem eigenen Netz zählen nicht mit.
 *
 * Das Limit soll fremde Besucher bremsen, weil jeder Aufruf Geld kostet – nicht die
 * eigene Entwicklung. Beim Ausprobieren war das Kontingent sonst nach zehn Bildern
 * aufgebraucht und die Funktion für eine Stunde blockiert.
 */
const LOCAL_ADDRESS = /^(::1$|::ffff:127\.|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
const LOCALES = ['en', 'de', 'ru', 'hi', 'pa'];
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German',
  ru: 'Russian',
  hi: 'Hindi',
  pa: 'Punjabi',
};

type Upload = {
  filepath?: string;
  mimetype?: string;
  size?: number;
};

type Analysis = {
  subject: string;
  imageDomain: string;
  fits: boolean;
  detected: string;
  expected: string;
};

/**
 * Die Warenwelt der Vorlage kommt bewusst NICHT aus diesem Aufruf – sie wird vorher
 * ohne das Bild bestimmt (services/template-domain.ts) und hier nur noch vorgegeben.
 * Solange das Modell beides gleichzeitig entschied, übernahm ein hochgeladenes Poster
 * mit großer Schrift sein Thema als Thema der Vorlage und passte damit immer.
 */
const analysisSchema = {
  type: 'object',
  properties: {
    imageDomain: { type: 'string' },
    fits: { type: 'boolean' },
    detected: { type: 'string' },
    expected: { type: 'string' },
    subject: { type: 'string' },
  },
  required: ['imageDomain', 'fits', 'detected', 'expected', 'subject'],
  additionalProperties: false,
};

/**
 * Das Ergebnis landet im Platzhalter {{image_description}} der Templates – dort steht es
 * an Stellen wie „SNEAKER - EXACT MODEL:" oder „On the right side:". Hintergrund, Layout,
 * Typografie, Rahmen, Licht und Stil kommen bereits aus dem Template.
 *
 * Deshalb darf die Analyse ausschließlich das Motiv beschreiben. Beschreibt sie zusätzlich
 * Szene, Licht oder Gestaltung, kämpft das gegen die BACKGROUND-/STYLE-Abschnitte des
 * Templates – bei einem hochgeladenen Poster würde am Ende dieses Poster nachgebaut
 * statt das Template mit dem abgebildeten Produkt gefüllt.
 */
function instruction(domain: string | null, language: string) {
  return [
    'Extract ONLY the physical subject from the attached image, so it can be placed into a different, already designed layout.',
    'Describe only the single most prominent physical thing: product, food, drink, vehicle, garment, device, person or animal.',
    'If the image is itself a poster, advertisement, packaging or screenshot, ignore its design completely and describe only the real object it shows.',
    '',
    'Answer the fields in exactly this order:',
    '1. "imageDomain": the product world the photographed subject belongs to, 1-3 words in English',
    '   (for example "beverages", "footwear", "real estate", "cosmetics", "cars", "prepared food").',
    '2. "fits": see the comparison rule below.',
    `3. "detected": two or three words naming what the image actually shows, written in ${language}.`,
    `4. "expected": two or three words naming what the target world below is about, written in ${language}.`,
    '5. "subject": the motif phrase, following the FORM rules at the end.',
    '',
    // Die Warenwelt der Vorlage wird getrennt und ohne Bild ermittelt – siehe
    // services/template-domain.ts. Sie steht hier als feste Vorgabe und darf nicht
    // neu bewertet werden: ein hochgeladenes Poster mit großer Schrift hatte das
    // Modell sonst dazu gebracht, dessen Thema für das Thema der Vorlage zu halten.
    domain
      ? [
          `TARGET WORLD (already decided, treat as fixed): ${domain}`,
          'Do not question or re-derive this value. Any text visible inside the image',
          'belongs to the image, never to the target world.',
        ].join('\n')
      : 'No target world was provided – set "fits" to true.',
    '',
    'COMPARISON RULE for "fits":',
    'Set it to true only when "imageDomain" is the same world as the TARGET WORLD,',
    'or an obvious sub-type of it. Otherwise set it to false.',
    'Worked comparisons for a target world "beverages":',
    '  water bottle  -> imageDomain "beverages"    -> fits: true  (a drink container is a beverage)',
    '  iced coffee   -> imageDomain "beverages"    -> fits: true',
    '  plate of pasta-> imageDomain "prepared food"-> fits: false (food is not a beverage)',
    '  dry pasta     -> imageDomain "dry groceries"-> fits: false',
    '  sports car    -> imageDomain "cars"         -> fits: false',
    'Being edible does not make something a beverage – only drinkable things are.',
    'Apply the same strictness to every other target world: a shoe does not fit "cosmetics",',
    'a sofa does not fit "fashion".',
    '',
    SUBJECT_PHRASE_RULES,
  ].join('\n');
}

type TemplateContext = {
  title: string;
  description: string | null;
  example: string | null;
  /** Weitere Eingabefelder – „brand_name", „can_finish" verraten oft das Produkt. */
  otherFields: string | null;
};

const asText = (value: unknown, limit: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : null;

/**
 * Holt Titel, Kategorie und den hinterlegten Motivvorschlag der Vorlage.
 * Der Motivvorschlag ist das beste Signal dafür, was in diese Vorlage gehört.
 *
 * Schlägt die Suche über die Kennung fehl, wird auf Titel und Kategorie
 * zurückgegriffen, die das Frontend mitschickt. Ohne jeden Bezug könnte die
 * Prüfung nichts vergleichen und würde stillschweigend alles durchlassen –
 * genau das soll nicht passieren.
 */
async function templateContext(
  strapi: Core.Strapi,
  body: Record<string, unknown>,
): Promise<TemplateContext | null> {
  const documentId = asText(body.templateId, 60);
  if (documentId) {
    try {
      const entry = (await strapi.documents('api::template.template').findOne({
        documentId,
        status: 'published',
        populate: { inputFields: true },
      })) as Record<string, any> | null;

      if (entry?.title) {
        const fields = (entry.inputFields ?? []) as Record<string, any>[];
        const field = fields.find((item) => item?.key === IMAGE_DESCRIPTION_FIELD.key);
        const others = fields
          .filter((item) => item?.key && item.key !== IMAGE_DESCRIPTION_FIELD.key)
          .map((item) => `${item.key}=${asText(item.placeholder, 40) ?? ''}`)
          .slice(0, 8)
          .join(', ');
        return {
          title: String(entry.title).slice(0, 160),
          description: asText(entry.description, 300),
          example: asText(field?.placeholder, 300),
          otherFields: others || null,
        };
      }
    } catch {
      // Rückfall auf die mitgeschickten Angaben
    }
  }

  const title = asText(body.templateTitle, 160);
  return title
    ? {
        title,
        description: asText(body.templateDescription, 300),
        example: null,
        otherFields: null,
      }
    : null;
}

/**
 * Zählt die Aufrufe in der Datenbank statt im Arbeitsspeicher.
 *
 * Der Endpunkt kostet pro Aufruf Geld. Ein Zähler im Prozessspeicher wäre nach jedem
 * Neustart zurückgesetzt und würde bei mehreren Instanzen jede für sich zählen – das
 * Limit ließe sich also mühelos umgehen. Gespeichert wird nur ein Hash der Kennung,
 * keine IP im Klartext.
 */
async function allowRequest(strapi: Core.Strapi, identifier: string) {
  const query = strapi.db.query(HIT_UID);
  const since = new Date(Date.now() - WINDOW_MS);

  await query.deleteMany({ where: { createdAt: { $lt: since } } });
  const recent = await query.count({ where: { identifier, createdAt: { $gte: since } } });
  if (recent >= MAX_REQUESTS) return false;

  await query.create({ data: { identifier } });
  return true;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async analyze(ctx: any) {
    if (!process.env.OPENAI_API_KEY) {
      return ctx.internalServerError('Bildanalyse ist nicht konfiguriert.');
    }

    const address = String(ctx.request.ip ?? ctx.ip ?? 'unknown');
    const identifier = createHash('sha256').update(address).digest('hex').slice(0, 32);

    if (!LOCAL_ADDRESS.test(address) && !(await allowRequest(strapi, identifier))) {
      void recordActivity(strapi, {
        level: 'warning',
        category: 'security',
        action: 'image-analysis.rate-limited',
        message: `Bildanalyse abgewiesen – mehr als ${MAX_REQUESTS} Aufrufe in einer Stunde`,
        context: { kennung: identifier.slice(0, 12) },
      });
      return ctx.tooManyRequests('Bitte versuche es später erneut.');
    }

    const startedAt = Date.now();
    const rawFile = ctx.request.files?.image;
    const file = (Array.isArray(rawFile) ? rawFile[0] : rawFile) as Upload | undefined;
    if (!file?.filepath || !file.mimetype) return ctx.badRequest('Bitte lade ein Bild hoch.');
    if (!ALLOWED_TYPES.has(file.mimetype)) return ctx.badRequest('Erlaubt sind JPG, PNG, WEBP und GIF.');
    if ((file.size ?? 0) > MAX_FILE_SIZE) return ctx.badRequest('Das Bild darf maximal 10 MB groß sein.');

    const requestedLocale = String(ctx.request.body?.locale ?? 'en');
    const language = LANGUAGE_NAMES[LOCALES.includes(requestedLocale) ? requestedLocale : 'en'];
    const template = await templateContext(strapi, ctx.request.body ?? {});
    if (!template) {
      // Ohne Bezug kann nicht geprüft werden. Das im Protokoll sichtbar machen,
      // statt es unbemerkt durchzuwinken.
      void recordActivity(strapi, {
        level: 'warning',
        category: 'ai',
        action: 'image-analysis.no-template',
        message: 'Bildanalyse ohne Vorlagenbezug – Passt-zur-Vorlage-Prüfung übersprungen',
        context: { gesendet: Object.keys(ctx.request.body ?? {}) },
      });
    }

    // Warenwelt der Vorlage getrennt und ohne Bild bestimmen, je Vorlage nur einmal.
    const domain = template
      ? await templateDomain(strapi, {
          key: asText(ctx.request.body?.templateId, 60) ?? template.title,
          title: template.title,
          description: template.description,
          example: template.example,
          otherFields: template.otherFields,
        })
      : null;

    const image = await readFile(file.filepath);

    const { response, payload, model } = await callResponses(strapi, {
      store: false,
      safety_identifier: identifier,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: instruction(domain, language) },
            {
              type: 'input_image',
              image_url: `data:${file.mimetype};base64,${image.toString('base64')}`,
              detail: 'high',
            },
          ],
        },
      ],
      text: { format: { type: 'json_schema', name: 'dalor_image_subject', strict: true, schema: analysisSchema } },
    });

    if (!response.ok) {
      void recordActivity(strapi, {
        level: 'error',
        category: 'ai',
        action: 'image-analysis.failed',
        message: 'Bildanalyse fehlgeschlagen',
        durationMs: Date.now() - startedAt,
        context: { status: response.status, modell: model, fehler: payload.error?.message ?? null },
      });
      return ctx.throw(response.status, payload.error?.message ?? 'Bildanalyse fehlgeschlagen.');
    }

    const raw = outputText(payload);
    if (!raw) return ctx.internalServerError('Die KI hat keine Beschreibung zurückgegeben.');
    const analysis = JSON.parse(raw) as Analysis;

    // Passt das Motiv nicht zur Vorlage, wird gar nichts eingesetzt – sonst entstünde
    // aus einer Getränkevorlage eine Pasta-Werbung.
    if (analysis.fits === false) {
      void recordActivity(strapi, {
        level: 'info',
        category: 'ai',
        action: 'image-analysis.mismatch',
        message: `Bild passt nicht zur Vorlage „${template?.title ?? '—'}": ${analysis.detected}`,
        durationMs: Date.now() - startedAt,
        context: {
          erkannt: analysis.detected,
          erwartet: analysis.expected,
          weltBild: analysis.imageDomain,
          weltVorlage: domain,
          modell: model,
        },
      });
      return ctx.badRequest('Das Bild passt nicht zu dieser Vorlage.', {
        reason: 'subject-mismatch',
        detected: analysis.detected,
        expected: analysis.expected,
      });
    }

    const subject = tidySubjectPhrase(analysis.subject);
    void recordActivity(strapi, {
      category: 'ai',
      action: 'image-analysis.ok',
      message: `Bild analysiert: ${subject.slice(0, 90)}`,
      durationMs: Date.now() - startedAt,
      context: {
        dateityp: file.mimetype,
        groesseKb: Math.round((file.size ?? 0) / 1024),
        weltBild: analysis.imageDomain,
        weltVorlage: domain,
        vorlage: template?.title ?? null,
        modell: model,
      },
    });
    ctx.body = { description: subject };
  },
});
