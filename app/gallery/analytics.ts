"use client";

type AnalyticsEvent = {
  eventType: "page_view" | "template_select" | "prompt_preview" | "prompt_copy";
  templateId?: number;
  templateKey?: string;
  templateTitle?: string;
};

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://127.0.0.1:1337";

function visitorId() {
  const key = "dalor-visitor-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function trackAnalytics(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  void fetch(`${STRAPI_URL}/api/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...event, visitorId: visitorId(), path: window.location.pathname }),
    keepalive: true,
  }).catch(() => undefined);
}
