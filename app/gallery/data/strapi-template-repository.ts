import "server-only";

import type { GalleryTemplate, TemplateField } from "../types";
import { isExamplePlaceholder } from "../utils";
import { getPopularityRanks } from "./strapi-popularity-repository";
import { fetchAllStrapiPages } from "./strapi-page-fetcher";

type StrapiInputField = {
  key?: unknown;
  label?: unknown;
  labelDe?: unknown;
  labelRu?: unknown;
  labelHi?: unknown;
  labelPa?: unknown;
  inputType?: unknown;
  placeholder?: unknown;
  placeholderDe?: unknown;
  placeholderRu?: unknown;
  placeholderHi?: unknown;
  placeholderPa?: unknown;
  required?: unknown;
};

type StrapiTemplate = {
  id?: unknown;
  documentId?: unknown;
  hasPrompt?: unknown;
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  titleDe?: unknown;
  descriptionDe?: unknown;
  titleRu?: unknown;
  descriptionRu?: unknown;
  titleHi?: unknown;
  descriptionHi?: unknown;
  titlePa?: unknown;
  descriptionPa?: unknown;
  prompt?: unknown;
  image?: { url?: unknown } | null;
  category?: {
    name?: unknown;
    nameDe?: unknown;
    nameRu?: unknown;
    nameHi?: unknown;
    namePa?: unknown;
  } | null;
  subcategory?: {
    name?: unknown;
    nameDe?: unknown;
    nameRu?: unknown;
    nameHi?: unknown;
    namePa?: unknown;
  } | null;
  eyebrow?: unknown;
  headline?: unknown;
  subline?: unknown;
  style?: unknown;
  coverFit?: unknown;
  inputFields?: StrapiInputField[];
  searchKeywords?: unknown;
  isTrending?: unknown;
  isPopular?: unknown;
};

const STRAPI_URL = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";

function mapField(field: StrapiInputField): TemplateField | null {
  if (typeof field.key !== "string" || typeof field.label !== "string") return null;
  const placeholder =
    typeof field.placeholder === "string" ? field.placeholder : field.label;

  return {
    key: field.key,
    label: field.label,
    placeholder,
    placeholderIsExample: isExamplePlaceholder(placeholder),
    optional: field.required !== true,
    type: field.inputType === "color"
      ? "color"
      : field.inputType === "textarea" ? "textarea" : "text",
    localizedLabels: localizedValues(field as Record<string, unknown>, "label"),
    localizedPlaceholders: localizedValues(field as Record<string, unknown>, "placeholder"),
  };
}

function mapTemplate(item: StrapiTemplate): GalleryTemplate | null {
  // `prompt` wird von der API bewusst nicht mehr mitgeliefert – siehe
  // backend/src/api/template/controllers/template.ts
  if (
    typeof item.id !== "number" ||
    typeof item.title !== "string" ||
    typeof item.description !== "string"
  ) return null;

  const imageUrl = typeof item.image?.url === "string" ? item.image.url : undefined;
  const keywords = Array.isArray(item.searchKeywords)
    ? item.searchKeywords.filter((value): value is string => typeof value === "string")
    : [];
  const localizedTitles = Object.fromEntries(
    [
      ["de", item.titleDe],
      ["ru", item.titleRu],
      ["hi", item.titleHi],
      ["pa", item.titlePa],
    ].filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].length > 0,
    ),
  );
  const localizedDescriptions = Object.fromEntries(
    [
      ["de", item.descriptionDe],
      ["ru", item.descriptionRu],
      ["hi", item.descriptionHi],
      ["pa", item.descriptionPa],
    ].filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].length > 0,
    ),
  );

  return {
    id: 1_000_000 + item.id,
    analyticsKey: typeof item.slug === "string" ? item.slug : item.title,
    title: item.title,
    category: typeof item.category?.name === "string" ? item.category.name : "Advertising",
    subcategory: typeof item.subcategory?.name === "string" ? item.subcategory.name : undefined,
    description: item.description,
    keywords,
    eyebrow: typeof item.eyebrow === "string" ? item.eyebrow : "NEW TEMPLATE",
    headline: typeof item.headline === "string" ? item.headline : item.title,
    subline: typeof item.subline === "string" ? item.subline : item.description,
    style: typeof item.style === "string" ? item.style : "from-[#eeeae4] to-[#d9d2c9] text-[#171410]",
    fields: (item.inputFields ?? []).flatMap((field) => mapField(field) ?? []),
    promptId: typeof item.documentId === "string" ? item.documentId : undefined,
    hasPrompt: item.hasPrompt === true,
    cover: imageUrl
      ? imageUrl.startsWith("http") ? imageUrl : `${STRAPI_URL}${imageUrl}`
      : undefined,
    coverFit: item.coverFit === "cover" ? "cover" : "contain",
    trending: item.isTrending === true,
    popular: item.isPopular === true,
    localizedTitles,
    localizedDescriptions,
    localizedCategoryNames: item.category
      ? localizedValues(item.category, "name")
      : {},
  };
}

function localizedValues(
  source: Record<string, unknown>,
  field: string,
): Record<string, string> {
  return Object.fromEntries(
    ["de", "ru", "hi", "pa"].flatMap((locale) => {
      const key = `${field}${locale[0].toUpperCase()}${locale.slice(1)}`;
      const value = source[key];
      return typeof value === "string" && value.trim() ? [[locale, value.trim()]] : [];
    }),
  );
}

export async function getStrapiTemplates(): Promise<GalleryTemplate[]> {
  try {
    const [items, popularityRanks] = await Promise.all([
      fetchAllStrapiPages<StrapiTemplate>(
        `${STRAPI_URL}/api/templates?populate[image]=true&populate[category]=true&populate[inputFields]=true`,
      ),
      getPopularityRanks(),
    ]);

    return items.flatMap((item) => {
      const template = mapTemplate(item);
      if (!template) return [];
      const popularityRank = popularityRanks.get(template.analyticsKey)
        ?? popularityRanks.get(template.title);
      return [{ ...template, popular: popularityRank !== undefined, popularityRank }];
    });
  } catch {
    return [];
  }
}
