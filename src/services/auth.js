import http from "@/lib/http";
import { AUTH_TOKEN_STORAGE_KEY, API_ENDPOINTS } from "@/config";
import { setItem, getItem, removeItem } from "@/utils/storage";

// Request OTP code
export async function requestOtp({ phone_number }) {
  const payload = { phone_number };
  const { data } = await http.post(API_ENDPOINTS.AUTH.REQUEST_OTP, payload);
  return {
    success: data?.success || false,
    message: data?.message || null,
    raw: data,
  };
}

// Login with phone and OTP
export async function loginWithPhoneOtp({ phone_number, otp_code }) {
  const payload = { phone_number, otp_code };
  const { data } = await http.post(API_ENDPOINTS.AUTH.LOGIN, payload);
  
  // Handle new token format: access_token and refresh_token
  const accessToken = data?.access_token;
  const refreshToken = data?.refresh_token;
  const expiresIn = data?.expires_in || data?.expires_in_seconds;
  
  if (accessToken) {
    // Store access_token in localStorage
    setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
    
    // Store token expiration time
    const tokenExpiry = expiresIn || 4800; // Default to 1h 20m if not provided
    const expirationTime = Date.now() + (tokenExpiry * 1000);
    setItem('token_expires_at', expirationTime);
    
    // Store login time for refresh token validation
    setItem('login_time', Date.now());
  }
  
  // Store refresh_token in localStorage
  if (refreshToken) {
    setItem('refresh_token', refreshToken);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Login successful:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      expiresIn: expiresIn ? `${expiresIn}s` : 'unknown'
    });
  }
  
  return {
    access_token: accessToken || null,
    refresh_token: refreshToken || null,
    user: data?.user || null,
    expiresIn: expiresIn || null,
    raw: data,
  };
}

// Register new user
export async function registerUser({ phone_number, name, email }) {
  const payload = { phone_number, name, email };
  const { data } = await http.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  return {
    success: data?.success || false,
    message: data?.message || null,
    raw: data,
  };
}

// Get user profile
export async function getUserProfile() {
  const { data } = await http.get('api/v1/auth/me');
  return {
    user: data || null,
    raw: data,
  };
}

