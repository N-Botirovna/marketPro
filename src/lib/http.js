import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS, AUTH_TOKEN_STORAGE_KEY } from "@/config";
import { getItem, setItem, getCurrentLocale } from "@/utils/storage";
import { clearAuthStorage } from "@/utils/authStorage";
import { serializeParams } from "@/utils/serializeParams";
import { stripLocalePrefix } from "@/utils/nextPath";
import {
  circuit,
  withRetry,
  CircuitOpenError,
  isServerErrorStatus,
  isNetworkError,
} from "@/lib/httpResilience";
import { mapApiError, ERROR_KINDS } from "@/lib/errors";
import {
  lookup as cacheLookup,
  store as cacheStore,
  invalidate as cacheInvalidate,
  rememberPending,
  getPending,
  tryStartSWRRefresh,
  finishSWRRefresh,
} from "@/lib/httpCache";

const isDev = process.env.NODE_ENV === "development";

// Per-endpoint TTL (ms). Match on URL substring — first match wins.
// Ordering matters: more-specific patterns must come before broader ones
// (e.g. `/liked` before `/books` so wishlist isn't cached for 10 min).
const TTL_MAP = [
  // User-specific / mutable — never cache
  ["/auth/", 0],
  ["/orders", 0],
  ["/profile", 0],
  ["/liked", 0],
  ["/like", 0],
  ["/comment", 0],
  ["/my-list", 0],
  // Static-ish content
  ["/regions", 24 * 60 * 60 * 1000], // 24 h — almost never changes
  ["/faqs", 24 * 60 * 60 * 1000], // 24 h
  ["/policies", 24 * 60 * 60 * 1000], // 24 h — admin-curated content
  ["/stories", 2 * 60 * 1000], // 2 min — frequent freshness, expires fast
  ["/categories", 60 * 60 * 1000], // 1 h
  ["/banners", 30 * 60 * 1000], // 30 min
  ["/books", 10 * 60 * 1000], // 10 min
  ["/products", 10 * 60 * 1000], // 10 min
  ["/vendors", 10 * 60 * 1000], // 10 min
  ["/shops", 10 * 60 * 1000], // 10 min
  ["/giveaway", 10 * 60 * 1000], // 10 min
];

const getTTL = (url = "") => {
  for (const [segment, ttl] of TTL_MAP) {
    if (url.includes(segment)) return ttl;
  }
  return 5 * 60 * 1000; // default 5 min
};

// Last 12 chars of token as an opaque auth discriminator.
const authSuffix = (token) => (token ? token.slice(-12) : "anon");

const buildCacheKey = (url, params, locale, token) =>
  `${url}?${serializeParams(params)}::${locale}::${authSuffix(token)}`;

/**
 * Drop cached responses.
 *
 *   clearHttpCache()             — flush everything (logout, locale switch)
 *   clearHttpCache("/books/")    — drop just keys whose URL includes
 *                                  the substring (mutation invalidation)
 *
 * Always reach for the prefix variant after a successful POST/PATCH/DELETE
 * so the next GET sees fresh data. The old signature ignored its argument
 * and flushed everything — see services/shop.js for callers.
 */
export const clearHttpCache = (prefix) => {
  cacheInvalidate(prefix);
};

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 20000,
});

// H-18: ID per request so logs across FE → BE → bot can be correlated.
// crypto.randomUUID is available in every modern browser and Node 19+;
// fall back to Math.random where it isn't (shouldn't be reachable on
// any deploy target we support, but keep the safety net).
function _genRequestId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID().replace(/-/g, "");
    }
  } catch {
    /* fall through */
  }
  return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

