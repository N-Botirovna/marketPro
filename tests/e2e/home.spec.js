import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    // Stub backend so the test doesn't depend on a running Django server.
    await page.route("**/api/v1/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/banners/")) {
        return route.fulfill({ json: { result: { results: [] }, success: true } });
      }
      if (url.includes("/categories/")) {
        return route.fulfill({ json: { result: { results: [] }, success: true } });
      }
      if (url.includes("/regions/")) {
        return route.fulfill({ json: { result: { results: [] }, success: true } });
      }
      if (url.includes("/books") || url.includes("/book/")) {
        return route.fulfill({ json: { result: { results: [], count: 0 }, success: true } });
      }
      return route.fulfill({ json: { result: { results: [] }, success: true } });
    });
  });

  test("uz home renders without crashing", async ({ page }) => {
    const response = await page.goto("/uz/");
    expect(response?.ok()).toBe(true);
    // Header logo is wrapped in <Link aria-label="Kitobzor">; the inner <img>
    // is intentionally decorative (alt=""), so detect it via the labeled link.
    await expect(page.getByRole("link", { name: "Kitobzor" }).first()).toBeVisible();
  });

  test("locale switcher route returns 200 for ru and en", async ({ page }) => {
    for (const locale of ["ru", "en"]) {
      const res = await page.goto(`/${locale}/`);
      expect(res?.status(), `${locale} should load`).toBeLessThan(400);
    }
  });

  test("security headers are present", async ({ request }) => {
    const res = await request.get("/uz/");
    const headers = res.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  });
});
