/**
 * Normalize list responses from the kitobzor API.
 * Handles both `result` and `results` API response shapes.
 */
export function normalizeListResponse(data) {
  const raw = data?.result ?? data?.results ?? null;
  const result = Array.isArray(raw) ? raw : [];
  return {
    result,
    count: data?.count ?? result.length,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
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
