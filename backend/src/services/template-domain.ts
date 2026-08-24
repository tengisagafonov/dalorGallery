import type { Core } from '@strapi/strapi';
import { callResponses, outputText } from './openai-model';

/**
 * Bestimmt die Warenwelt einer Vorlage – ausdrücklich **ohne** das hochgeladene Bild.
 *
 * Zuvor wurde beides in einem Aufruf erledigt: Bild ansehen und Warenwelt der Vorlage
 * benennen. Bei einem hochgeladenen *Poster* mit großer Schrift („CITYPULSE") übernahm
 * das Modell dessen Thema als Thema der Vorlage – aus einer Getränkevorlage wurde eine
 * „cars"-Vorlage, und damit passte das Auto natürlich immer. Auch Umsortieren der
 * Antwortfelder und deutliche Anweisungen halfen nur teilweise.
 *
 * Deshalb hier ein eigener, reiner Textaufruf. Das Modell kann das Bild gar nicht sehen
 * und deshalb auch nicht davon beeinflusst werden. Das Ergebnis wird je Vorlage
 * zwischengespeichert, sodass pro Vorlage nur ein einziger zusätzlicher Aufruf anfällt.
 */

const cache = new Map<string, string>();

const schema = {
  type: 'object',
  properties: { domain: { type: 'string' } },
  required: ['domain'],
  additionalProperties: false,
};

export type DomainSource = {
  key: string;
  title: string;
  description?: string | null;
  example?: string | null;
  otherFields?: string | null;
};

export async function templateDomain(
  strapi: Core.Strapi,
  source: DomainSource,
): Promise<string | null> {
  const cached = cache.get(source.key);
  if (cached) return cached;
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const { response, payload } = await callResponses(strapi, {
      store: false,
      input: [
        {
          role: 'system',
          content: [
            'You name the product world that a poster template advertises.',
            'Answer with 1-3 English words, for example: beverages, prepared food, footwear,',
            'cars, real estate, cosmetics, furniture, consumer electronics, jewellery, pets.',
            'The title and the description carry the most weight.',
            'A note about the subject slot may only describe a detail or mood – never let it',
            'override the title. Field names such as "can_finish" or "brand_name" are strong hints.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: JSON.stringify({
            title: source.title,
            description: source.description ?? undefined,
            subjectSlotNote: source.example ?? undefined,
            otherFields: source.otherFields ?? undefined,
          }),
        },
      ],
      text: { format: { type: 'json_schema', name: 'dalor_template_domain', strict: true, schema } },
    });

    if (!response.ok) return null;
    const text = outputText(payload);
    if (!text) return null;

    const domain = String(JSON.parse(text).domain ?? '').trim().toLowerCase().slice(0, 40);
    if (!domain) return null;

    cache.set(source.key, domain);
    return domain;
  } catch {
    return null;
  }
}
