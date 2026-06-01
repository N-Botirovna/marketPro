/**
 * Normalize a book `language` value to a canonical key for the `BookLanguages`
 * i18n namespace. Handles both the backend `BookLanguage` enum values
 * (full words: "uzbek", "turkish", …) and the 2-letter codes the book-create
 * form uses ("uz", "tr", …), so the detail page renders a localized label
 * ("Turk" / "Turkish" / "Турецкий") instead of the raw "turkish".
 *
 * Returns null for unknown values so callers can fall back to the raw text.
 */
const ALIAS = {
  uz: "uzbek",
  uzbek: "uzbek",
  ru: "russian",
  russian: "russian",
  en: "english",
  english: "english",
  kk: "karakalpak",
  kaa: "karakalpak",
  karakalpak: "karakalpak",
  qaraqalpaq: "karakalpak",
  tr: "turkish",
  turkish: "turkish",
  ar: "arabic",
  arabic: "arabic",
  other: "other",
};

export const BOOK_LANGUAGE_KEYS = [
  "uzbek",
  "russian",
  "english",
  "karakalpak",
  "turkish",
  "arabic",
  "other",
];

export const bookLanguageKey = (value) =>
  ALIAS[
    String(value ?? "")
      .trim()
      .toLowerCase()
  ] || null;
