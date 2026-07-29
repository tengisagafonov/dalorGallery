import { fashionSubcategories, trendingTemplateIds } from "./config";
import { searchMatchRank } from "./fuzzy-search";
import { dictionaries, type Translation } from "./i18n";
import { multilingualSearchKeywords } from "./multilingual-search-keywords";
import type { GalleryTemplate } from "./types";

export function createTemplateValues(template: GalleryTemplate) {
  return Object.fromEntries(template.fields.map((field) => [field.key, field.placeholder]));
}

export function compilePrompt(template: GalleryTemplate, values: Record<string, string>) {
  if (!template.prompt) {
    return "A detailed prompt will be added for this template later.";
  }

  return template.fields.reduce((prompt, field) => {
    const value = values[field.key] ?? field.placeholder;
    return prompt.replaceAll(`{{${field.key}}}`, value);
  }, template.prompt);
}

export function filterTemplates(
  templates: GalleryTemplate[],
  activeCategory: string,
  query: string,
) {
  const indexedTemplates = templates.flatMap((template) => {
    const categoryMatches =
      activeCategory === "Popular" ||
      (activeCategory === "Trending"
        ? trendingTemplateIds.has(template.id)
        : fashionSubcategories.includes(activeCategory)
            ? template.subcategory === activeCategory
            : template.category === activeCategory);

    if (!categoryMatches) return [];

    const localizedText = Object.values(dictionaries).flatMap((dictionary) => {
      const translation = dictionary as Translation;
      const id = String(template.id);
      return [
        translation.templateTitles[id],
        translation.templateDescriptions[id],
        translation.categories[template.category],
        template.subcategory ? translation.categories[template.subcategory] : undefined,
      ];
    });
    const searchableText = [
      template.title,
      template.category,
      template.subcategory,
      template.description,
      ...(template.keywords ?? []),
      ...(multilingualSearchKeywords[template.id] ?? []),
      template.eyebrow,
      template.headline,
      template.subline,
      template.prompt,
      ...localizedText,
      ...template.fields.flatMap((field) => [field.label, field.placeholder]),
    ]
      .filter(Boolean)
      .join(" ");
    return [{ template, rank: searchMatchRank(query, searchableText) }];
  });

  const hasExactMatch = indexedTemplates.some(({ rank }) => rank === 2);
  return indexedTemplates
    .filter(({ rank }) => rank === 2 || (!hasExactMatch && rank === 1))
    .map(({ template }) => template);
}
