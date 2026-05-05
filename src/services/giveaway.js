import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";

export async function getActiveGiveaway(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.GIVEAWAY.ACTIVE, { params });
  return {
    giveaway: data ?? null,
    raw: data,
    success: !!data,
  };
}

export async function getGiveaways(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.GIVEAWAY.LIST, { params });
  const { result: giveaways, count, next, previous, raw } = normalizeListResponse(data);
  return { giveaways, count, next, previous, raw };
}

export async function getGiveawayById(id, params = {}) {
  const { data } = await http.get(`${API_ENDPOINTS.GIVEAWAY.DETAIL}/${id}/`, { params });
  return { giveaway: data ?? null, raw: data };
}
