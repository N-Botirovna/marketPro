/**
 * Normalize list responses from the kitobzor API.
 * Handles both `result` and `results` API response shapes.
 */
export function normalizeListResponse(data) {
  const inner = data?.result ?? data;
  const result = Array.isArray(inner)
    ? inner
    : Array.isArray(inner?.results)
    ? inner.results
    : [];
  const meta = Array.isArray(data?.result) ? data : (data?.result ?? data);
  return {
    result,
    count: meta?.count ?? result.length,
    next: meta?.next ?? null,
    previous: meta?.previous ?? null,
    success: data?.success === true,
    raw: data,
  };
}

/**
 * Extract a single item from API responses that may wrap in `result`.
 */
export function normalizeItem(data) {
  return data?.result ?? data ?? null;
}
