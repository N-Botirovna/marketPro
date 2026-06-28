import http from "@/lib/http";
import { AUTH_TOKEN_STORAGE_KEY, API_ENDPOINTS, COOKIE_REFRESH } from "@/config";
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

/**
 * Code-only login — the single canonical sign-in path. The bot mints a
 * short-lived 6-digit OTP; the user types it once, no phone number step.
 * Server resolves the user from the active OTP row and returns the JWT
 * envelope. (The legacy phone+OTP `loginWithPhoneOtp` was removed — every
 * surface now uses this code-only flow.)
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
  // C-4: in cookie mode the refresh token arrives via an HttpOnly Set-Cookie,
  // so we never persist it in JS-readable storage. Body mode keeps the old path.
  if (refreshToken && !COOKIE_REFRESH) {
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

/**
 * "Does the user have a refresh session?" — the single oracle both useAuth and
 * the http.js anonymous-mutation guard must use. In cookie mode the refresh
 * token is HttpOnly (invisible to JS), so we fall back to the `login_time`
 * marker (set on login, cleared on logout). In body mode we check the
 * JS-readable refresh token directly. Without this helper, callers that read
 * `getItem("refresh_token")` see `null` in cookie mode and wrongly treat a
 * valid session as logged-out (FE-H1/H3).
 */
export function hasRefreshSession() {
  if (COOKIE_REFRESH) return !!getItem("login_time");
  return !!getItem("refresh_token");
}

export function isRefreshTokenExpired() {
  // Cookie mode: the refresh token is HttpOnly — JS can't read it to inspect
  // its `exp`. Treat it as "maybe valid" and let the server be the authority:
  // a refresh attempt either succeeds or returns 401, which the 401 handler /
  // ProtectedRoute already turn into a login redirect.
  if (COOKIE_REFRESH) return false;

  const refreshToken = getItem("refresh_token");
  if (!refreshToken) return true;

  const jwtExp = getJwtExpiry(refreshToken);
  if (jwtExp) return Date.now() >= jwtExp;

  // If no JWT expiry, we rely on the server to reject the token.
  // We check basic existence of login_time but don't enforce a hardcoded 14-day limit.
  const loginTime = getItem("login_time");
  return !loginTime;
}

// Shared in-flight refresh. Many useAuth consumers (header, footer, LocaleSync,
// and one per BookCard…) can hit a stale access token in the same tick. Without
// a shared promise they stampede POST /auth/refresh — dozens of calls in one
// second — which trips the auth-zone rate limit (429) AND, because the backend
// rotates+blacklists refresh tokens (ROTATE_REFRESH_TOKENS), every loser gets
// 400/401 → clearAuthStorage() → the user is logged out moments after logging
// in. Collapsing concurrent callers onto one refresh removes the storm.
let _refreshPromise = null;

export function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = _doRefreshAccessToken().finally(() => {
    _refreshPromise = null;
  });
  return _refreshPromise;
}

async function _doRefreshAccessToken() {
  // Cookie mode: the HttpOnly `kz_refresh` cookie authenticates the refresh —
  // there's no JS-readable refresh token to gate on or send. Body mode keeps
  // reading/sending it from localStorage.
  const refreshToken = COOKIE_REFRESH ? null : getItem("refresh_token");
  if (!COOKIE_REFRESH && !refreshToken) throw new Error("No refresh token");

  devLog("🔄 Refreshing access token");

  try {
    const { data } = await http.post(
      API_ENDPOINTS.AUTH.REFRESH,
      COOKIE_REFRESH ? {} : { refresh_token: refreshToken },
      { skipAuthRefresh: true },
    );

    if (data?.access_token) {
      saveAccessToken(data.access_token, data?.expires_in || data?.expires_in_seconds);
    }

    if (data?.refresh_token && !COOKIE_REFRESH) {
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
  // C-4: in cookie mode the refresh token arrives via an HttpOnly Set-Cookie,
  // so we never persist it in JS-readable storage. Body mode keeps the old path.
  if (refreshToken && !COOKIE_REFRESH) {
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
  //
  // FE-H2: in cookie mode there's no JS-readable refresh token to gate on —
  // the HttpOnly cookie authenticates the logout call — so we must ALWAYS hit
  // the endpoint (with an empty body) to blacklist the cookie server-side and
  // let the backend clear it. Gating on getItem("refresh_token") here (always
  // null in cookie mode) silently skipped blacklisting, leaving a stolen
  // refresh cookie replayable after the user "logged out".
  const refreshToken = COOKIE_REFRESH ? null : getItem("refresh_token");
  if (COOKIE_REFRESH || refreshToken) {
    try {
      await http.post(
        API_ENDPOINTS.AUTH.LOGOUT,
        COOKIE_REFRESH ? {} : { refresh_token: refreshToken },
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

  // Cookie mode: the refresh token is invisible to JS, so use `login_time`
  // (set on login, cleared on logout) as an optimistic "has a session" marker.
  // The server validates it on the next request / refresh.
  if (COOKIE_REFRESH) return !!getItem("login_time");

  const refreshToken = getItem("refresh_token");
  return !!refreshToken && !isRefreshTokenExpired();
}

export function getAuthToken() {
  return getItem(AUTH_TOKEN_STORAGE_KEY);
}
