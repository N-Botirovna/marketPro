import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  ALL_BOOK_SECTIONS,
  DISCOVERY_BLOCKS,
  HOME_BOOK_SECTIONS,
  PINNED_SECTION,
  ROTATING_SECTIONS,
  ROTATION_PERIOD_MS,
  homeLayout,
  rotate,
  rotationIndex,
} from "@/lib/homeRotation";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const LOCALES = ["uz", "ru", "en", "kaa"];

const bucket = (n) => n * ROTATION_PERIOD_MS;

describe("rotationIndex", () => {
  it("is stable inside a bucket and advances at the boundary", () => {
    expect(rotationIndex(bucket(7))).toBe(7);
    expect(rotationIndex(bucket(7) + ROTATION_PERIOD_MS - 1)).toBe(7);
    expect(rotationIndex(bucket(8))).toBe(8);
  });

  it("falls back to 0 on a nonsense clock instead of throwing", () => {
    expect(rotationIndex(NaN)).toBe(0);
    expect(rotationIndex(bucket(3), 0)).toBe(0);
    expect(rotationIndex(bucket(3), -1)).toBe(0);
  });
});

describe("rotate", () => {
  it("cycles left by the offset", () => {
    expect(rotate(["a", "b", "c"], 0)).toEqual(["a", "b", "c"]);
    expect(rotate(["a", "b", "c"], 1)).toEqual(["b", "c", "a"]);
    expect(rotate(["a", "b", "c"], 3)).toEqual(["a", "b", "c"]);
    expect(rotate(["a", "b", "c"], 4)).toEqual(["b", "c", "a"]);
  });

  it("handles negative offsets and empty / invalid input", () => {
    expect(rotate(["a", "b", "c"], -1)).toEqual(["c", "a", "b"]);
    expect(rotate([], 2)).toEqual([]);
    expect(rotate(null, 2)).toEqual([]);
    expect(rotate(["a", "b"], undefined)).toEqual(["a", "b"]);
  });

  it("never drops or duplicates an item", () => {
    for (let i = -5; i < 12; i += 1) {
      expect([...rotate(ROTATING_SECTIONS, i)].sort()).toEqual([...ROTATING_SECTIONS].sort());
    }
  });
});

describe("homeLayout", () => {
  it("puts the wanted row first at every rotation", () => {
    for (let i = 0; i < 24; i += 1) {
      expect(homeLayout(bucket(i)).bookOrder[0]).toBe(PINNED_SECTION);
    }
  });

  it("uses wanted → exchange → sell as the baseline order", () => {
    expect(homeLayout(bucket(0)).bookOrder).toEqual(["wanted", "exchange", "sell", "gift", "rent"]);
  });

  it("renders every section exactly once, whatever the rotation", () => {
    for (let i = 0; i < 24; i += 1) {
      const { bookOrder } = homeLayout(bucket(i));
      expect([...bookOrder].sort()).toEqual([...ALL_BOOK_SECTIONS].sort());
    }
  });

  it("actually changes the supply order across buckets", () => {
    const seen = new Set(
      Array.from({ length: ROTATING_SECTIONS.length }, (_, i) =>
        homeLayout(bucket(i)).bookOrder.join(">"),
      ),
    );
    expect(seen.size).toBe(ROTATING_SECTIONS.length);
  });

  it("never pushes the discovery block above the wanted row", () => {
    for (let i = 0; i < 24; i += 1) {
      expect(homeLayout(bucket(i)).discoveryAt).toBeGreaterThanOrEqual(1);
    }
  });

  it("moves the discovery block and swaps shops / collections over time", () => {
    const slots = new Set();
    const orders = new Set();
    for (let i = 0; i < 8; i += 1) {
      const { discoveryAt, discoveryOrder } = homeLayout(bucket(i));
      slots.add(discoveryAt);
      orders.add(discoveryOrder.join(">"));
      expect([...discoveryOrder].sort()).toEqual([...DISCOVERY_BLOCKS].sort());
    }
    expect(slots.size).toBeGreaterThan(1);
    expect(orders.size).toBe(2);
  });

  it("keeps the discovery block inside the book rows", () => {
    for (let i = 0; i < 24; i += 1) {
      const { bookOrder, discoveryAt } = homeLayout(bucket(i));
      expect(discoveryAt).toBeLessThan(bookOrder.length);
    }
  });
});

describe("section descriptors", () => {
  it("describes every rotating and pinned section", () => {
    ALL_BOOK_SECTIONS.forEach((slug) => {
      expect(HOME_BOOK_SECTIONS[slug], slug).toMatchObject({
        type: expect.any(String),
        titleKey: expect.any(String),
        href: expect.stringMatching(/^\/community\//),
      });
    });
  });

  it("has a HomeBookList title for every section in all locales", () => {
    LOCALES.forEach((locale) => {
      const messages = JSON.parse(
        readFileSync(join(ROOT, "src", "messages", `${locale}.json`), "utf8"),
      );
      ALL_BOOK_SECTIONS.forEach((slug) => {
        const key = HOME_BOOK_SECTIONS[slug].titleKey;
        expect(typeof messages.HomeBookList[key], `${locale}: HomeBookList.${key}`).toBe("string");
      });
    });
  });

  it("links each section at a slug the /community route serves", () => {
    // Kept in sync with community/[type]/page.jsx VALID_TYPES — a section
    // pointing at a slug that route rejects would 404 from "see all".
    const validTypes = ["all", "sell", "gift", "exchange", "rent", "wanted"];
    ALL_BOOK_SECTIONS.forEach((slug) => {
      const { type, href } = HOME_BOOK_SECTIONS[slug];
      expect(validTypes, slug).toContain(type);
      expect(href).toBe(`/community/${type}`);
    });
  });
});
