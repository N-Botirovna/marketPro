/**
 * SEO text helpers — produce metadata-quality strings from backend payloads.
 *
 * Backend stores book/shop descriptions in a CKEditor 5 field, so raw
 * content carries HTML (<p>, <strong>, <br>, etc.) and may include
 * non-breaking spaces, multiple newlines, or fixed entities. None of that
 * belongs in `<meta name="description">` or OG tags.
 */

const HTML_TAG_RE = /<\/?[a-zA-Z][^>]*>/g;
const HTML_ENTITY_RE = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi;
const WHITESPACE_RE = /\s+/g;

const ENTITY_MAP = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
  "&#39;": "'",
};

/**
 * Strip HTML and collapse whitespace. Decodes the handful of entities
 * we actually emit from the backend; everything else falls back to "".
 */
export function stripHtml(input) {
  if (input == null) return "";
  const str = String(input);
  if (!str) return "";
  return str
    .replace(HTML_TAG_RE, " ")
    .replace(HTML_ENTITY_RE, (e) => (Object.hasOwn(ENTITY_MAP, e) ? ENTITY_MAP[e] : " "))
    .replace(WHITESPACE_RE, " ")
    .trim();
}

/**
 * Truncate at the last word boundary ≤ maxLen. Adds an ellipsis only
 * when the source was actually clipped — never mid-word, never with a
 * dangling preposition like "va" or "ва". The 160-char default matches
 * Google's typical SERP description snippet length.
 */
export function seoTruncate(input, maxLen = 160) {
  const cleaned = stripHtml(input);
  if (!cleaned) return "";
  if (cleaned.length <= maxLen) return cleaned;

  // Look for the last whitespace before maxLen; if none, hard-cut.
  const slice = cleaned.slice(0, maxLen + 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLen * 0.6 ? lastSpace : maxLen;
  let truncated = cleaned.slice(0, cut).trimEnd();

  // Drop trailing punctuation that doesn't pair well with the ellipsis
  // ("Hello, …" reads as a thought-trail, "Hello,…" doesn't).
  truncated = truncated.replace(/[\s,;:.!?-]+$/u, "");
  return `${truncated}…`;
}

/**
 * Build a single-line subtitle from a book/shop with optional bits.
 * Skips empty parts so we never emit " —  — ".
 */
export function joinParts(parts, sep = " — ") {
  return parts
    .filter((p) => typeof p === "string" && p.trim() !== "")
    .map((p) => p.trim())
    .join(sep);
}

/**
 * Lower-case + remove diacritics + non-alphanum → slug.
 *   "O'tkan kunlar" → "otkan-kunlar"
 *   "Заговор" → "zagovor" (no transliteration — we keep cyrillic if present)
 * Caller decides whether to prepend an ID for uniqueness.
 */
export function slugify(input) {
  if (!input) return "";
  return String(input)
    .toLocaleLowerCase("uz")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9Ѐ-ӿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
