/**
 * Client-side validation primitives — pure boolean/number helpers that mirror
 * the backend serializer rules so a form never POSTs data the API will reject.
 *
 * These return booleans (or NaN-safe numbers); each form composes them with its
 * own `useTranslations("Validation")` so the human message stays localized and
 * lives next to the field. Keep this file framework-free (no React, no i18n) so
 * it is trivially unit-testable.
 */

// E.164 phone, matching `users/utils.py` `^\+[1-9]\d{3,14}$`.
export const PHONE_E164 = /^\+[1-9]\d{3,14}$/;

/** Empty / whitespace-only / null / undefined. */
export const isBlank = (v) => v == null || String(v).trim() === "";

/** String length exceeds `max`. Blank values are never "too long". */
export const tooLong = (v, max) => v != null && String(v).length > max;

/** A whole-number string (no decimals, optional leading minus). */
export const isIntStr = (v) => /^-?\d+$/.test(String(v).trim());

/** Parse to Number, returning NaN for blank/null (so range checks fail safely). */
export const toNum = (v) => (v === "" || v == null ? NaN : Number(v));

/** Valid E.164 phone number. */
export const isPhoneE164 = (v) => PHONE_E164.test(String(v ?? "").trim());

/** Inclusive numeric range check; NaN (blank) is out of range. */
export const inRange = (v, min, max) => {
  const n = toNum(v);
  return !Number.isNaN(n) && n >= min && n <= max;
};
