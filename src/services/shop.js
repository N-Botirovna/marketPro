import http from "@/lib/http";

export async function getShopDetails(id) {
  if (!id) throw new Error("shop id is required");
  const { data } = await http.get(`api/v1/shop/${id}/`);
  return data;
}







