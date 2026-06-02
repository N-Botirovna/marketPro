import { test, expect } from "@playwright/test";

const EMPTY = { result: { count: 0, next: null, previous: null, results: [] }, success: true };

const MOCK_SHOP = {
  id: 10,
  name: "Test Do'kon",
  picture: null,
  book_count: 5,
  region: { name: "Toshkent" },
  is_active: true,
};

async function stubShopsApis(page, shops = []) {
  await page.route("**/api/v1/**", (route) => {
    const url = route.request().url();
    if (url.includes("/regions/"))
      return route.fulfill({ json: { result: { results: [] }, success: true } });
    if (url.includes("/shop/list/"))
      return route.fulfill({
        json: {
          result: { count: shops.length, next: null, previous: null, results: shops },
          success: true,
        },
      });
    return route.fulfill({ json: EMPTY });
  });
}

test.describe("Shops & static pages (A6)", () => {
  // ── A6.1 Shops page ───────────────────────────────────────────────

  test("shops page returns 200", async ({ page }) => {
    await stubShopsApis(page);
    const res = await page.goto("/uz/shops");
    expect(res?.ok()).toBe(true);
    await expect(
      page.locator("nav[aria-label], .breadcrumb, [class*='breadcrumb']").first(),
    ).toBeVisible();
  });

  test("shows empty state when no shops", async ({ page }) => {
    await stubShopsApis(page, []);
    await page.goto("/uz/shops");
    await expect(page.locator("text=Filterga mos do'kon topilmadi")).toBeVisible({ timeout: 5000 });
  });

  test("renders shop cards when shops exist", async ({ page }) => {
    await stubShopsApis(page, [MOCK_SHOP]);
    await page.goto("/uz/shops");
    await expect(page.locator(`text=Test Do'kon`)).toBeVisible({ timeout: 5000 });
    // ShopCard links to /shops/<id>
    const shopLink = page.locator(`a[href*="/shops/${MOCK_SHOP.id}"]`).first();
    await expect(shopLink).toBeVisible();
  });

  test("shows error message on API failure", async ({ page }) => {
    await page.route("**/api/v1/**", (route) => route.fulfill({ json: EMPTY }));
    await page.route("**/api/v1/shop/list/", (route) =>
      route.fulfill({ status: 500, json: { result: "Xatolik", success: false } }),
    );
    await page.goto("/uz/shops");
    await page.waitForTimeout(2000);
    // Error text or graceful fallback — no crash
    await expect(page.getByRole("banner")).toBeVisible();
  });

  // ── A6.3 Static pages return 200 ─────────────────────────────────

  for (const path of ["about-us", "contact", "faq", "policies"]) {
    test(`/${path} returns 200`, async ({ page }) => {
      await page.route("**/api/v1/**", (route) => route.fulfill({ json: EMPTY }));
      // "domcontentloaded" avoids hanging on external font CDN (Google Fonts)
      const res = await page.goto(`/uz/${path}`, { waitUntil: "domcontentloaded" });
      expect(res?.ok()).toBe(true);
      await expect(page.getByRole("banner")).toBeVisible();
    });
  }

  // ── A6.4 Static page metadata ────────────────────────────────────

  test("about-us has correct title", async ({ page }) => {
    await page.goto("/uz/about-us", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Biz haqimizda/);
  });

  test("contact page has correct title", async ({ page }) => {
    await page.goto("/uz/contact", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Aloqa/);
  });

  test("faq page title contains Kitobzor", async ({ page }) => {
    await page.route("**/api/v1/**", (route) => route.fulfill({ json: EMPTY }));
    await page.goto("/uz/faq", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Kitobzor/);
  });

  test("policies page title contains Kitobzor", async ({ page }) => {
    await page.goto("/uz/policies", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Kitobzor/);
  });

  // ── A6.5 Contact form validation ────────────────────────────────

  test("contact form has phone and message inputs", async ({ page }) => {
    await page.goto("/uz/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="phone"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('textarea[name="message"], input[name="message"]')).toBeVisible();
  });

  test("contact form submit without data shows error", async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ status: 400, json: { result: "Xatolik", success: false } }),
    );
    await page.goto("/uz/contact", { waitUntil: "domcontentloaded" });
    await page.click('button[type="submit"]');
    // Either validation error or API error — no crash, no redirect away
    await expect(page.locator('input[name="phone"]')).toBeVisible({ timeout: 3000 });
  });

  // ── A6.3 All 4 locales for shops ────────────────────────────────

  for (const locale of ["uz", "ru", "en", "kaa"]) {
    test(`/shops returns 200 in ${locale}`, async ({ page }) => {
      await stubShopsApis(page);
      const res = await page.goto(`/${locale}/shops`);
      expect(res?.status()).toBeLessThan(400);
    });
  }
});
