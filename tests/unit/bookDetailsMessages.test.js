import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { BOOK_TYPE_VISUALS, bookTypeI18nKey } from "@/utils/bookType";

// BookDetails renders the type badge as `t(bookTypeI18nKey(book.type))` in the
// `BookDetails` namespace, and BookCard / BookChatRow do the same in
// `BookTypeChips`. next-intl renders a missing key as its raw path, so a type
// added to BOOK_TYPE_VISUALS but not to a message file ships the literal text
// "BookDetails.wanted" onto the page — which is exactly what happened.

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const LOCALES = ["uz", "ru", "en", "kaa"];

const readMessages = (locale) =>
  JSON.parse(readFileSync(join(ROOT, "src", "messages", `${locale}.json`), "utf8"));

const TYPE_KEYS = Object.keys(BOOK_TYPE_VISUALS).map(bookTypeI18nKey);

describe("book type labels", () => {
  it("covers every book type in the BookDetails namespace", () => {
    LOCALES.forEach((locale) => {
      const { BookDetails } = readMessages(locale);
      TYPE_KEYS.forEach((key) => {
        expect(typeof BookDetails[key], `${locale}: BookDetails.${key}`).toBe("string");
        expect(BookDetails[key].trim().length).toBeGreaterThan(0);
      });
    });
  });

  it("covers every book type in the BookTypeChips namespace", () => {
    LOCALES.forEach((locale) => {
      const { BookTypeChips } = readMessages(locale);
      TYPE_KEYS.forEach((key) => {
        expect(typeof BookTypeChips[key], `${locale}: BookTypeChips.${key}`).toBe("string");
        expect(BookTypeChips[key].trim().length).toBeGreaterThan(0);
      });
    });
  });
});

describe("contact prefill", () => {
  // A `wanted` post inverts the roles: the poster is looking for the book and
  // the visitor tapping contact is the one who has it. Reusing the supply
  // prefill opened a Telegram chat that told the searcher they were selling
  // the book they had just asked for.
  it("has a distinct wanted variant in every locale", () => {
    LOCALES.forEach((locale) => {
      const { BookDetails } = readMessages(locale);
      expect(typeof BookDetails.contactPrefill, locale).toBe("string");
      expect(typeof BookDetails.wantedContactPrefill, locale).toBe("string");
      expect(BookDetails.wantedContactPrefill, locale).not.toBe(BookDetails.contactPrefill);
    });
  });

  it("interpolates the book name in both variants", () => {
    LOCALES.forEach((locale) => {
      const { BookDetails } = readMessages(locale);
      expect(BookDetails.contactPrefill, locale).toContain("{name}");
      expect(BookDetails.wantedContactPrefill, locale).toContain("{name}");
    });
  });
});
