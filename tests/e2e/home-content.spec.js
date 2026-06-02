import { test, expect } from "@playwright/test";

const API_STUBS = {
  banners: { result: { results: [] }, success: true },
  stories: { result: { count: 0, next: null, previous: null, results: [] }, success: true },
  shops: { result: { count: 0, next: null, previous: null, results: [] }, success: true },
  books: { result: { count: 0, next: null, previous: null, results: [] }, success: true },
};

async function stubApis(page) {
  await page.route("**/api/v1/**", (route) => {
    const url = route.request().url();
    if (url.includes("/base/banners/")) return route.fulfill({ json: API_STUBS.banners });
    if (url.includes("/stories/")) return route.fulfill({ json: API_STUBS.stories });
    if (url.includes("/shop/list/")) return route.fulfill({ json: API_STUBS.shops });
    if (url.includes("/book/list/") || url.includes("/book/"))
      return route.fulfill({ json: API_STUBS.books });
    return route.fulfill({ json: { result: { results: [] }, success: true } });
  });
}

test.describe("Home page content (A3)", () => {
  // A3.1 — renders without crash on empty DB
  test("renders without crash with empty API responses", async ({ page }) => {
    await stubApis(page);
    const res = await page.goto("/uz/");
    expect(res?.ok()).toBe(true);
    await expect(page.getByRole("link", { name: "Kitobzor" }).first()).toBeVisible();
    // No JS errors
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  // A3.1 — all 4 locales render
  test.describe("all locales render home page", () => {
    for (const locale of ["uz", "ru", "en", "kaa"]) {
      test(`${locale} home returns 200`, async ({ page }) => {
        await stubApis(page);
        const res = await page.goto(`/${locale}/`);
        expect(res?.status()).toBeLessThan(400);
        await expect(page.locator(`html[lang="${locale}"]`)).toHaveCount(1);
      });
    }
  });

  // A3.6 — SEO metadata
  test("uz home has correct metadata", async ({ page }) => {
    await stubApis(page);
    await page.goto("/uz/");
    // Title contains Kitobzor
    await expect(page).toHaveTitle(/Kitobzor/);
    // meta description present
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc?.length).toBeGreaterThan(10);
    // hreflang alternates for all 4 locales
    for (const loc of ["uz", "ru", "en", "kaa"]) {
      const link = page.locator(`link[rel="alternate"][hreflang="${loc}"]`);
      await expect(link).toHaveCount(1);
    }
  });

  // A3.2 — banner renders without crash regardless of API result
  test("banner section does not crash with empty API", async ({ page }) => {
    await stubApis(page);
    await page.goto("/uz/");
    // BannerOne: shows skeleton while loading, returns null when empty.
    // Either way, no crash and header remains visible.
    await expect(page.getByRole("banner")).toBeVisible();
    // The section should not produce a JS error boundary fallback.
    const errorBoundary = page.locator("text=Something went wrong");
    await expect(errorBoundary).toHaveCount(0);
  });

  // A3.3 — book sections render without crash (empty)
  test("book sections render without crash on empty data", async ({ page }) => {
    await stubApis(page);
    await page.goto("/uz/");
    // Page should load without 500 or white screen
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // Header still present (not replaced by error boundary)
    await expect(page.getByRole("banner")).toBeVisible();
  });

  // A3.7 — dynamic footer loaded
  test("footer is present after page load", async ({ page }) => {
    await stubApis(page);
    await page.goto("/uz/");
    // Footer is dynamically imported — wait for it
    await expect(page.locator("footer")).toBeVisible({ timeout: 5000 });
  });
});
