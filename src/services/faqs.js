import http from "@/lib/http";

// Get FAQs
export async function getFaqs(params = {}) {
  const { data } = await http.get("api/v1/base/faqs", { params });
  return {
    faqs: data?.results || [],
    count: data?.count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    raw: data,
  };
}

// Get single FAQ by ID
export async function getFaqById(id) {
  const { data } = await http.get(`api/v1/base/faqs/${id}/`);
  return {
    faq: data || null,
    raw: data,
  };
}
