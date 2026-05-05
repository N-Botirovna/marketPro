import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

export async function getShopDetails(id) {
  if (!id) throw new Error("shop id is required");
  const { data } = await http.get(`${API_ENDPOINTS.SHOPS.DETAIL}/${id}/`);
  return data;
}
