import { searchMatchRank } from "./fuzzy-search";
import type { GalleryTemplate } from "./types";

export function createTemplateValues(template: GalleryTemplate, locale: string) {
  return Object.fromEntries(
    template.fields.map((field) => [
      field.key,
      field.localizedPlaceholders?.[locale] ?? field.placeholder,
    ]),
  );
}

export function compilePrompt(template: GalleryTemplate, values: Record<string, string>) {
  const basePrompt = template.prompt || "Create a detailed image based on the following requirements.";
  return template.fields.reduce((prompt, field) => {
    const value = values[field.key] ?? field.placeholder;
    return prompt.replaceAll(`{{${field.key}}}`, value);
  }, basePrompt);
}

export function filterTemplates(
  templates: GalleryTemplate[],
  activeCategory: string,
  query: string,
) {
  const isSearching = query.trim().length > 0;
  const isAllCategory = ["all", "all templates"].includes(activeCategory.trim().toLowerCase());
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
      ...Object.values(template.localizedTitles ?? {}),
      ...Object.values(template.localizedDescriptions ?? {}),
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
