import { describe, it, expect, vi } from "vitest";

// books.js imports http (axios instance) at module load. We don't exercise the
// network here — only the pure `toBookFormData` helper — but the import graph
// pulls in @/lib/http, so stub it to keep this a fast, isolated unit test.
vi.mock("@/lib/http", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  clearHttpCache: vi.fn(),
}));

import { toBookFormData } from "@/services/books";

describe("toBookFormData", () => {
  it("returns a FormData unchanged (modal already builds one)", () => {
    const fd = new FormData();
    fd.append("name", "x");
    expect(toBookFormData(fd)).toBe(fd);
  });

  it("converts a plain object to FormData (archive flow: { is_active: false })", () => {
    const fd = toBookFormData({ is_active: false });
    expect(fd).toBeInstanceOf(FormData);
    // DRF BooleanField parses the string "false" as False.
    expect(fd.get("is_active")).toBe("false");
  });

  it("serializes booleans as 'true'/'false' strings", () => {
    const fd = toBookFormData({ is_active: true, for_home_page: false });
    expect(fd.get("is_active")).toBe("true");
    expect(fd.get("for_home_page")).toBe("false");
  });

  it("skips null/undefined fields so they don't overwrite server values", () => {
    const fd = toBookFormData({ name: "Book", author: null, isbn: undefined });
    expect(fd.get("name")).toBe("Book");
    expect(fd.has("author")).toBe(false);
    expect(fd.has("isbn")).toBe(false);
  });

  it("keeps numeric and string values", () => {
    const fd = toBookFormData({ price: 75000, name: "Atomic Habits" });
    expect(fd.get("price")).toBe("75000");
    expect(fd.get("name")).toBe("Atomic Habits");
  });

  it("handles a null/empty payload safely", () => {
    expect(toBookFormData(null)).toBeInstanceOf(FormData);
    expect([...toBookFormData(null).keys()]).toEqual([]);
  });
});
