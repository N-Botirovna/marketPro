import http from "@/lib/http";
import { AUTH_TOKEN_STORAGE_KEY, API_ENDPOINTS } from "@/config";
import { setItem, getItem, removeItem } from "@/utils/storage";

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

function clearAuthStorage() {
  removeItem(AUTH_TOKEN_STORAGE_KEY);
  removeItem("refresh_token");
  removeItem("token_expires_at");
  removeItem("login_time");
  removeItem("user_data");
}

export async function requestOtp({ phone_number }) {
  const { data } = await http.post(API_ENDPOINTS.AUTH.REQUEST_OTP, { phone_number });
  return {
    success: data?.success || false,
    message: data?.message || null,
  };
}

export async function loginWithPhoneOtp({ phone_number, otp_code }) {
  const { data } = await http.post(API_ENDPOINTS.AUTH.LOGIN, {
    phone_number,
    otp_code,
  });

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

export async function registerUser(payload) {
  const { data } = await http.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  return {
    success: data?.success || false,
    message: data?.message || null,
  };
}

export async function getUserProfile() {
  const { data } = await http.get("api/v1/auth/me");
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
      profileData
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
      { skipAuthRefresh: true }
    );

    if (data?.access_token) {
      saveAccessToken(
        data.access_token,
        data?.expires_in || data?.expires_in_seconds
      );
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

export async function logoutUser() {
  try {
    await http.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch {}
  finally {
    clearAuthStorage();
  }
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
