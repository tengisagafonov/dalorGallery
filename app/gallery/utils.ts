import { searchMatchRank } from "./fuzzy-search";
import type { GalleryTemplate } from "./types";

/**
 * Einleitungen, an denen ein Platzhalter als *Beispiel* erkennbar ist.
 * Gegenstück zu backend/src/services/image-description-input.ts – beide Listen
 * müssen zusammenpassen.
 */
const EXAMPLE_OPENERS = ["for example:", "zum beispiel:", "например:", "उदाहरण:", "ਉਦਾਹਰਨ:"];

export function isExamplePlaceholder(value: string | undefined) {
  const text = (value ?? "").trim().toLowerCase();
  return EXAMPLE_OPENERS.some((opener) => text.startsWith(opener));
}

/**
 * Beispieltexte werden bewusst nicht vorbelegt: sie sind ein Hinweis, kein Wert.
 * Andernfalls landet „For example: A red sports car…" ungefragt im fertigen Prompt.
 */
export function createTemplateValues(template: GalleryTemplate, locale: string) {
  return Object.fromEntries(
    template.fields.map((field) => {
      const placeholder = field.localizedPlaceholders?.[locale] ?? field.placeholder;
      return [field.key, field.placeholderIsExample ? "" : placeholder];
    }),
  );
}

/**
 * Entfernt einen Platzhalter, für den es keinen Wert gibt.
 *
 * Steht er allein auf einer Zeile, fällt die Zeile weg – und mit ihr eine unmittelbar
 * davor stehende reine Beschriftung wie „DESIRED IMAGE / SUBJECT:", die sonst ohne
 * Inhalt zurückbliebe. Beschriftungen mit eigenem Text („Background: dark gradient")
 * bleiben erhalten, weil sie nicht auf einen Doppelpunkt enden.
 */
function removeSlot(prompt: string, key: string) {
  const token = `\\{\\{\\s*${key}\\s*\\}\\}`;
  return prompt
    .replace(new RegExp(`\\n[^\\n]*:[ \\t]*\\n[ \\t]*${token}[ \\t]*(?=\\n|$)`, "g"), "")
    .replace(new RegExp(`\\n[ \\t]*${token}[ \\t]*(?=\\n|$)`, "g"), "")
    .replace(new RegExp(token, "g"), "");
}

export function compilePrompt(template: GalleryTemplate, values: Record<string, string>) {
  const basePrompt = template.prompt || "Create a detailed image based on the following requirements.";
  const compiled = template.fields.reduce((prompt, field) => {
    const value = (values[field.key] ?? "").trim();
    return value
      ? prompt.replaceAll(`{{${field.key}}}`, value)
      : removeSlot(prompt, field.key);
  }, basePrompt);

  return compiled.replace(/\n{3,}/g, "\n\n").trim();
}

const ALL_CATEGORY_NAMES = ["all", "all templates"];

/** Die „Alle"-Kategorie heißt je nach Strapi-Pflege unterschiedlich – hier zentral erkannt. */
export function isAllCategory(category: string) {
  return ALL_CATEGORY_NAMES.includes(category.trim().toLowerCase());
}

export function filterTemplates(
  templates: GalleryTemplate[],
  activeCategory: string,
  query: string,
) {
  const isSearching = query.trim().length > 0;
  const isAllCategory = ALL_CATEGORY_NAMES.includes(activeCategory.trim().toLowerCase());
  const indexedTemplates = templates.flatMap((template) => {
    const categoryMatches =
      isSearching ||
      isAllCategory ||
      (activeCategory === "Popular" && template.popular === true) ||
      (activeCategory === "Trending"
        ? template.trending === true
        : template.subcategory === activeCategory || template.category === activeCategory);

    if (!categoryMatches) return [];

    const searchableText = [
      template.title,
      template.category,
      template.subcategory,
      template.description,
      ...Object.values(template.localizedTitles ?? {}),
      ...Object.values(template.localizedDescriptions ?? {}),
      ...(template.keywords ?? []),
      template.eyebrow,
      template.headline,
      template.subline,
      template.prompt,
      ...Object.values(template.localizedCategoryNames ?? {}),
      ...template.fields.flatMap((field) => [
        field.label,
        field.placeholder,
        ...Object.values(field.localizedLabels ?? {}),
        ...Object.values(field.localizedPlaceholders ?? {}),
      ]),
    ]
      .filter(Boolean)
      .join(" ");
    return [{ template, rank: searchMatchRank(query, searchableText) }];
  });

  const hasExactMatch = indexedTemplates.some(({ rank }) => rank === 2);
  return indexedTemplates
    .filter(({ rank }) => rank === 2 || (!hasExactMatch && rank === 1))
    .map(({ template }) => template)
    .sort((left, right) =>
      activeCategory === "Popular" && !isSearching
        ? (left.popularityRank ?? Number.MAX_SAFE_INTEGER) -
          (right.popularityRank ?? Number.MAX_SAFE_INTEGER)
        : 0,
    )
    .slice(0, activeCategory === "Popular" && !isSearching ? 50 : undefined);
}