// Update user profile
export async function updateUserProfile(profileData) {
  console.log('🚀 updateUserProfile called with:', profileData);
  console.log('🎯 Making PATCH request to:', API_ENDPOINTS.AUTH.UPDATE_PROFILE);
  console.log('🌐 Full URL will be:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kitobzor.uz/'}${API_ENDPOINTS.AUTH.UPDATE_PROFILE}`);
  
  try {
    const { data } = await http.patch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
    
    console.log('📨 API Response data:', data);
    console.log('✅ PATCH request successful!');
    
    return {
      success: data?.success !== false,
      user: data?.user || data || null,
      message: data?.message || 'Profile updated successfully',
      raw: data,
    };
  } catch (error) {
    console.error('❌ PATCH request failed:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
}

// Check if token is expired
export function isTokenExpired() {
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!token) {
    return true; // No token means expired
  }
  
  const expirationTime = getItem('token_expires_at');
  if (!expirationTime) {
    // If no expiration time, try to decode JWT token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        const expiry = payload.exp * 1000; // Convert to milliseconds
        return Date.now() >= expiry;
      }
    } catch (e) {
      // If can't decode, assume not expired
      return false;
    }
    return false;
  }
  
  const now = Date.now();
  const expiresAt = parseInt(expirationTime, 10);
  
  // Token is expired if current time is past expiration
  return now >= expiresAt;
}

// Global flag to prevent infinite refresh loop
let isCurrentlyRefreshing = false;
let refreshPromise = null;

// Check if token needs refresh (only when expired or about to expire)
export function shouldRefreshToken() {
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  const refreshToken = getItem('refresh_token');
  
  // Don't refresh if no tokens exist
  if (!token || !refreshToken) {
    return false;
  }
  
  // Only refresh if token is actually expired or about to expire in 1 minute
  const expirationTime = getItem('token_expires_at');
  if (!expirationTime) {
    return false;
  }
  
  const now = Date.now();
  const expiresAt = parseInt(expirationTime, 10);
  
  // Refresh only if token expires within the next 1 minute
  const refreshBuffer = 1 * 60 * 1000; // 1 minute
  return now >= (expiresAt - refreshBuffer);
}

// Proactive token refresh (single instance)
export async function refreshTokenIfNeeded() {
  // Return existing promise if already refreshing
  if (isCurrentlyRefreshing && refreshPromise) {
    return refreshPromise;
  }
  
  // Don't refresh if no access token exists
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!token) {
    return true;
  }
  
  // Don't refresh if not needed
  if (!shouldRefreshToken()) {
    return true;
  }
  
  try {
    isCurrentlyRefreshing = true;
    
    refreshPromise = (async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Token refresh needed, refreshing...');
      }
      await refreshAccessToken();
      return true;
    })();
    
    return await refreshPromise;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Token refresh failed:', error);
    }
    return false;
  } finally {
    isCurrentlyRefreshing = false;
    refreshPromise = null;
  }
}

// Logout user
export async function logoutUser() {
  try {
    await http.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Logout error:', error);
    }
  } finally {
    // Clear all auth data
    removeItem(AUTH_TOKEN_STORAGE_KEY);
    removeItem('refresh_token');
    removeItem('token_expires_at');
    removeItem('login_time');
    removeItem('user_data');
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  const token = getItem(AUTH_TOKEN_STORAGE_KEY);
  return !!token;
}

// Get current token
export function getAuthToken() {
  return getItem(AUTH_TOKEN_STORAGE_KEY);
}

// Refresh access token (without triggering interceptor)
export async function refreshAccessToken() {
  const refreshToken = getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Refreshing access token...');
  }
  
  try {
    // Mark this as refresh request to skip interceptor
    const { data } = await http.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken
    }, {
      skipAuthRefresh: true // Custom flag to skip token refresh in interceptor
    });
    
    const newAccessToken = data?.access_token;
    const newRefreshToken = data?.refresh_token;
    const expiresIn = data?.expires_in || data?.expires_in_seconds;
    
    if (newAccessToken) {
      setItem(AUTH_TOKEN_STORAGE_KEY, newAccessToken);
      
      // Update token expiration time
      const tokenExpiry = expiresIn || 4800;
      const expirationTime = Date.now() + (tokenExpiry * 1000);
      setItem('token_expires_at', expirationTime);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Token refresh successful', {
          expiresIn: `${tokenExpiry}s`,
          expiresAt: new Date(expirationTime).toLocaleString()
        });
      }
    }
    
    // Update refresh token if new one provided
    if (newRefreshToken) {
      setItem('refresh_token', newRefreshToken);
    }
    
    return {
      access_token: newAccessToken || null,
      refresh_token: newRefreshToken || refreshToken,
      expiresIn: expiresIn || 4800,
      raw: data,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Token refresh failed:', error);
    }
    // Clear tokens on refresh failure
    removeItem(AUTH_TOKEN_STORAGE_KEY);
    removeItem('refresh_token');
    removeItem('token_expires_at');
    throw error;
  }
}

// Check if refresh token is expired
export function isRefreshTokenExpired() {
  const refreshToken = getItem('refresh_token');
  if (!refreshToken) {
    return true;
  }
  
  // Parse JWT to get expiration time
  try {
    const parts = refreshToken.split('.');
    if (parts.length !== 3) {
      return true; // Invalid JWT format
    }
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      // No expiration in token, assume valid
      return false;
    }
    
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Consider expired if already past expiration (no buffer for refresh token)
    return now >= exp;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error parsing refresh token:', error);
    }
    // If can't parse, check if it's been more than 14 days since login
    const loginTime = getItem('login_time');
    if (loginTime) {
      const daysSinceLogin = (Date.now() - parseInt(loginTime, 10)) / (1000 * 60 * 60 * 24);
      return daysSinceLogin > 14; // Assume 14 days max
    }
    return true; // If no info, consider expired
  }
}


