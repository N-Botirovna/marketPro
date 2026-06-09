import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAuthToken,
  isTokenExpired,
  isRefreshTokenExpired,
  refreshAccessToken,
  logoutUser,
} from "@/services/auth";
import { getItem } from "@/utils/storage";
import { clearHttpCache } from "@/lib/http";
import { useStorageSync, notifyAuthChange } from "@/hooks/useStorageSync";

const devLog = (...args) => {
  if (process.env.NODE_ENV === "development") console.log(...args);
};

export const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const abortRef = useRef(null);

  const checkAuthStatus = useCallback(async () => {
    // Stand down on the bot auto-login page. It acquires a session from a
    // one-time ticket via AutoLoginClient; if the other useAuth consumers
    // (footer, LocaleSync, cards…) also run here they fire concurrent
    // refreshes — which rotate the refresh token (ROTATE_REFRESH_TOKENS), so
    // the losers get 400 and clearAuthStorage() wipes the tokens the ticket
    // exchange just stored, leaving the user logged out. Let AutoLoginClient
    // own auth here; we re-check normally after its post-login hard reload.
    if (typeof window !== "undefined" && window.location.pathname.includes("/auth/auto")) {
      setIsLoading(false);
      return;
    }

    // Abort any in-flight check before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    // Single logout path — avoids 3 separate logoutUser + setState blocks
    async function doLogout() {
      await logoutUser();
      if (signal.aborted) return;
      setToken(null);
      setIsAuth(false);
    }

    try {
      if (isRefreshTokenExpired()) {
        devLog("⚠️ Refresh token expired, logging out...");
        await doLogout();
        return;
      }

      const currentToken = getAuthToken();

      if (!currentToken) {
        const refreshToken = getItem("refresh_token");
        if (refreshToken && !isRefreshTokenExpired()) {
          devLog("⚠️ No access token, but refresh token exists. Refreshing...");
          try {
            await refreshAccessToken();
            if (signal.aborted) return;
            setToken(getAuthToken());
            setIsAuth(true);
          } catch {
            devLog("❌ Refresh failed, logging out...");
            await doLogout();
          }
        } else {
          if (signal.aborted) return;
          setToken(null);
          setIsAuth(false);
        }
        return;
      }

      if (isTokenExpired()) {
        devLog("⚠️ Access token expired on load, refreshing...");
        try {
          await refreshAccessToken();
          if (signal.aborted) return;
          setToken(getAuthToken());
          setIsAuth(true);
        } catch {
          await doLogout();
        }
      } else {
        if (signal.aborted) return;
        setToken(currentToken);
        setIsAuth(true);
      }
    } catch (error) {
      devLog("Error checking auth status:", error);
      if (signal.aborted) return;
      setToken(null);
      setIsAuth(false);
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    abortRef.current?.abort();
    try {
      await logoutUser();
      clearHttpCache();
      setToken(null);
      setIsAuth(false);
      notifyAuthChange({ key: "auth_token", reason: "logout" });
    } catch (error) {
      devLog("Logout error:", error);
      clearHttpCache();
      notifyAuthChange({ key: "auth_token", reason: "logout-error" });
    }
  }, []);

  // Re-run auth check when another tab logs out (storage event) or the
  // current tab fires a manual notifyAuthChange.
  useStorageSync(
    useCallback(
      (detail) => {
        devLog("🔁 auth storage sync:", detail);
        checkAuthStatus();
      },
      [checkAuthStatus],
    ),
  );

  useEffect(() => {
    checkAuthStatus();
    return () => abortRef.current?.abort();
  }, [checkAuthStatus]);

  return {
    isAuthenticated: isAuth,
    isLoading,
    token,
    logout,
    refreshAuth: checkAuthStatus,
  };
};
