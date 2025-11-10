// utils/storage.js
// Safe localStorage wrapper — works in both browser and SSR contexts.

export function setItem(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (typeof value === "string") {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Storage setItem error:", error);
    }
  }
}

export function getItem(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Storage getItem error:", error);
    }
    return null;
  }
}

export function removeItem(key) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Storage removeItem error:", error);
    }
  }
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  try {
    [
      "auth_token",
      "refresh_token",
      "token_expires_at",
      "user_data",
      "login_time"
    ].forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Storage clear error:", error);
    }
  }
}

/**
 * Get current locale in a safe, reliable way.
 * 1️⃣ Tries from URL path (/uz, /en, /ru)
 * 2️⃣ Fallbacks to localStorage (NEXT_LOCALE or locale)
 * 3️⃣ Fallbacks to browser language
 * 4️⃣ Defaults to "uz"
 */
export function getCurrentLocale() {
  if (typeof window === "undefined") return "uz";

  try {
    // 1. From URL (preferred)
    const path = window.location?.pathname || "";
    const match = path.match(/^\/(en|ru|uz)(\/|$)/);
    if (match && match[1]) return match[1];

    // 2. From storage
    const stored =
      localStorage.getItem("NEXT_LOCALE") || localStorage.getItem("locale");
    if (stored && ["uz", "en", "ru"].includes(stored)) return stored;

    // 3. From browser language
    const browserLang = navigator.language?.slice(0, 2);
    if (["uz", "en", "ru"].includes(browserLang)) return browserLang;

    // 4. Default
    return "uz";
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("getCurrentLocale error:", error);
    }
    return "uz";
  }
}

/**
 * Redirect safely with locale prefix
 * Prevents double redirects and ensures locale correctness
 */
export function redirectToLogin() {
  if (typeof window === "undefined") return;
  try {
    const currentLocale = getCurrentLocale() || "uz";
    const target = `/${currentLocale}/login`;

    // Prevent redirect loops
    if (window.location.pathname !== target) {
      setTimeout(() => {
        window.location.href = target;
      }, 50);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("redirectToLogin error:", error);
    }
  }
}
