/**
 * Gemeinsame Form für alles, was im Platzhalter {{image_description}} landet.
 *
 * Der Slot steht in den Templates an Stellen wie „SNEAKER - EXACT MODEL:" oder
 * „DESIRED IMAGE / SUBJECT:". Hintergrund, Layout, Typografie, Licht und Stil kommen
 * bereits aus dem Template – dort darf deshalb nur das Motiv stehen.
 *
 * Beide Quellen nutzen dieselben Regeln, damit ein hochgeladenes Bild und ein
 * automatisch erzeugter Beispieltext identisch aufgebaut sind:
 *  - die Bildanalyse in src/api/image-analysis/controllers/image-analysis.ts
 *  - die Beispielerzeugung in src/services/subject-example.ts
 */
import { capToStringField } from './field-length';

export const SUBJECT_PHRASE_RULES = [
  'FORM: one English noun phrase, attributes separated by commas, maximum 40 words. Nothing else.',
  '',
  'WORKED EXAMPLE',
  'For a sneaker advertisement standing on a marble table under soft studio light,',
  'with the headline "SUMMER SALE" above it, the correct output is exactly:',
  'white chunky sneaker, blue side accents, mesh and leather upper, zigzag blue stitching, thick white rubber sole',
  '',
  'Note what the example leaves out: the headline, the marble table, the studio light,',
  'the camera angle and the fact that it is an advertisement. Only the sneaker itself remains.',
  '',
  'RULES',
  '1. Include the subject type, shape, colors, materials, texture and defining details',
  '   (toppings, garnish, stitching, trim, wheels, or a logo physically printed on the object).',
  '2. Leave out background, surface, scene, props, lighting, shadows, reflections, time of day,',
  '   camera angle, framing, depth of field, mood and art style — the layout already defines those.',
  '3. Leave out ALL text: headlines, brand names, slogans, taglines, prices, badges, watermarks.',
  '4. Do not invent anything. No marketing or quality adjectives.',
  '5. Do not write a sentence. Never begin with "the main subject", "the image shows" or "a photo of".',
].join('\n');

/**
 * Modelle stellen dem Motiv gern eine Meta-Formulierung voran – die fliegt hier raus.
 *
 * Zum Schluss wird gekappt: die 40-Wort-Regel oben ist nur eine Bitte an das Modell, und
 * der Wert landet in einem `string`-Attribut. Hielt sich das Modell nicht daran, scheiterte
 * bisher das ganze Template an einem ValidationError.
 */
export function tidySubjectPhrase(value: string) {
  const tidied = value
    .replace(/^(the\s+)?(main\s+)?(subject|image|photo|picture)\s+(is|shows|depicts|features|contains)\s+/i, '')
    .replace(/^(a|an)\s+(photo|image|picture|close-up|shot|render)\s+of\s+(a\s+|an\s+)?/i, '')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .trim();

  return capToStringField(tidied);
}
