import http from "@/lib/http";
import { AUTH_TOKEN_STORAGE_KEY } from "@/config";
import { setItem } from "@/utils/storage";

export async function loginWithPhoneOtp({ phone_number, otp_code }) {
  const payload = { phone_number, otp_code };
  const { data } = await http.post("api/v1/auth/login", payload);
  if (data?.token) {
    setItem(AUTH_TOKEN_STORAGE_KEY, data.token);
  }
  return {
    token: data?.token || null,
    user: data?.user || null,
    raw: data,
  };
}


