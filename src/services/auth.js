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
  if (data?.token) {
    setItem(AUTH_TOKEN_STORAGE_KEY, data.token);
  }
  return {
    token: data?.token || null,
    user: data?.user || null,
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
  const { data } = await http.get(API_ENDPOINTS.AUTH.PROFILE);
  return {
    user: data?.user || null,
    raw: data,
  };
}

// Logout user
export async function logoutUser() {
  try {
    await http.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeItem(AUTH_TOKEN_STORAGE_KEY);
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