httpClient.interceptors.request.use(async (config) => {
  // Circuit breaker — short-circuit before hitting network
  if (!circuit.canPass()) {
    throw new CircuitOpenError(circuit.snapshot());
  }

  const currentLocale = getCurrentLocale() || "uz";
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers = config.headers || {};
  config.headers["Accept-Language"] = currentLocale;
  // Caller may pre-set X-Request-ID (e.g. retried requests from a
  // higher-level flow that wants every retry tagged with the same id);
  // otherwise mint one per request.
  if (!config.headers["X-Request-ID"] && !config.headers["x-request-id"]) {
    config.headers["X-Request-ID"] = _genRequestId();
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  // Only cache GET requests with TTL > 0
  if (config.method === "get") {
    const ttl = getTTL(config.url);

    if (ttl === 0) return config;

    const cacheKey = buildCacheKey(config.url, config.params, currentLocale, token);
    const result = cacheLookup(cacheKey, ttl);

    if (result.hit && !result.stale) {
      if (isDev) console.log("📦 cache hit:", config.url);
      config.adapter = () =>
        Promise.resolve({
          data: result.data,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          request: {},
        });
      return config;
    }

    if (result.hit && result.stale && result.swr) {
      // Stale-while-revalidate: serve cached data instantly AND fire a
      // background refresh so the user sees fresh data on next interaction.
      // Guard against parallel SWR refreshes for the same key (stampede).
      if (isDev) console.log("📦 SWR stale-hit:", config.url);
      if (tryStartSWRRefresh(cacheKey)) {
        // Build a clean clone of the config so we don't recurse into the
        // adapter we're about to short-circuit. _swrBackground tells the
        // response handler to write through to cache without fanning out
        // to the original caller (which has already received stale data).
        const bgConfig = {
          ...config,
          adapter: undefined,
          _swrBackground: true,
          _cacheKey: cacheKey,
          _cacheTTL: ttl,
        };
        httpClient(bgConfig)
          .catch(() => {
            /* network blip — keep the stale data, retry on next access */
          })
          .finally(() => finishSWRRefresh(cacheKey));
      }
      config.adapter = () =>
        Promise.resolve({
          data: result.data,
          status: 200,
          statusText: "OK",
          headers: { "x-cache": "STALE" },
          config,
          request: {},
        });
      return config;
    }

    const pendingPromise = getPending(cacheKey);
    if (pendingPromise) {
      if (isDev) console.log("🔄 dedup:", config.url);
      config.adapter = () => pendingPromise;
      return config;
    }

    config._cacheKey = cacheKey;
    config._cacheTTL = ttl;

    let requestResolve, requestReject;
    const sharedPromise = new Promise((resolve, reject) => {
      requestResolve = resolve;
      requestReject = reject;
    });
    rememberPending(cacheKey, sharedPromise);
    config._sharedPromiseResolve = requestResolve;
    config._sharedPromiseReject = requestReject;
  }

  return config;
});

// ---- Refresh queue ----------------------------------------------------------

const REFRESH_TIMEOUT_MS = 8000;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

function refreshWithTimeout(refreshToken) {
  const refreshCall = axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
    refresh_token: refreshToken,
  });
  const timeout = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Token refresh timed out after ${REFRESH_TIMEOUT_MS}ms`)),
      REFRESH_TIMEOUT_MS,
    );
  });
  return Promise.race([refreshCall, timeout]);
}

function buildLoginRedirectUrl(locale) {
  if (typeof window === "undefined") return `/${locale}/login`;
  const raw = window.location.pathname + window.location.search;
  // Only same-origin paths are valid
  if (!raw.startsWith("/")) return `/${locale}/login`;
  // Don't loop on the login page itself
  if (raw.startsWith(`/${locale}/login`)) return `/${locale}/login`;
  // `next` must be locale-LESS — the login page feeds it to the locale-aware
  // router, which re-adds the locale. Passing "/uz" here would land the user
  // on "/uz/uz" (404) after sign-in.
  const nextPath = stripLocalePrefix(raw);
  return `/${locale}/login?next=${encodeURIComponent(nextPath)}`;
}

// ---- Response interceptor ---------------------------------------------------

httpClient.interceptors.response.use(
  (response) => {
    circuit.recordSuccess();

    if (response.config.method === "get" && response.config._cacheKey) {
      const cacheKey = response.config._cacheKey;
      cacheStore(cacheKey, response.data);
      response.config._sharedPromiseResolve?.(response);
    }

    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const serverError = isServerErrorStatus(status);
    const networkErr = isNetworkError(error);

    if (serverError || networkErr) {
      circuit.recordFailure(true);
    }

    if (isDev) {
      console.log("❌ HTTP Error:", {
        status,
        url: error?.config?.url,
        message: error?.message,
      });
    }

    if (error?.config?.method === "get" && error.config._cacheKey) {
      error.config._sharedPromiseReject?.(error);
    }

    const originalRequest = error.config || {};

    // ---- Anonymous mutation → ask the user to sign in inline -------------
    // Backend returns 401 (IsAuthenticatedOrReadOnly) for mutations from
    // anonymous callers. Instead of bouncing them to /login, raise a custom
    // event so a global modal can offer the bot deep-link + inline OTP form.
    // We only fire when the user truly has no session (no tokens) to avoid
    // stealing the regular refresh flow.
    {
      const reqMethod = (originalRequest.method || "get").toLowerCase();
      const isMutation = ["post", "put", "patch", "delete"].includes(reqMethod);
      const respStatus = error?.response?.status;
      const hasAuthToken = typeof window !== "undefined" && !!getItem(AUTH_TOKEN_STORAGE_KEY);
      const hasRefreshToken = typeof window !== "undefined" && !!getItem("refresh_token");
      if (
        (respStatus === 401 || respStatus === 403) &&
        isMutation &&
        !hasAuthToken &&
        !hasRefreshToken &&
        !originalRequest._skipAuthRequiredModal &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(
          new CustomEvent("auth:required", {
            detail: { url: originalRequest.url, method: reqMethod },
            // Caller could replay the original request, but mutation payloads
            // (FormData, idempotency keys, files) make auto-replay brittle.
            // We deliberately ask the user to redo the action manually.
          }),
        );
      }
    }

    // ---- 401 token refresh -------------------------------------------------
    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await refreshWithTimeout(refreshToken);

        const newAccessToken = response.data?.access_token;
        const newRefreshToken = response.data?.refresh_token;
        const expiresIn = response.data?.expires_in || response.data?.expires_in_seconds || 4800;

        if (!newAccessToken) throw new Error("No new access token received");

        setItem(AUTH_TOKEN_STORAGE_KEY, newAccessToken);
        httpClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        setItem("token_expires_at", Date.now() + expiresIn * 1000);
        if (newRefreshToken) setItem("refresh_token", newRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        if (isDev) console.error("❌ Token refresh failed:", refreshError.message);
        processQueue(refreshError, null);
        clearHttpCache();
        clearAuthStorage();
        delete httpClient.defaults.headers.common["Authorization"];

        if (typeof window !== "undefined") {
          const locale = getCurrentLocale() || "uz";
          window.location.href = buildLoginRedirectUrl(locale);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ---- Retry idempotent GETs on 5xx / network ---------------------------
    const method = (originalRequest.method || "get").toLowerCase();
    const idempotentMethod = method === "get" || method === "head" || method === "options";
    const hasIdempotencyKey = Boolean(originalRequest.headers?.["Idempotency-Key"]);
    const canRetry = (idempotentMethod || hasIdempotencyKey) && (serverError || networkErr);

    if (canRetry && !originalRequest._resilienceRetried) {
      originalRequest._resilienceRetried = true;
      try {
        // withRetry runs the function up to N+1 times. We've already burned
        // attempt #1; remaining = 2 by default.
        return await withRetry(() => httpClient(originalRequest), { retries: 2, baseDelayMs: 500 });
      } catch (retryError) {
        return Promise.reject(attachNormalized(retryError));
      }
    }

    return Promise.reject(attachNormalized(error));
  },
);

function attachNormalized(error) {
  if (error?.normalized) return error;
  try {
    error.normalized = mapApiError(error);
  } catch {
    error.normalized = {
      kind: ERROR_KINDS.UNKNOWN,
      status: error?.response?.status || 0,
      message: error?.message || "Unexpected error occurred",
      fieldErrors: {},
    };
  }
  return error;
}

export default httpClient;
