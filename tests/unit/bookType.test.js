import { describe, it, expect } from "vitest";
import { BOOK_TYPE_VISUALS, bookTypeVisual, bookTypeI18nKey } from "@/utils/bookType";

// The book-type visual map is the single source of truth for badge colours,
// icons and i18n keys across BookChatRow, BookDetails and BookCard. These tests
// pin the contract that broke before: case-sensitivity and the seller→"sell"
// slug remap.

describe("bookTypeVisual", () => {
  it("maps known API enum values to their descriptor", () => {
    expect(bookTypeVisual("seller")).toBe(BOOK_TYPE_VISUALS.seller);
    expect(bookTypeVisual("gift")).toBe(BOOK_TYPE_VISUALS.gift);
    expect(bookTypeVisual("exchange")).toBe(BOOK_TYPE_VISUALS.exchange);
    expect(bookTypeVisual("rent")).toBe(BOOK_TYPE_VISUALS.rent);
    // Demand, not supply — "I'm looking for this book".
    expect(bookTypeVisual("wanted")).toBe(BOOK_TYPE_VISUALS.wanted);
  });

  it("gives 'wanted' a badge colour no supply type uses", () => {
    const supplyColors = ["seller", "gift", "exchange", "rent"].map(
      (t) => BOOK_TYPE_VISUALS[t].color,
    );
    expect(supplyColors).not.toContain(BOOK_TYPE_VISUALS.wanted.color);
  });

  it("is case-insensitive", () => {
    expect(bookTypeVisual("SELLER")).toBe(BOOK_TYPE_VISUALS.seller);
    expect(bookTypeVisual("Gift")).toBe(BOOK_TYPE_VISUALS.gift);
  });

  it("returns null for unknown / empty / nullish types", () => {
    expect(bookTypeVisual("nope")).toBeNull();
    expect(bookTypeVisual("")).toBeNull();
    expect(bookTypeVisual(null)).toBeNull();
    expect(bookTypeVisual(undefined)).toBeNull();
  });

  it("exposes a colour, bg, icon and i18nKey for every type", () => {
    Object.values(BOOK_TYPE_VISUALS).forEach((v) => {
      expect(v).toMatchObject({
        color: expect.any(String),
        bg: expect.any(String),
        icon: expect.stringContaining("ph-"),
        i18nKey: expect.any(String),
      });
    });
  });
});

describe("bookTypeI18nKey", () => {
  it("remaps the API 'seller' value to the user-facing 'sell' slug", () => {
    expect(bookTypeI18nKey("seller")).toBe("sell");
  });

  it("passes through gift / exchange / rent / wanted unchanged", () => {
    expect(bookTypeI18nKey("gift")).toBe("gift");
    expect(bookTypeI18nKey("exchange")).toBe("exchange");
    expect(bookTypeI18nKey("rent")).toBe("rent");
    expect(bookTypeI18nKey("wanted")).toBe("wanted");
  });

  it("falls back to the lower-cased raw value for unknown types", () => {
    expect(bookTypeI18nKey("Foo")).toBe("foo");
    expect(bookTypeI18nKey(null)).toBe("");
  });
});
