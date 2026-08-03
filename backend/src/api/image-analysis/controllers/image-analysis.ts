import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;
const requests = new Map<string, number[]>();

type Upload = {
  filepath?: string;
  mimetype?: string;
  size?: number;
};

type ResponsesPayload = {
  error?: { message?: string };
  output?: { content?: { type?: string; text?: string; refusal?: string }[] }[];
};

function outputText(payload: ResponsesPayload) {
  const content = payload.output?.flatMap((item) => item.content ?? []) ?? [];
  const refusal = content.find((item) => item.refusal)?.refusal;
  if (refusal) throw new Error(`Bildanalyse abgelehnt: ${refusal}`);
  return content.find((item) => item.type === 'output_text')?.text?.trim();
}

function allowRequest(identifier: string) {
  const now = Date.now();
  const recent = (requests.get(identifier) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return false;
  requests.set(identifier, [...recent, now]);
  return true;
}

export default {
  async analyze(ctx: any) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return ctx.internalServerError('Bildanalyse ist nicht konfiguriert.');

    const identifier = String(ctx.request.ip ?? ctx.ip ?? 'unknown');
    if (!allowRequest(identifier)) return ctx.tooManyRequests('Bitte versuche es später erneut.');

    const rawFile = ctx.request.files?.image;
    const file = (Array.isArray(rawFile) ? rawFile[0] : rawFile) as Upload | undefined;
    if (!file?.filepath || !file.mimetype) return ctx.badRequest('Bitte lade ein Bild hoch.');
    if (!ALLOWED_TYPES.has(file.mimetype)) return ctx.badRequest('Erlaubt sind JPG, PNG, WEBP und GIF.');
    if ((file.size ?? 0) > MAX_FILE_SIZE) return ctx.badRequest('Das Bild darf maximal 10 MB groß sein.');

    const image = await readFile(file.filepath);
    const requestBody = {
        store: false,
        safety_identifier: createHash('sha256').update(identifier).digest('hex').slice(0, 32),
        input: [{
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Describe the main subject in this image for an image-generation prompt. Capture product type, exact visible shape, colors, materials, patterns, text, branding, perspective, lighting, and distinctive details. Do not describe the surrounding UI. Do not invent hidden details. Return only one precise English paragraph without markdown.',
            },
            { type: 'input_image', image_url: `data:${file.mimetype};base64,${image.toString('base64')}`, detail: 'high' },
          ],
        }],
    };
    const request = (model: string) => fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...requestBody,
        model,
        ...(model.startsWith('gpt-5.6') ? { reasoning: { effort: 'low' } } : {}),
      }),
    });
    const preferredModel = process.env.OPENAI_VISION_MODEL ?? 'gpt-5.6-luna';
    let response = await request(preferredModel);
    let payload = await response.json() as ResponsesPayload;
    if (response.status === 403 && preferredModel === 'gpt-5.6-luna') {
      response = await request(process.env.OPENAI_VISION_FALLBACK_MODEL ?? 'gpt-4.1-mini');
      payload = await response.json() as ResponsesPayload;
    }
    if (!response.ok) return ctx.throw(response.status, payload.error?.message ?? 'Bildanalyse fehlgeschlagen.');
    const description = outputText(payload);
    if (!description) return ctx.internalServerError('Die KI hat keine Beschreibung zurückgegeben.');
    ctx.body = { description };
  },
};
