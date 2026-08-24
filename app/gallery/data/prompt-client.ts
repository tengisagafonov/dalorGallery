"use client";

import type { GalleryTemplate } from "../types";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://127.0.0.1:1337";

/**
 * Holt den Prompt eines einzelnen Templates.
 *
 * Prompts stehen bewusst nicht mehr im Initial-Payload der Galerie – sonst lägen alle
 * 163 im HTML jeder Seite. Sie werden erst geladen, wenn jemand ein Template auswählt.
 */
export async function fetchTemplatePrompt(template: GalleryTemplate) {
  if (!template.promptId || template.hasPrompt === false) return null;

  const response = await fetch(
    `${STRAPI_URL}/api/templates/${encodeURIComponent(template.promptId)}/prompt`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) return null;

  const payload = (await response.json()) as { prompt?: unknown };
  return typeof payload.prompt === "string" ? payload.prompt : null;
}
