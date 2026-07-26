import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { BOOK_TYPE_VISUALS, bookTypeI18nKey } from "@/utils/bookType";

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
    // The home feed renders one <HomeBookList type="..."> per book type. A new
    // type that gets a /community tab but no home section is invisible on the
    // landing page — which is exactly what happened when `wanted` shipped.
    const source = readSource("src/app/[locale]/page.jsx");
    const rendered = [...source.matchAll(/<HomeBookList\s+type="([^"]+)"/g)].map((m) => m[1]);
    TAB_SLUGS.filter((slug) => slug !== "all").forEach((slug) => {
      expect(rendered, `home page missing a HomeBookList for "${slug}"`).toContain(slug);
    });
  });

  it("every home section prefetches its books server-side", () => {
    // Each section is server-rendered from a `bookParams(<type>)` request. A
    // section without one falls back to a client fetch — a visible skeleton
    // flash on the landing page.
    const source = readSource("src/app/[locale]/page.jsx");
    const prefetched = [...source.matchAll(/bookParams\("([^"]+)"\)/g)].map((m) => m[1]);
    TAB_SLUGS.filter((slug) => slug !== "all").forEach((slug) => {
      expect(prefetched, `home page missing bookParams("${slug}")`).toContain(slug);
    });
  });

  it("every home section title exists in all locales", () => {
    const source = readSource("src/app/[locale]/page.jsx");
    const titleKeys = [...source.matchAll(/titleKey="([^"]+)"/g)].map((m) => m[1]);
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
