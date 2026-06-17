import { describe, it, expect } from "vitest";
import { buildAlternates } from "@/lib/seo/alternates";
import { routing } from "@/i18n/routing";

describe("buildAlternates", () => {
  it("emits a canonical for the active locale + suffix", () => {
    const { canonical } = buildAlternates("ru", "community/all");
    expect(canonical).toMatch(/\/ru\/community\/all$/);
  });

  it("emits an hreflang entry for every locale plus x-default", () => {
    const { languages } = buildAlternates("uz", "shops");
    for (const loc of routing.locales) {
      expect(languages[loc]).toMatch(new RegExp(`/${loc}/shops$`));
    }
    expect(languages["x-default"]).toMatch(/\/uz\/shops$/);
  });

  it("normalizes a leading slash in the suffix", () => {
    const a = buildAlternates("en", "/faq");
    const b = buildAlternates("en", "faq");
    expect(a.canonical).toBe(b.canonical);
    expect(a.canonical).toMatch(/\/en\/faq$/);
  });

  it("handles an empty suffix (home) with no trailing slash", () => {
    const { canonical, languages } = buildAlternates("uz", "");
    expect(canonical).toMatch(/\/uz$/);
    expect(languages["x-default"]).toMatch(/\/uz$/);
  });

  it("uses absolute https URLs (so crawlers resolve the host)", () => {
    const { canonical } = buildAlternates("uz", "policies");
    expect(canonical).toMatch(/^https?:\/\//);
  });
});
