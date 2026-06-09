import { removeItem } from "@/utils/storage";
import { AUTH_TOKEN_STORAGE_KEY } from "@/config";

export function clearAuthStorage() {
  // Guard: the bot auto-login page (`/{locale}/auth/auto`) acquires a session
  // from a one-time ticket. While it's doing that, the header/footer/LocaleSync
  // each mount their own useAuth, see "no token yet", and fire logout →
  // clearAuthStorage, which would wipe the tokens AutoLoginClient just stored
  // (race → user lands unauthenticated). Never clear auth state on that page;
  // let AutoLoginClient own the lifecycle. Normal pages clear as usual.
  if (typeof window !== "undefined" && window.location.pathname.includes("/auth/auto")) {
    return;
  }
  removeItem(AUTH_TOKEN_STORAGE_KEY);
  removeItem("refresh_token");
  removeItem("token_expires_at");
  removeItem("login_time");
  removeItem("user_data");
}
