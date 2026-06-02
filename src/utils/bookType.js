/**
 * Single source of truth for a book type's visual identity — badge colour,
 * tinted background, icon glyph and i18n key. Previously this map was copied
 * into BookChatRow and BookDetails (and the colours drifted between them); now
 * every surface that shows a type badge reads from here.
 *
 * Keyed on the backend `BookType` enum value as returned by the API
 * (`BookType.SELLER === "seller"`). `"sell"` is the user-facing slug used only
 * for URLs and i18n keys — never the raw API value.
 */
export const BOOK_TYPE_VISUALS = {
  seller: {
    color: "#0d9488",
    bg: "rgba(13, 148, 136, 0.12)",
    icon: "ph-fill ph-shopping-cart-simple",
    i18nKey: "sell",
  },
  gift: {
    color: "#15803d",
    bg: "rgba(34, 197, 94, 0.14)",
    icon: "ph-fill ph-gift",
    i18nKey: "gift",
  },
  exchange: {
    color: "#b45309",
    bg: "rgba(245, 158, 11, 0.14)",
    icon: "ph-fill ph-arrows-clockwise",
    i18nKey: "exchange",
  },
  rent: {
    color: "#4338ca",
    bg: "rgba(99, 102, 241, 0.14)",
    icon: "ph-fill ph-clock",
    i18nKey: "rent",
  },
};

/** Visual descriptor for a raw API book type, or `null` for unknown types. */
export const bookTypeVisual = (type) => BOOK_TYPE_VISUALS[String(type ?? "").toLowerCase()] || null;

/**
 * i18n key (under the `BookTypeChips` namespace) for a raw API book type.
 * Falls back to the lower-cased raw value so an unmapped type still resolves
 * to *some* key rather than throwing.
 */
export const bookTypeI18nKey = (type) =>
  bookTypeVisual(type)?.i18nKey || String(type ?? "").toLowerCase();
