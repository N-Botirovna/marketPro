import { useEffect } from "react";

const WATCHED_KEYS = ["auth_token", "refresh_token"];
export const AUTH_CHANGED_EVENT = "kitobzor:auth-changed";

/**
 * useStorageSync — listens for cross-tab localStorage changes on auth keys
 * and dispatches a same-origin custom event so other hooks (useAuth) can
 * re-check their state.
 *
 * Mirrors back-end/bot/fsm/storage.py:41-51's "user-level lock" intent in
 * spirit: a single source of truth across tabs, even though browser tabs
 * don't share JS memory.
 */
export function useStorageSync(onChange) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function handleStorageEvent(event) {
      if (!event.key || !WATCHED_KEYS.includes(event.key)) return;
      const detail = { key: event.key, oldValue: event.oldValue, newValue: event.newValue };
      window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail }));
      onChange?.(detail);
    }

    function handleCustomEvent(event) {
      onChange?.(event.detail);
    }

    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener(AUTH_CHANGED_EVENT, handleCustomEvent);
    return () => {
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleCustomEvent);
    };
  }, [onChange]);
}

/**
 * notifyAuthChange — dispatch the custom event manually after a same-tab
 * logout (the native `storage` event only fires for *other* tabs). Call from
 * useAuth.logout().
 */
export function notifyAuthChange(detail = { key: "auth_token", reason: "manual" }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail }));
}
