import "server-only";

type PopularityItem = {
  templateKey?: unknown;
  rank?: unknown;
};

type PopularityResponse = {
  data?: PopularityItem[];
};

const STRAPI_URL = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";

export async function getPopularityRanks(): Promise<Map<string, number>> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/analytics/popular`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) return new Map();
    const payload = (await response.json()) as PopularityResponse;

    return new Map(
      (payload.data ?? []).flatMap((item) =>
        typeof item.templateKey === "string" && typeof item.rank === "number"
          ? [[item.templateKey, item.rank] as const]
          : [],
      ),
    );
  } catch {
    return new Map();
  }
}
