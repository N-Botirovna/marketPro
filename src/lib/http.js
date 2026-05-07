import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS, AUTH_TOKEN_STORAGE_KEY } from "@/config";
import { getItem, setItem, getCurrentLocale } from "@/utils/storage";
import { clearAuthStorage } from "@/utils/authStorage";
import { serializeParams } from "@/utils/serializeParams";

const isDev = process.env.NODE_ENV === 'development';

// Per-endpoint TTL (ms). Match on URL substring — first match wins.
const TTL_MAP = [
  ['/regions',    24 * 60 * 60 * 1000], // 24 h — almost never changes
  ['/faqs',       24 * 60 * 60 * 1000], // 24 h
  ['/categories', 60 * 60 * 1000],       // 1 h
  ['/banners',    30 * 60 * 1000],        // 30 min
  ['/books',      10 * 60 * 1000],        // 10 min
  ['/products',   10 * 60 * 1000],        // 10 min
  ['/vendors',    10 * 60 * 1000],        // 10 min
  ['/shops',      10 * 60 * 1000],        // 10 min
  ['/giveaway',   10 * 60 * 1000],        // 10 min
  // User-specific / mutable — never cache
  ['/auth/',      0],
  ['/orders',     0],
  ['/profile',    0],
  ['/liked',      0],
  ['/like',       0],
  ['/comment',    0],
];

const getTTL = (url = '') => {
  for (const [segment, ttl] of TTL_MAP) {
    if (url.includes(segment)) return ttl;
  }
  return 5 * 60 * 1000; // default 5 min
};

// Last 12 chars of token as an opaque auth discriminator.
// Prevents cross-user cache hits without storing the full token.
const authSuffix = (token) => (token ? token.slice(-12) : 'anon');

const buildCacheKey = (url, params, locale, token) =>
  `${url}?${serializeParams(params)}::${locale}::${authSuffix(token)}`;

const cache = new Map();
const pendingRequests = new Map();

export const clearHttpCache = () => {
  cache.clear();
  pendingRequests.clear();
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

httpClient.interceptors.request.use(async (config) => {
  const currentLocale = getCurrentLocale() || 'uz';
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers = config.headers || {};
  config.headers['Accept-Language'] = currentLocale;

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Only cache GET requests with TTL > 0
  if (config.method === 'get') {
    const ttl = getTTL(config.url);

    if (ttl === 0) return config; // skip cache for user-specific/mutable endpoints

    const cacheKey = buildCacheKey(config.url, config.params, currentLocale, token);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      if (isDev) console.log('📦 cache hit:', config.url);
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      });
      return config;
    }

    // Request deduplication
    if (pendingRequests.has(cacheKey)) {
      if (isDev) console.log('🔄 dedup:', config.url);
      config.adapter = () => pendingRequests.get(cacheKey);
      return config;
    }

    config._cacheKey = cacheKey;
    config._cacheTTL = ttl;

    let requestResolve, requestReject;
    const sharedPromise = new Promise((resolve, reject) => {
      requestResolve = resolve;
      requestReject = reject;
    });
    pendingRequests.set(cacheKey, sharedPromise);
    config._sharedPromiseResolve = requestResolve;
    config._sharedPromiseReject = requestReject;
  }

  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

httpClient.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && response.config._cacheKey) {
      const cacheKey = response.config._cacheKey;

      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });

      response.config._sharedPromiseResolve?.(response);
      pendingRequests.delete(cacheKey);
    }

    return response;
  },
  async (error) => {
    if (isDev) {
      console.log('❌ HTTP Error:', {
        status: error?.response?.status,
        url: error?.config?.url,
        message: error?.message,
      });
    }

    if (error?.config?.method === 'get' && error.config._cacheKey) {
      error.config._sharedPromiseReject?.(error);
      pendingRequests.delete(error.config._cacheKey);
    }

    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refresh_token: refreshToken }
        );

        const newAccessToken = response.data?.access_token;
        const newRefreshToken = response.data?.refresh_token;
        const expiresIn = response.data?.expires_in || response.data?.expires_in_seconds || 4800;

        if (!newAccessToken) throw new Error('No new access token received');

        setItem(AUTH_TOKEN_STORAGE_KEY, newAccessToken);
        httpClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        setItem('token_expires_at', Date.now() + expiresIn * 1000);
        if (newRefreshToken) setItem('refresh_token', newRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        if (isDev) console.error('❌ Token refresh failed:', refreshError.message);
        processQueue(refreshError, null);
        clearHttpCache();
        clearAuthStorage();
        delete httpClient.defaults.headers.common['Authorization'];

        if (typeof window !== 'undefined') {
          const locale = getCurrentLocale() || 'uz';
          window.location.href = `/${locale}/login`;
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject({
      ...error,
      normalized: {
        status: error?.response?.status,
        message: error?.response?.data?.message || error?.message || 'Unexpected error occurred',
        data: error?.response?.data,
      },
    });
  }
);

export default httpClient;
