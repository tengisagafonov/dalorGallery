import "server-only";

import type { GalleryTemplate, TemplateField } from "../types";
import { getPopularityRanks } from "./strapi-popularity-repository";

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

type StrapiResponse = {
  data?: StrapiTemplate[];
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
    optional: field.required !== true,
    type: field.inputType === "color"
      ? "color"
      : field.inputType === "textarea" ? "textarea" : "text",
    localizedLabels: localizedValues(field as Record<string, unknown>, "label"),
    localizedPlaceholders: localizedValues(field as Record<string, unknown>, "placeholder"),
  };
}

function mapTemplate(item: StrapiTemplate): GalleryTemplate | null {
  if (
    typeof item.id !== "number" ||
    typeof item.title !== "string" ||
    typeof item.description !== "string" ||
    typeof item.prompt !== "string"
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
    prompt: item.prompt,
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
    const [response, popularityRanks] = await Promise.all([
      fetch(
        `${STRAPI_URL}/api/templates?populate[image]=true&populate[category]=true&populate[inputFields]=true&pagination[pageSize]=100`,
        { cache: "no-store", signal: AbortSignal.timeout(4000) },
      ),
      getPopularityRanks(),
    ]);

    if (!response.ok) return [];

    const payload = (await response.json()) as StrapiResponse;
    return (payload.data ?? []).flatMap((item) => {
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
