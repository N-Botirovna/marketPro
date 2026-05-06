export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-dev.kitobzor.uz/";

export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+998 93 834 01 03";

export const PUBLIC_PAGES = ["/login", "/register", "/forgot-password"];

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "api/v1/auth/login/",
    REQUEST_OTP: "api/v1/auth/request-otp",
    REGISTER: "api/v1/auth/register/",
    REFRESH: "api/v1/auth/refresh/",
    LOGOUT: "api/v1/auth/logout",
    ME: "api/v1/auth/me",
    PROFILE: "api/v1/auth/profile",
    DETAIL: "api/v1/auth",
    UPDATE_PROFILE: "api/v1/auth/me/update/",
  },
  BOOKS: {
    LIST: "api/v1/book/list/",
    DETAIL: "api/v1/book",
    CATEGORIES: "api/v1/book/categories/",
    CATEGORY_DETAIL: "api/v1/book/categories",
    SUBCATEGORIES: "api/v1/book/subcategories/",
    CREATE: "api/v1/book/create/",
    UPDATE: "api/v1/book/update/",
    LIKE: "api/v1/book/like/",
    LIKED: "api/v1/book/liked/",
    COMMENT: {
      CREATE: "api/v1/book/comment/create/",
      LIST: "api/v1/book/comment/list/",
      LIKE: "api/v1/book/comment/like/",
      DELETE: "api/v1/book/comment",
    },
  },
  SHOPS: {
    LIST: "api/v1/shop/list/",
    DETAIL: "api/v1/shop",
    CREATE: "api/v1/shop/create/",
  },
  PRODUCTS: {
    LIST: "api/v1/products",
    DETAIL: "api/v1/products",
    SEARCH: "api/v1/products/search",
    CATEGORIES: "api/v1/categories",
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
  COMMENTS: {
    CREATE: "api/v1/comment/create/",
    LIST: "api/v1/comment/list/",
    UPDATE: "api/v1/comment/update",
    DELETE: "api/v1/comment/delete",
  },
  POSTS: {
    LIST: "api/v1/post/list/",
    DETAIL: "api/v1/post/detail",
    CREATE: "api/v1/post/create/",
    UPDATE: "api/v1/post/update/",
    DELETE: "api/v1/post/delete/",
  },
  BASE: {
    REGIONS: "api/v1/base/regions/",
    REGION_DETAIL: "api/v1/base/regions",
    BANNERS: "api/v1/base/banners/",
    BANNER_DETAIL: "api/v1/base/banners",
    FAQS: "api/v1/base/faqs/",
    CONTACT: "api/v1/base/contact-us/",
  },
  GIVEAWAY: {
    ACTIVE: "api/v1/book/give-away/active/",
    LIST: "api/v1/give-away/",
    DETAIL: "api/v1/give-away",
  },
};
