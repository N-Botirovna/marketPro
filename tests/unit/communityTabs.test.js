import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { BOOK_TYPE_VISUALS, bookTypeI18nKey } from "@/utils/bookType";
import { ALL_BOOK_SECTIONS, HOME_BOOK_SECTIONS } from "@/lib/homeRotation";

// The /community/[type] tabs are route-driven: the slug in the URL is looked up
// in three independent places — the route's VALID_TYPES allow-list, the tab
// strip, and the `CommunityPage.title/subtitle` message maps. A slug added to
// one but not the others renders a raw i18n key (or 404s), which is exactly
// what happened when `wanted` was introduced. These tests pin all three.

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const LOCALES = ["uz", "ru", "en", "kaa"];

// Kept in sync by hand with CommunityBooksPage.TYPE_TABS / the route allow-list;
// the assertions below fail if either drifts from this list.
const TAB_SLUGS = ["all", "sell", "gift", "exchange", "rent", "wanted"];

const readSource = (relPath) => readFileSync(join(ROOT, relPath), "utf8");
const readMessages = (locale) => JSON.parse(readSource(join("src", "messages", `${locale}.json`)));

describe("community tab slugs", () => {
  it("every tab has a title and subtitle in all locales", () => {
    LOCALES.forEach((locale) => {
      const messages = readMessages(locale);
      TAB_SLUGS.forEach((slug) => {
        expect(
          messages.CommunityPage?.title?.[slug],
          `${locale}: CommunityPage.title.${slug}`,
        ).toBeTruthy();
        expect(
          messages.CommunityPage?.subtitle?.[slug],
          `${locale}: CommunityPage.subtitle.${slug}`,
        ).toBeTruthy();
      });
    });
  });

  it("every tab slug is accepted by the route allow-lists", () => {
    const routes = [
      "src/app/[locale]/community/[type]/page.jsx",
      "src/app/[locale]/books/[type]/page.jsx",
    ];
    routes.forEach((route) => {
      const source = readSource(route);
      const match = source.match(/const VALID_TYPES = \[(.*?)\]/s);
      expect(match, `${route}: VALID_TYPES not found`).toBeTruthy();
      const declared = [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(declared.sort()).toEqual([...TAB_SLUGS].sort());
    });
  });

  it("every tab slug is rendered by the tab strip", () => {
    const source = readSource("src/components/CommunityBooksPage.jsx");
    const match = source.match(/const TYPE_TABS = \[(.*?)\]/s);
    expect(match, "TYPE_TABS not found").toBeTruthy();
    const declared = [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(declared).toEqual(TAB_SLUGS);
  });

  it("every non-'all' tab resolves to a book-type chip label", () => {
    LOCALES.forEach((locale) => {
      const messages = readMessages(locale);
      TAB_SLUGS.filter((slug) => slug !== "all").forEach((slug) => {
        expect(messages.BookTypeChips?.[slug], `${locale}: BookTypeChips.${slug}`).toBeTruthy();
      });
    });
  });

  it("every tab has its own home-page section", () => {
    // The home feed renders one row per book type. A type that gets a
    // /community tab but no home section is invisible on the landing page —
    // which is exactly what happened when `wanted` shipped.
    //
    // The rows used to be hard-coded in page.jsx; they are now declared in
    // lib/homeRotation.js (which also decides their order), so that module is
    // what this assertion reads.
    const homeTypes = ALL_BOOK_SECTIONS.map((slug) => HOME_BOOK_SECTIONS[slug].type);
    TAB_SLUGS.filter((slug) => slug !== "all").forEach((slug) => {
      expect(homeTypes, `home feed missing a section for "${slug}"`).toContain(slug);
    });
  });

  it("every home section prefetches its books server-side", () => {
    // Each section is server-rendered from a `bookParams(<type>)` request. A
    // section without one falls back to a client fetch — a visible skeleton
    // flash on the landing page. page.jsx maps over ALL_BOOK_SECTIONS to build
    // those requests, so the guard is that it still does exactly that.
    const source = readSource("src/app/[locale]/page.jsx");
    expect(source).toMatch(/ALL_BOOK_SECTIONS\.map\(/);
    expect(source).toMatch(/bookParams\(HOME_BOOK_SECTIONS\[slug\]\.type\)/);
  });

  it("every home section title exists in all locales", () => {
    const titleKeys = ALL_BOOK_SECTIONS.map((slug) => HOME_BOOK_SECTIONS[slug].titleKey);
    expect(titleKeys.length).toBeGreaterThan(0);
    LOCALES.forEach((locale) => {
      const messages = readMessages(locale);
      titleKeys.forEach((key) => {
        expect(messages.HomeBookList?.[key], `${locale}: HomeBookList.${key}`).toBeTruthy();
      });
    });
  });

  it("every book-type badge maps to an existing chip label", () => {
    const messages = readMessages("uz");
    Object.keys(BOOK_TYPE_VISUALS).forEach((apiType) => {
      const key = bookTypeI18nKey(apiType);
      expect(messages.BookTypeChips?.[key], `BookTypeChips.${key}`).toBeTruthy();
    });
  });
});
