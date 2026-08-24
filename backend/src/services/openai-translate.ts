import { callResponses, outputText } from './openai-model';

const TARGETS = ['de', 'ru', 'hi', 'pa'] as const;
type Target = typeof TARGETS[number];
type Localized = Record<Target, { translations: string[]; keywords: string[] }>;

const languageSchema = {
  type: 'object',
  properties: {
    translations: { type: 'array', items: { type: 'string' } },
    keywords: { type: 'array', items: { type: 'string' } },
  },
  required: ['translations', 'keywords'],
  additionalProperties: false,
};

const schema = {
  type: 'object',
  properties: Object.fromEntries(TARGETS.map((target) => [target, languageSchema])),
  required: TARGETS,
  additionalProperties: false,
};

export async function localize(texts: string[], keywords: string[]): Promise<Localized> {
  const { response, payload } = await callResponses(null, {
    store: false,
    input: [
      {
        role: 'system',
        content: 'Localize English CMS content into German, Russian, Hindi, and Punjabi. Return translations in exactly the same order and count as texts. For keywords, add natural translations and useful search synonyms, remove duplicates, use lowercase, and return at most 30 per language. Preserve brands, product names, company names, numbers, template placeholders such as {{brand}}, and formatting exactly as written.',
      },
      { role: 'user', content: JSON.stringify({ texts, keywords }) },
    ],
    text: { format: { type: 'json_schema', name: 'dalor_localization', strict: true, schema } },
  });
  if (!response.ok) throw new Error(payload.error?.message ?? 'OpenAI-Übersetzung fehlgeschlagen');

  const text = outputText(payload);
  if (!text) throw new Error('OpenAI hat keine Übersetzung zurückgegeben');

  const localized = JSON.parse(text) as Localized;
  for (const target of TARGETS) {
    if (localized[target]?.translations.length !== texts.length) {
      throw new Error(`OpenAI lieferte eine unvollständige ${target}-Übersetzung`);
    }
  }
  return localized;
}

export function localizedField(field: string, target: Target) {
  return `${field}${target[0].toUpperCase()}${target.slice(1)}`;
}

export { TARGETS };
