const TARGETS = ['de', 'ru', 'hi', 'pa'] as const;
type Target = typeof TARGETS[number];
type Localized = Record<Target, { translations: string[]; keywords: string[] }>;

type ResponsesPayload = {
  error?: { message?: string };
  output?: { content?: { type?: string; text?: string; refusal?: string }[] }[];
};

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
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TRANSLATION_MODEL ?? 'gpt-4.1-mini';
  if (!apiKey) throw new Error('OPENAI_API_KEY fehlt in backend/.env');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        {
          role: 'system',
          content: 'Localize English CMS content into German, Russian, Hindi, and Punjabi. Return translations in exactly the same order and count as texts. For keywords, add natural translations and useful search synonyms, remove duplicates, use lowercase, and return at most 30 per language. Preserve brands, product names, company names, numbers, template placeholders such as {{brand}}, and formatting exactly as written.',
        },
        { role: 'user', content: JSON.stringify({ texts, keywords }) },
      ],
      text: { format: { type: 'json_schema', name: 'dalor_localization', strict: true, schema } },
    }),
  });
  const payload = await response.json() as ResponsesPayload;
  if (!response.ok) throw new Error(payload.error?.message ?? 'OpenAI-Übersetzung fehlgeschlagen');

  const content = payload.output?.flatMap((item) => item.content ?? []) ?? [];
  const refusal = content.find((item) => item.refusal)?.refusal;
  const outputText = content.find((item) => item.type === 'output_text')?.text;
  if (refusal) throw new Error(`OpenAI hat die Übersetzung abgelehnt: ${refusal}`);
  if (!outputText) throw new Error('OpenAI hat keine Übersetzung zurückgegeben');

  const localized = JSON.parse(outputText) as Localized;
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
