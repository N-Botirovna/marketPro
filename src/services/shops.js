import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";

export async function getShops(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  const { data } = await http.get(API_ENDPOINTS.SHOPS.LIST, { params: cleanParams });
  const { result: shops, count, next, previous, raw } = normalizeListResponse(data);
  return { shops, count, next, previous, raw };
}

export async function getShopById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.SHOPS.DETAIL}/${id}/`);
  return { shop: data ?? null, raw: data };
}

export async function getHomePageShops(limit = 8) {
  return await getShops({ is_active: true, limit });
}

export async function getShopsByRegion(regionId, limit = 12) {
  return await getShops({ region: regionId, is_active: true, limit });
}

export async function getShopsByDistrict(districtId, limit = 12) {
  return await getShops({ district: districtId, is_active: true, limit });
}

export async function searchShops(query, params = {}) {
  return await getShops({ q: query, is_active: true, ...params });
}

export async function getShopsByRating(minStar, maxStar, limit = 12) {
  return await getShops({ star_min: minStar, star_max: maxStar, is_active: true, limit });
}

export async function getShopsByOwner(ownerId, limit = 12) {
  return await getShops({ owner: ownerId, is_active: true, limit });
}
