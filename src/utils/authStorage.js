import { removeItem } from "@/utils/storage";
import { AUTH_TOKEN_STORAGE_KEY } from "@/config";

export function clearAuthStorage() {
  removeItem(AUTH_TOKEN_STORAGE_KEY);
  removeItem("refresh_token");
  removeItem("token_expires_at");
  removeItem("login_time");
  removeItem("user_data");
}
