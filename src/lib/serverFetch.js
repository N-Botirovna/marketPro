/**
 * SSR-safe data fetch helper for React Server Components.
 *
 * Why not reuse `src/lib/http.js`? That instance is axios + a localStorage
 * cache + auth interceptors — none of which make sense on the server, and
 * the in-memory cache would leak across requests when shared in the Node
 * process. Native `fetch()` with Next's per-URL cache is the right tool.
 */

import { getApiBaseUrl } from "@/config/env";

// Mirror the request-side alias from src/services/books.js so server-rendered
// pages can still use the friendlier "sell" slug in their call sites.
const TYPE_REQ_ALIAS = { sell: "seller" };

/**
 * Fetch a JSON resource from the Django API on the server.
 *
 * @param {string} path - leading-slash URL path (e.g. "/api/v1/book/list/").
 * @param {object} [options]
 * @param {object} [options.params] - query string params (empty/null skipped).
 * @param {number} [options.revalidate] - Next ISR revalidation window in
 *   seconds (default 300). Pass 0 to disable caching entirely.
 * @param {string} [options.locale="uz"] - sent as Accept-Language so the
 *   API returns translated content.
 * @returns {Promise<any|null>} parsed JSON, or `null` on any failure —
 *   server components should degrade quietly when the API is unreachable.
 */
export async function serverGet(path, { params = {}, revalidate = 300, locale = "uz" } = {}) {
  const base = getApiBaseUrl().replace(/\/$/, "");

  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === "" || v == null) continue;
    const out = k === "type" && TYPE_REQ_ALIAS[v] ? TYPE_REQ_ALIAS[v] : v;
    search.append(k, String(out));
  }

  // Append `_lang` so Next's URL-keyed fetch cache stays per-locale.
  // Backend ignores unknown query params; the actual locale signal still
  // travels in the Accept-Language header below.
  search.append("_lang", locale);

  const qs = search.toString();
  const url = `${base}${path}?${qs}`;

  try {
    const res = await fetch(url, {
      next: revalidate > 0 ? { revalidate } : { revalidate: 0 },
      headers: {
        "Accept-Language": locale,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Extract the list items from the DRF envelope. Handles every shape the
 * backend has emitted historically: `{result: {results: []}}` (canonical),
 * `{result: []}` (legacy), `{results: []}` (very legacy), or a bare array.
 */
export function unwrapList(data) {
  if (!data) return { items: [], count: 0 };
  const r = data.result ?? data;
  const items = Array.isArray(r) ? r : Array.isArray(r?.results) ? r.results : [];
  const count = typeof r?.count === "number" ? r.count : items.length;
  return { items, count };
}
