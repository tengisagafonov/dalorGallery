import "server-only";

type StrapiPage<T> = {
  data?: T[];
  meta?: {
    pagination?: {
      page?: number;
      pageCount?: number;
    };
  };
};

export async function fetchAllStrapiPages<T>(
  baseUrl: string,
  pageSize = 100,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let pageCount = 1;

  do {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const response = await fetch(
      `${baseUrl}${separator}pagination[pageSize]=${pageSize}&pagination[page]=${page}`,
      { cache: "no-store", signal: AbortSignal.timeout(4000) },
    );

    if (!response.ok) throw new Error(`Strapi request failed: ${response.status}`);

    const payload = (await response.json()) as StrapiPage<T>;
    items.push(...(payload.data ?? []));
    pageCount = payload.meta?.pagination?.pageCount ?? page;
    page += 1;
  } while (page <= pageCount);

  return items;
}
