import axios from "axios";
import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from "@/config";
import { getItem, removeItem, setItem } from "@/utils/storage";
import { refreshTokenIfNeeded } from "@/services/auth";

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
  // Proactively refresh token if needed before making request
  await refreshTokenIfNeeded();
  
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
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
  (response) => response,
  async (error) => {
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

        console.log('🔄 Attempting to refresh access token...');
        
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
          
          console.log('✅ Access token refreshed successfully');
          processQueue(null, newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return httpClient(originalRequest);
        } else {
          throw new Error('No new access token received');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
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


