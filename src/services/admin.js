import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeItem } from "@/utils/normalizeResponse";

// CEO/Founder dashboard reads. Each endpoint returns the standard envelope
// `{ result: {...}, success: true }`; `normalizeItem` unwraps `result`.
// The backend enforces staff access (IsAdminUser) — these calls 403 for
// non-staff, which the /admin route-gate prevents from ever firing.

async function getSection(url, { days, limit, signal } = {}) {
  const params = {};
  if (days) params.days = days;
  if (limit) params.limit = limit;
  const { data } = await http.get(url, { params, signal });
  return normalizeItem(data);
}

export function fetchSummary(opts) {
  return getSection(API_ENDPOINTS.ADMIN.SUMMARY, opts);
}

export function fetchFunnel(opts) {
  return getSection(API_ENDPOINTS.ADMIN.FUNNEL, opts);
}

export function fetchDemand(opts) {
  return getSection(API_ENDPOINTS.ADMIN.DEMAND, opts);
}

export function fetchSupply(opts) {
  return getSection(API_ENDPOINTS.ADMIN.SUPPLY, opts);
}
