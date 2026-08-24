import { callResponses, outputText } from './openai-model';
import { SUBJECT_PHRASE_RULES, tidySubjectPhrase } from './subject-phrase';

/**
 * Erzeugt aus einem Template einen passenden Motiv-Vorschlag für {{image_description}}.
 *
 * Vorher stand in fast jedem Template derselbe Beispielsatz („A red sports car driving
 * through Vienna at sunset…"), der ungefragt in den Prompt wanderte. Statt eines generischen
 * Texts bekommt jedes Template jetzt ein Motiv, das zu ihm passt – bei „Watch Collection"
 * also eine Uhr, bei „Food Ad Poster" ein Gericht.
 *
 * Die Modellwahl liegt zentral in openai-model.ts.
 */

export type TemplateSummary = {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  prompt?: unknown;
};

const schema = {
  type: 'object',
  properties: { subject: { type: 'string' } },
  required: ['subject'],
  additionalProperties: false,
};

const asText = (value: unknown, limit: number) =>
  typeof value === 'string' ? value.slice(0, limit) : '';

export async function generateSubjectExample(template: TemplateSummary): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const title = asText(template.title, 160);
  const prompt = asText(template.prompt, 1200);
  if (!title && !prompt) return null;

  const { response, payload } = await callResponses(null, {
    store: false,
    input: [
      {
        role: 'system',
        content: [
          'You write the default subject for a poster template.',
          'The template already defines layout, background, typography and style.',
          'Your job is only to name a fitting, concrete product or motif for it.',
          '',
          SUBJECT_PHRASE_RULES,
        ].join('\n'),
      },
      {
        role: 'user',
        content: JSON.stringify({
          title,
          description: asText(template.description, 400),
          category: asText(template.category, 80),
          templatePrompt: prompt,
        }),
      },
    ],
    text: { format: { type: 'json_schema', name: 'dalor_subject', strict: true, schema } },
  });

  if (!response.ok) throw new Error(payload.error?.message ?? 'Motiv-Vorschlag fehlgeschlagen');

  let text: string | undefined;
  try {
    text = outputText(payload);
  } catch {
    return null;
  }
  if (!text) return null;

  const subject = tidySubjectPhrase(String(JSON.parse(text).subject ?? ''));
  return subject.length >= 3 ? subject : null;
}
