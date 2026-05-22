/**
 * Locale-aware getter for backend-returned translated objects.
 *
 * Django's `modeltranslation` serializes a translated field two ways
 * depending on the endpoint:
 *
 *   1. A generic alias (`name`) that resolves server-side to the
 *      current `Accept-Language`. The frontend already sends the
 *      active locale via http.js, so this usually returns the right
 *      string.
 *
 *   2. Explicit per-locale variants (`name_uz`, `name_ru`, `name_en`,
 *      `name_kaa`) when the serializer was set up to emit all four.
 *
 * This helper handles both. The chain:
 *
 *     obj[base_locale] → obj[base] → obj[base_uz] → obj[base_ru] →
 *     obj[base_en] → ""
 *
 * means: prefer the explicit locale variant if present; otherwise use
 * the server-side proxy; finally walk a deterministic fallback chain
 * so kaa rows with an empty `name_kaa` render as uz instead of blank.
 *
 * @param obj    Object returned from the API
 * @param base   Field stem (default "name"; pass "author" / "description")
 * @param locale Current frontend locale ("uz" | "ru" | "en" | "kaa")
 * @returns      Localized string, "" when obj is missing entirely
 */
export function localizedField(obj, base = "name", locale = "uz") {
  if (!obj) return "";
  return (
    obj[`${base}_${locale}`] ||
    obj[base] ||
    obj[`${base}_uz`] ||
    obj[`${base}_ru`] ||
    obj[`${base}_en`] ||
    ""
  );
}
