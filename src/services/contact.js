import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { withIdempotency } from "@/lib/idempotency";

export async function sendContactMessage({ phone, message }) {
  const { data } = await http.post(
    API_ENDPOINTS.BASE.CONTACT,
    { phone, message },
    withIdempotency(),
  );
  return {
    success: data?.success === true,
    message: data?.message ?? null,
    raw: data,
  };
}
