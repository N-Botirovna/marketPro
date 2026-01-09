import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS, AUTH_TOKEN_STORAGE_KEY } from "@/config";
import { getItem, removeItem, setItem, getCurrentLocale } from "@/utils/storage";


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

  // Determine locale early for cache key and headers
  const currentLocale = getCurrentLocale() || 'uz';

  // Cache GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.url}?${JSON.stringify(config.params)}::${currentLocale}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 Using cached response for:', config.url);
      }
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

    // Request deduplication - if same request is already pending, return that promise
    if (pendingRequests.has(cacheKey)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 HTTP: Deduplicating request for:', config.url);
      }
      const pendingPromise = pendingRequests.get(cacheKey);
      // Use adapter to return the pending promise instead of making a new request
      config.adapter = () => pendingPromise;
      return config;
    }
    
    // Store cache key for cleanup in response interceptor
    config._cacheKey = cacheKey;
    
    // Create a promise that will be resolved when the actual request completes
    // This promise will be shared with duplicate requests
    let requestResolve;
    let requestReject;
    const sharedPromise = new Promise((resolve, reject) => {
      requestResolve = resolve;
      requestReject = reject;
    });
    
    // Store the promise so duplicate requests can use it
    pendingRequests.set(cacheKey, sharedPromise);
    
    // Mark that we need to resolve the shared promise in response interceptor
    // We'll let axios use its default adapter and resolve in response interceptor
    config._sharedPromiseResolve = requestResolve;
    config._sharedPromiseReject = requestReject;
  }
  
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Attach locale header
  config.headers = config.headers || {};
  config.headers['Accept-Language'] = currentLocale;

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

    // Cache GET responses and clean up pending requests
    if (response.config.method === 'get') {
      const cacheKey = response.config._cacheKey || 
        `${response.config.url}?${JSON.stringify(response.config.params)}::${getCurrentLocale() || 'uz'}`;
      
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
      
      // Resolve shared promise if it exists (for deduplication)
      if (response.config._sharedPromiseResolve) {
        response.config._sharedPromiseResolve(response);
      }
      
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
      const cacheKey = error.config._cacheKey || 
        `${error.config.url}?${JSON.stringify(error.config.params)}::${getCurrentLocale() || 'uz'}`;
      
      // Reject shared promise if it exists (for deduplication)
      if (error.config._sharedPromiseReject) {
        error.config._sharedPromiseReject(error);
      }
      
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
        // Using string template to ensure we match the config path
        // API_ENDPOINTS.AUTH.REFRESH is "api/v1/auth/refresh/"
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
          refresh_token: refreshToken
        });

        const newAccessToken = response.data?.access_token;
        const newRefreshToken = response.data?.refresh_token;
        const expiresIn = response.data?.expires_in || response.data?.expires_in_seconds || 4800;
        
        if (newAccessToken) {
          setItem(AUTH_TOKEN_STORAGE_KEY, newAccessToken);
          httpClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Update token expiration time
          const tokenExpiry = expiresIn || 4800;
          const expirationTime = Date.now() + (tokenExpiry * 1000);
          setItem('token_expires_at', expirationTime);
          
          // Update refresh token if new one provided
          if (newRefreshToken) {
            setItem('refresh_token', newRefreshToken);
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Access token refreshed successfully', {
              expiresIn: `${tokenExpiry}s`,
              expiresAt: new Date(expirationTime).toLocaleString()
            });
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
          console.error('❌ Token refresh failed. Logging out...', {
            message: refreshError.message,
            response: refreshError.response?.data,
            status: refreshError.response?.status
          });
        }
        processQueue(refreshError, null);
        
        // Clear tokens and redirect to login
        removeItem(AUTH_TOKEN_STORAGE_KEY);
        removeItem('refresh_token');
        removeItem('token_expires_at');
        removeItem('login_time');
        delete httpClient.defaults.headers.common['Authorization'];
        
        // Redirect to login with locale
        if (typeof window !== 'undefined') {
          const currentLocale = getCurrentLocale() || 'uz';
          window.location.href = `/${currentLocale}/login`;
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


