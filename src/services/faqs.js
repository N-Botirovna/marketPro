import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";

export async function getFaqs(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  const { data } = await http.get(API_ENDPOINTS.BASE.FAQS, { params: cleanParams });
  const { result: faqs, count, next, previous, raw } = normalizeListResponse(data);
  return { faqs, count, next, previous, raw };
}

export async function getFaqById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.BASE.FAQS}${id}/`);
  return { faq: data ?? null, raw: data };
}
