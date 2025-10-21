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
    
    // Store token expiration time if provided
    if (expiresIn) {
      const expirationTime = Date.now() + (expiresIn * 1000);
      setItem('token_expires_at', expirationTime.toString());
    }
  }
  
  // Store refresh_token in localStorage (in production, this should be httpOnly cookie)
  if (refreshToken) {
    setItem('refresh_token', refreshToken);
  }
  
  console.log('🔐 Login successful:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    expiresIn: expiresIn ? `${expiresIn}s` : 'unknown'
  });
  
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

// Check if token is expired or about to expire
export function isTokenExpired() {
  const expirationTime = getItem('token_expires_at');
  if (!expirationTime) {
    return false; // No expiration info, assume valid
  }
  
  const now = Date.now();
  const expiresAt = parseInt(expirationTime);
  
  // Consider token expired if it expires within the next 5 minutes
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return now >= (expiresAt - bufferTime);
}

// Check if token needs refresh
export function shouldRefreshToken() {
  const expirationTime = getItem('token_expires_at');
  if (!expirationTime) {
    return false;
  }
  
  const now = Date.now();
  const expiresAt = parseInt(expirationTime);
  
  // Refresh if token expires within the next 10 minutes
  const refreshBuffer = 10 * 60 * 1000; // 10 minutes in milliseconds
  return now >= (expiresAt - refreshBuffer);
}

// Proactive token refresh
export async function refreshTokenIfNeeded() {
  if (shouldRefreshToken()) {
    try {
      console.log('🔄 Proactively refreshing token...');
      await refreshAccessToken();
      return true;
    } catch (error) {
      console.error('❌ Proactive token refresh failed:', error);
      return false;
    }
  }
  return true;
}

// Logout user
export async function logoutUser() {
  try {
    await http.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeItem(AUTH_TOKEN_STORAGE_KEY);
    removeItem('refresh_token');
    removeItem('token_expires_at');
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

// Refresh access token
export async function refreshAccessToken() {
  const refreshToken = getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  console.log('🔄 Refreshing access token...');
  
  try {
    const { data } = await http.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken
    });
    
    const newAccessToken = data?.access_token;
    const newRefreshToken = data?.refresh_token;
    const expiresIn = data?.expires_in || data?.expires_in_seconds;
    
    if (newAccessToken) {
      setItem(AUTH_TOKEN_STORAGE_KEY, newAccessToken);
      
      // Update token expiration time
      if (expiresIn) {
        const expirationTime = Date.now() + (expiresIn * 1000);
        setItem('token_expires_at', expirationTime.toString());
      }
    }
    
    // Update refresh token if new one provided
    if (newRefreshToken) {
      setItem('refresh_token', newRefreshToken);
    }
    
    console.log('✅ Token refresh successful');
    
    return {
      access_token: newAccessToken || null,
      refresh_token: newRefreshToken || refreshToken,
      expiresIn: expiresIn || null,
      raw: data,
    };
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    throw error;
  }
}


