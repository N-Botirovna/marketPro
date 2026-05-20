import http from "@/lib/http";
import { AUTH_TOKEN_STORAGE_KEY, API_ENDPOINTS } from "@/config";
import { setItem, getItem } from "@/utils/storage";
import { clearAuthStorage } from "@/utils/authStorage";
import { withIdempotency } from "@/lib/idempotency";

const devLog = (...args) => {
  if (process.env.NODE_ENV === "development") console.log(...args);
};

function getJwtExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function saveAccessToken(token, expiresIn = 4800) {
  setItem(AUTH_TOKEN_STORAGE_KEY, token);
  setItem("token_expires_at", Date.now() + expiresIn * 1000);
}

export async function loginWithPhoneOtp({ phone_number, otp_code }) {
  const { data } = await http.post(
    API_ENDPOINTS.AUTH.LOGIN,
    {
      phone_number,
      otp_code,
    },
    withIdempotency(),
  );

  const accessToken = data?.access_token;
  const refreshToken = data?.refresh_token;
  const expiresIn = data?.expires_in || data?.expires_in_seconds;

  if (accessToken) {
    saveAccessToken(accessToken, expiresIn);
    setItem("login_time", Date.now());
  }

  if (refreshToken) {
    setItem("refresh_token", refreshToken);
  }

  devLog("🔐 Login successful", {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    expiresIn,
  });

  return {
    access_token: accessToken || null,
    refresh_token: refreshToken || null,
    user: data?.user || null,
    expiresIn: expiresIn || null,
  };
}

/**
 * Code-only login. The bot mints a short-lived 6-digit OTP; the user types
 * it once, no phone number step. Server resolves the user from the active
 * OTP row and returns the same JWT envelope as loginWithPhoneOtp.
 */
export async function loginWithCode(otp_code) {
  const { data } = await http.post(
    API_ENDPOINTS.AUTH.LOGIN_BY_CODE,
    { otp_code },
    withIdempotency(),
  );

  const accessToken = data?.access_token;
  const refreshToken = data?.refresh_token;
  const expiresIn = data?.expires_in || data?.expires_in_seconds;

  if (accessToken) {
    saveAccessToken(accessToken, expiresIn);
    setItem("login_time", Date.now());
  }
  if (refreshToken) {
    setItem("refresh_token", refreshToken);
  }

  return {
    access_token: accessToken || null,
    refresh_token: refreshToken || null,
    user: data?.user || null,
  };
}

export async function getUserProfile() {
  const { data } = await http.get(API_ENDPOINTS.AUTH.ME);
  return { user: data || null };
}

export async function getUserById(userId) {
  if (!userId) throw new Error("userId is required");
  const { data } = await http.get(`${API_ENDPOINTS.AUTH.DETAIL}/${userId}/`);
  return { user: data?.result || data || null };
}

export async function updateUserProfile(profileData) {
  try {
    const { data } = await http.patch(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      profileData,
      withIdempotency(),
    );

    return {
      success: data?.success !== false,
      user: data?.user || data || null,
      message: data?.message || "Profile updated successfully",
    };
  } catch (error) {
    devLog("❌ updateUserProfile error:", error);
    throw error;
  }
}
export function isTokenExpired() {
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!token) return true;

  const expiresAt = getItem("token_expires_at");
  if (expiresAt) return Date.now() >= Number(expiresAt);

  const jwtExp = getJwtExpiry(token);
  return jwtExp ? Date.now() >= jwtExp : false;
}

export function isRefreshTokenExpired() {
  const refreshToken = getItem("refresh_token");
  if (!refreshToken) return true;

  const jwtExp = getJwtExpiry(refreshToken);
  if (jwtExp) return Date.now() >= jwtExp;

  // If no JWT expiry, we rely on the server to reject the token.
  // We check basic existence of login_time but don't enforce a hardcoded 14-day limit.
  const loginTime = getItem("login_time");
  return !loginTime;
}

export async function refreshAccessToken() {
  const refreshToken = getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token");

  devLog("🔄 Refreshing access token");

  try {
    const { data } = await http.post(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken },
      { skipAuthRefresh: true },
    );

    if (data?.access_token) {
      saveAccessToken(data.access_token, data?.expires_in || data?.expires_in_seconds);
    }

    if (data?.refresh_token) {
      setItem("refresh_token", data.refresh_token);
    }

    return {
      access_token: data?.access_token || null,
      refresh_token: data?.refresh_token || refreshToken,
      expiresIn: data?.expires_in || 4800,
    };
  } catch (error) {
    clearAuthStorage();
    throw error;
  }
}

/**
 * Single-use ticket login. Bot mints a ticket bound to a Telegram user and
 * sends a deep-link URL; this exchanges that ticket for a JWT pair and
 * persists it the same way `loginWithPhoneOtp` does. The ticket is one-use
 * (Redis-backed on the server) so a leaked URL can't be replayed.
 */
export async function loginWithTicket(ticket) {
  if (!ticket) throw new Error("ticket is required");
  const { data } = await http.post(
    API_ENDPOINTS.AUTH.TICKET_LOGIN,
    { ticket },
    { skipAuthRefresh: true },
  );

  const accessToken = data?.access_token;
  const refreshToken = data?.refresh_token;
  const expiresIn = data?.expires_in || data?.expires_in_seconds;

  if (accessToken) {
    saveAccessToken(accessToken, expiresIn);
    setItem("login_time", Date.now());
  }
  if (refreshToken) {
    setItem("refresh_token", refreshToken);
  }
  return {
    access_token: accessToken || null,
    refresh_token: refreshToken || null,
    user: data?.user || null,
  };
}

export async function logoutUser() {
  // H-3: tell the backend to blacklist the refresh token before we drop
  // it locally. If the network call fails (offline, server down,
  // already-blacklisted token), we still proceed with the local wipe —
  // the user clicked logout, and the access token is short-lived. We
  // never block logout on the network.
  const refreshToken = getItem("refresh_token");
  if (refreshToken) {
    try {
      await http.post(
        API_ENDPOINTS.AUTH.LOGOUT,
        { refresh_token: refreshToken },
        { skipAuthRefresh: true },
      );
    } catch (error) {
      devLog("Logout API failed; clearing local state anyway:", error);
    }
  }
  clearAuthStorage();
}

export function isAuthenticated() {
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) return true;

  const refreshToken = getItem("refresh_token");
  return !!refreshToken && !isRefreshTokenExpired();
}

export function getAuthToken() {
  return getItem(AUTH_TOKEN_STORAGE_KEY);
}
