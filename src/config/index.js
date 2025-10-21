// Centralized runtime configuration
// Prefer NEXT_PUBLIC_API_BASE_URL if provided, fallback to given default
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kitobzor.uz/";

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "api/v1/auth/login/",
    REQUEST_OTP: "api/v1/auth/request-otp",
    REGISTER: "api/v1/auth/register",
    REFRESH: "api/v1/auth/refresh",
    LOGOUT: "api/v1/auth/logout",
    PROFILE: "api/v1/auth/profile",
    UPDATE_PROFILE: "api/v1/auth/me/update",
  },
  PRODUCTS: {
    LIST: "api/v1/products",
    DETAIL: "api/v1/products",
    SEARCH: "api/v1/products/search",
    CATEGORIES: "api/v1/categories",
  },
  CART: {
    LIST: "api/v1/cart",
    ADD: "api/v1/cart/add",
    UPDATE: "api/v1/cart/update",
    REMOVE: "api/v1/cart/remove",
  },
  ORDERS: {
    LIST: "api/v1/orders",
    CREATE: "api/v1/orders",
    DETAIL: "api/v1/orders",
  },
  VENDORS: {
    LIST: "api/v1/vendors",
    DETAIL: "api/v1/vendors",
  },
  BOOKS: {
    LIST: "api/v1/book/list/",
    DETAIL: "api/v1/book",
    CATEGORIES: "api/v1/book/categories/",
    SUBCATEGORIES: "api/v1/book/subcategories/",
    CREATE: "api/v1/book/create/",
    UPDATE: "api/v1/book/update/",
  },
  COMMENTS: {
    CREATE: "api/v1/comment/create/",
  },
  POSTS: {
    LIST: "api/v1/post/list/",
    CREATE: "api/v1/post/create/",
    UPDATE: "api/v1/post/update/",
    DELETE: "api/v1/post/delete/",
  },
  BASE: {
    REGIONS: "api/v1/base/regions/",
  },
};









