import http from "@/lib/http";

// Send contact message
export async function sendContactMessage({ phone, message }) {
  const payload = { phone, message };
  const { data } = await http.post("api/v1/base/contact-us", payload);
  return {
    success: data?.success || false,
    message: data?.message || null,
    raw: data,
  };
}
