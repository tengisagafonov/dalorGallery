import type { Core } from '@strapi/strapi';

/**
 * Gemeinsamer Zugang zur OpenAI-Responses-API für alle KI-Funktionen
 * (Bildanalyse, Motivvorschläge, Übersetzungen).
 *
 * Bevorzugt wird `gpt-5.6-luna`. Ist das Modell für den verwendeten Key nicht
 * freigeschaltet, antwortet OpenAI mit 403 – dann wird automatisch auf das
 * Rückfallmodell umgeschaltet.
 *
 * Damit nicht bei jedem einzelnen Aufruf eine 403-Anfrage verschwendet wird, merkt
 * sich der Prozess gesperrte Modelle für eine Weile. Nach Ablauf wird erneut geprüft,
 * sodass eine spätere Freischaltung von allein wirksam wird – ohne Codeänderung.
 */

const BLOCK_TTL_MS = 30 * 60 * 1000;
const blockedUntil = new Map<string, number>();

export type ResponsesPayload = {
  error?: { message?: string };
  output?: { content?: { type?: string; text?: string; refusal?: string }[] }[];
};

export const preferredModel = () => process.env.OPENAI_MODEL ?? 'gpt-5.6-luna';
export const fallbackModel = () => process.env.OPENAI_FALLBACK_MODEL ?? 'gpt-4.1-mini';

const isBlocked = (model: string) => (blockedUntil.get(model) ?? 0) > Date.now();

async function request(apiKey: string, model: string, body: Record<string, unknown>) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      model,
      // Die 5er-Reihe rechnet ohne diese Angabe unnötig lange nach.
      ...(model.startsWith('gpt-5') ? { reasoning: { effort: 'low' } } : {}),
    }),
  });
  return { response, payload: (await response.json()) as ResponsesPayload };
}

export async function callResponses(strapi: Core.Strapi | null, body: Record<string, unknown>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY fehlt in backend/.env');

  const preferred = preferredModel();
  const fallback = fallbackModel();
  const candidates = [
    ...(isBlocked(preferred) ? [] : [preferred]),
    ...(fallback === preferred ? [] : [fallback]),
  ];
  if (candidates.length === 0) candidates.push(fallback);

  let attempt = await request(apiKey, candidates[0], body);
  let used = candidates[0];

  if (attempt.response.status === 403 && candidates.length > 1) {
    blockedUntil.set(used, Date.now() + BLOCK_TTL_MS);
    strapi?.log.warn(
      `Modell "${used}" ist für diesen OpenAI-Key nicht freigeschaltet – nutze "${candidates[1]}".`,
    );
    used = candidates[1];
    attempt = await request(apiKey, used, body);
  }

  return { ...attempt, model: used };
}

/** Liest den Textausgang und wirft, wenn das Modell die Antwort verweigert hat. */
export function outputText(payload: ResponsesPayload) {
  const content = payload.output?.flatMap((item) => item.content ?? []) ?? [];
  const refusal = content.find((item) => item.refusal)?.refusal;
  if (refusal) throw new Error(`Anfrage abgelehnt: ${refusal}`);
  return content.find((item) => item.type === 'output_text')?.text?.trim();
}
