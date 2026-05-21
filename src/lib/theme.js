/**
 * Theme manager.
 *
 * - Stores user preference under `localStorage.theme` ("light" | "dark" | "system").
 * - Applies the resolved mode as `<html data-theme="…">`.
 * - Falls back to OS preference via `prefers-color-scheme`.
 * - Emits a `themechange` CustomEvent on `window` so React components can sync.
 *
 * A small synchronous bootstrap script (injected in layout.jsx) calls
 * `applyInitialTheme()` BEFORE hydration to avoid a light/dark flash.
 */

export const THEME_KEY = "theme";
export const THEME_EVENT = "themechange";

const VALID_MODES = new Set(["light", "dark", "system"]);

function readStoredMode() {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return VALID_MODES.has(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

function systemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function resolveTheme(mode) {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return systemPrefersDark() ? "dark" : "light";
}

export function getThemeMode() {
  return readStoredMode();
}

export function getResolvedTheme() {
  return resolveTheme(readStoredMode());
}

export function setThemeMode(mode) {
  if (typeof window === "undefined") return;
  const normalized = VALID_MODES.has(mode) ? mode : "system";
  try {
    if (normalized === "system") {
      window.localStorage.removeItem(THEME_KEY);
    } else {
      window.localStorage.setItem(THEME_KEY, normalized);
    }
  } catch {
    /* storage blocked — silently fall back to in-memory effect */
  }
  applyTheme(normalized);
  window.dispatchEvent(
    new CustomEvent(THEME_EVENT, {
      detail: { mode: normalized, resolved: resolveTheme(normalized) },
    }),
  );
}

export function applyTheme(mode = readStoredMode()) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute("data-theme", resolved);
}

export function applyInitialTheme() {
  applyTheme(readStoredMode());
}

/**
 * Subscribe to theme changes from any source (user toggle, system change).
 * Returns an unsubscribe fn.
 */
export function subscribeTheme(callback) {
  if (typeof window === "undefined") return () => {};

  const handle = () =>
    callback({
      mode: readStoredMode(),
      resolved: getResolvedTheme(),
    });

  window.addEventListener(THEME_EVENT, handle);

  // Listen to system preference changes too (only relevant in `system` mode).
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const systemHandler = () => {
    if (readStoredMode() === "system") {
      applyTheme("system");
      handle();
    }
  };
  media?.addEventListener?.("change", systemHandler);

  return () => {
    window.removeEventListener(THEME_EVENT, handle);
    media?.removeEventListener?.("change", systemHandler);
  };
}

/**
 * Synchronous inline-script body for layout.jsx's <head>.
 * Runs before React hydration, sets `data-theme` from stored preference or
 * OS setting. Wrap this string in <script dangerouslySetInnerHTML={...}/>.
 */
export const themeBootstrapScript = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_KEY}');
    var mode = (stored === 'light' || stored === 'dark') ? stored : 'system';
    var resolved = mode === 'dark' ? 'dark'
      : mode === 'light' ? 'light'
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`.trim();
