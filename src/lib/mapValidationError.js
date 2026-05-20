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
  [ERROR_KINDS.CIRCUIT]: "Backend vaqtincha ishlamayapti. Birozdan keyin urinib ko'ring.",
  [ERROR_KINDS.UNKNOWN]: "Kutilmagan xato.",
};

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
