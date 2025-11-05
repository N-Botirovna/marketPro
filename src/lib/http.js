import axios from "axios";
import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from "@/config";
import { getItem, removeItem, setItem, getCurrentLocale } from "@/utils/storage";
import { refreshTokenIfNeeded } from "@/services/auth";

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const pendingRequests = new Map();

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
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 HTTP Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
    });
  }

  // Cache GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.url}?${JSON.stringify(config.params)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
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
      config.adapter = () => pendingRequests.get(cacheKey);
      return config;
    }
  }
  
  // Skip token refresh for refresh endpoint to prevent infinite loop
  if (!config.skipAuthRefresh) {
    await refreshTokenIfNeeded();
  }
  
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Attach locale header
  const locale = getCurrentLocale() || 'uz';
  config.headers = config.headers || {};
  config.headers['Accept-Language'] = locale;

  // If data is FormData, remove Content-Type to let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

httpClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ HTTP Response:', {
        status: response.status,
        url: response.config.url,
      });
    }

    // Cache GET responses
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params)}`;
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      pendingRequests.delete(cacheKey);
    }

    return response;
  },
  async (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ HTTP Error:', {
        status: error?.response?.status,
        url: error?.config?.url,
        message: error?.message,
      });
    }

    // Clear pending request on error
    if (error?.config?.method === 'get') {
      const cacheKey = `${error.config.url}?${JSON.stringify(error.config.params)}`;
      pendingRequests.delete(cacheKey);
    }

    const originalRequest = error.config;

    // Handle 401 Unauthorized with token refresh
    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Attempting to refresh access token...');
        }
        
        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}api/v1/auth/refresh`, {
          refresh_token: refreshToken
        });

        const newAccessToken = response.data?.access_token;
        const newRefreshToken = response.data?.refresh_token;
        
        if (newAccessToken) {
          setItem(AUTH_TOKEN_STORAGE_KEY, newAccessToken);
          httpClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Update refresh token if new one provided
          if (newRefreshToken) {
            setItem('refresh_token', newRefreshToken);
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Access token refreshed successfully');
          }
          processQueue(null, newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return httpClient(originalRequest);
        } else {
          throw new Error('No new access token received');
        }
      } catch (refreshError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Token refresh failed:', refreshError);
        }
        processQueue(refreshError, null);
        
        // Clear tokens and redirect to login
        removeItem(AUTH_TOKEN_STORAGE_KEY);
        removeItem('refresh_token');
        delete httpClient.defaults.headers.common['Authorization'];
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const normalized = {
      status: error?.response?.status,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Unexpected error occurred",
      data: error?.response?.data,
    };
    return Promise.reject({ ...error, normalized });
  }
);

export default httpClient;


