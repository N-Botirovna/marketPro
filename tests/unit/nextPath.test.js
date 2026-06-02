import { describe, it, expect } from "vitest";
import { stripLocalePrefix, sanitizeNextPath } from "@/utils/nextPath";

// The locale-aware router always re-adds the active locale, so any `next`
// target must be locale-LESS. Regression: the 401 interceptor captured
// "/uz" (window.location.pathname) as next, the login page pushed it through
// the locale-aware router, and the user landed on "/uz/uz" → 404.

describe("stripLocalePrefix", () => {
  it("strips a leading locale segment", () => {
    expect(stripLocalePrefix("/uz/account")).toBe("/account");
    expect(stripLocalePrefix("/ru/shops/3")).toBe("/shops/3");
    expect(stripLocalePrefix("/en")).toBe("/");
    expect(stripLocalePrefix("/kaa")).toBe("/");
  });

  it("handles a locale followed by a query string", () => {
    expect(stripLocalePrefix("/uz?tab=1")).toBe("?tab=1");
    expect(stripLocalePrefix("/uz/account?tab=1")).toBe("/account?tab=1");
  });

  it("leaves locale-less paths untouched", () => {
    expect(stripLocalePrefix("/account")).toBe("/account");
    expect(stripLocalePrefix("/")).toBe("/");
  });

  it("does not strip a non-locale segment that merely starts with the letters", () => {
    expect(stripLocalePrefix("/users/5")).toBe("/users/5"); // not "uz"
    expect(stripLocalePrefix("/english-books")).toBe("/english-books");
  });
});

describe("sanitizeNextPath", () => {
  it("returns a locale-less path so the router never doubles the locale", () => {
    expect(sanitizeNextPath("/uz")).toBe("/"); // the exact /uz/uz bug
    expect(sanitizeNextPath("/uz/account")).toBe("/account");
    expect(sanitizeNextPath("/community/all")).toBe("/community/all");
  });

  it("rejects off-origin and protocol-relative values", () => {
    expect(sanitizeNextPath("//evil.com")).toBeNull();
    expect(sanitizeNextPath("https://evil.com")).toBeNull();
    expect(sanitizeNextPath(null)).toBeNull();
    expect(sanitizeNextPath(undefined)).toBeNull();
  });

  it("never bounces back into the auth pages (loop guard)", () => {
    expect(sanitizeNextPath("/uz/login")).toBeNull();
    expect(sanitizeNextPath("/login")).toBeNull();
    expect(sanitizeNextPath("/uz/login?next=/x")).toBeNull();
    expect(sanitizeNextPath("/ru/register")).toBeNull();
  });
});
