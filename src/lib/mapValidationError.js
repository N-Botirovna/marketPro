/**
 * mapValidationError — adapt the structured `mapApiError(...)` result into
 * a shape that form components can render directly:
 *
 *   { general: string|null, fields: Record<string, string> }
 *
 * Used by BookCreateModal, AuthLogin, SellerRegistrationModal, Contact,
 * PostCreateModal. Replaces the old `alert(error.message)` pattern.
 */

import { mapApiError, ERROR_KINDS } from "@/lib/errors";

const KIND_TO_GENERAL_FALLBACK = {
  [ERROR_KINDS.AUTH]: "Iltimos, qaytadan tizimga kiring.",
  [ERROR_KINDS.PERMISSION]: "Bu amalni bajarish uchun ruxsat yo'q.",
  [ERROR_KINDS.NOTFOUND]: "Topilmadi.",
  [ERROR_KINDS.VALIDATION]: "Iltimos, formani tekshirib qayta yuboring.",
  [ERROR_KINDS.SERVER]: "Server xatosi. Birozdan keyin urinib ko'ring.",
  [ERROR_KINDS.NETWORK]: "Tarmoq xatosi. Internet ulanishni tekshiring.",
  [ERROR_KINDS.CIRCUIT]: "Aloqa vaqtincha uzildi. Birozdan keyin qayta urinib ko'ring.",
  [ERROR_KINDS.UNKNOWN]: "Kutilmagan xato.",
};

// Kinds whose `message` is a purely client-side technical string with no
// backend-provided text behind it: the circuit-breaker diagnostic and axios
// timeout/network messages. For these we must NEVER surface the raw message
// to the user — e.g. "Circuit breaker open — backend has failed 8 times.
// Retry in 30s." — and instead fall back to the localized text above.
// (SERVER/UNKNOWN are excluded: a 5xx can carry a localized DRF envelope
// message that we still want to show.)
const NON_LOCALIZED_KINDS = new Set([ERROR_KINDS.CIRCUIT, ERROR_KINDS.NETWORK]);

export function mapValidationError(error) {
  // Already normalized?
  const normalized = error?.normalized || mapApiError(error);

  const fields = normalized.fieldErrors || {};
  const fieldCount = Object.keys(fields).length;

  let general = null;
  if (normalized.kind === ERROR_KINDS.VALIDATION) {
    // If only field-level errors, no general message needed.
    if (fieldCount === 0) {
      general = normalized.message || KIND_TO_GENERAL_FALLBACK[normalized.kind];
    }
  } else if (NON_LOCALIZED_KINDS.has(normalized.kind)) {
    // Ignore the raw technical `message` (English diagnostic) — always show
    // the localized fallback so users never see the circuit-breaker string.
    general = KIND_TO_GENERAL_FALLBACK[normalized.kind] || "Xato yuz berdi.";
  } else {
    general = normalized.message || KIND_TO_GENERAL_FALLBACK[normalized.kind] || "Xato yuz berdi.";
  }

  return { general, fields, kind: normalized.kind, status: normalized.status };
}

/**
 * pickFieldError — convenience for components: pass nested keys like
 * "shop.name" and you get back the error string (or empty string).
 */
export function pickFieldError(fields, name) {
  if (!fields || !name) return "";
  return fields[name] || "";
}
