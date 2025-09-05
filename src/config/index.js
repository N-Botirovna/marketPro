// Centralized runtime configuration
// Prefer NEXT_PUBLIC_API_BASE_URL if provided, fallback to given default
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kitobzor.uz/";

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";



