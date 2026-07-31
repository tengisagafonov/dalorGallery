import "server-only";

import type { GalleryCategory } from "./gallery-category";

type StrapiCategory = {
  name?: unknown;
  icon?: unknown;
  description?: unknown;
  nameDe?: unknown;
  nameRu?: unknown;
  nameHi?: unknown;
  namePa?: unknown;
  descriptionDe?: unknown;
  descriptionRu?: unknown;
  descriptionHi?: unknown;
  descriptionPa?: unknown;
  parent?: { name?: unknown } | null;
  parentCategory?: unknown;
};

type StrapiResponse = {
  data?: StrapiCategory[];
};

const STRAPI_URL = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";

export async function getStrapiCategories(): Promise<GalleryCategory[]> {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/categories?sort=sortOrder:asc&populate[parent]=true`,
      { cache: "no-store", signal: AbortSignal.timeout(3000) },
    );

    if (!response.ok) return [];

    const payload = (await response.json()) as StrapiResponse;
    return (payload.data ?? []).flatMap((category) =>
      typeof category.name === "string" && category.name.trim()
        ? [{
            name: category.name.trim(),
            icon: typeof category.icon === "string" ? category.icon : undefined,
            localizedNames: localizedValues(category, "name"),
            localizedDescriptions: localizedValues(category, "description"),
            parentName: typeof category.parentCategory === "string"
              ? category.parentCategory
              : typeof category.parent?.name === "string"
                ? category.parent.name
                : undefined,
          }]
        : [],
    );
  } catch {
    return [];
  }
}

function localizedValues(category: StrapiCategory, field: "name" | "description") {
  return Object.fromEntries(
    ["de", "ru", "hi", "pa"].flatMap((locale) => {
      const key = `${field}${locale[0].toUpperCase()}${locale.slice(1)}` as keyof StrapiCategory;
      const value = category[key];
      return typeof value === "string" && value.trim() ? [[locale, value.trim()]] : [];
    }),
  );
}
