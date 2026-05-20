import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";

/**
 * Fetch privacy/usage policies from the backend.
 *
 * Backend: GET /api/v1/base/policies/?type=policy|usage
 * Returns paginated `{ count, results: [{ id, title, description }] }`
 * wrapped in the Kitobzor `{ result: ..., success: true }` envelope.
 *
 * @param {Object} options
 * @param {"policy"|"usage"} [options.type] - Filter by policy kind.
 * @param {number} [options.limit=50]
 */
export async function getPolicies({ type, limit = 50 } = {}) {
  const params = { limit };
  if (type) params.type = type;

  const { data } = await http.get(API_ENDPOINTS.BASE.POLICIES, { params });
  const { result: policies, count, next, previous, raw } = normalizeListResponse(data);
  return { policies, count, next, previous, raw };
}
