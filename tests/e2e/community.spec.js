import { test, expect } from "@playwright/test";

const EMPTY = { result: { count: 0, next: null, previous: null, results: [] }, success: true };
const EMPTY_LIST = { result: { results: [] }, success: true };

const MOCK_BOOK = {
  id: 101,
  name: "Community Test Kitob",
  name_uz: "Community Test Kitob",
  type: "seller",
  price: "30000",
  condition: "good",
  is_liked: false,
  like_count: 0,
  picture: null,
  posted_by: { id: 2, first_name: "Sardor", region: { name: "Toshkent" } },
  shop: null,
};

async function stubCommunityApis(page, books = []) {
  await page.route("**/api/v1/**", (route) => {
    const url = route.request().url();
    if (url.includes("/regions/")) return route.fulfill({ json: EMPTY_LIST });
    if (url.includes("/book/categories/")) return route.fulfill({ json: EMPTY_LIST });
    if (url.includes("/book/subcategories/")) return route.fulfill({ json: EMPTY_LIST });
    if (url.includes("/book/list/") || url.includes("/book/liked/"))
      return route.fulfill({
        json: {
          result: { count: books.length, next: null, previous: null, results: books },
          success: true,
        },
      });
    return route.fulfill({ json: EMPTY });
  });
}

test.describe("Community page (A5)", () => {
  // A5.1 — all valid types return 200
  for (const type of ["all", "sell", "gift", "exchange", "rent"]) {
    test(`/community/${type} returns 200`, async ({ page }) => {
      await stubCommunityApis(page);
      const res = await page.goto(`/uz/community/${type}`);
      expect(res?.status()).toBeLessThan(400);
      // Breadcrumb visible (SSR)
      await expect(
        page.locator("nav[aria-label], .breadcrumb, [class*='breadcrumb']").first(),
      ).toBeVisible();
    });
  }

  // A5.2 — invalid type → not-found UI
  // Note: Next.js App Router streams HTTP 200 even for notFound() in dev mode.
  // The 404 status only appears in production builds. Test the rendered content instead.
  test("invalid type renders not-found page", async ({ page }) => {
    await stubCommunityApis(page);
    await page.goto("/uz/community/unknown");
    await expect(page.locator("text=Sahifa topilmadi")).toBeVisible({ timeout: 5000 });
  });

  test("numeric type renders not-found page", async ({ page }) => {
    await stubCommunityApis(page);
    await page.goto("/uz/community/123");
    await expect(page.locator("text=Sahifa topilmadi")).toBeVisible({ timeout: 5000 });
  });

  // A5.3 — /community redirects to /community/all (middleware 307)
  test("/community redirects to /community/all", async ({ page }) => {
    // Playwright follows redirects — assert final URL.
    await page.goto("/uz/community");
    expect(page.url()).toContain("/community/all");
  });

  // A5.4 — empty state
  test("shows empty-state message when no books", async ({ page }) => {
    await stubCommunityApis(page, []);
    await page.goto("/uz/community/all");
    // Wait for loading to finish (skeleton disappears)
    await expect(page.locator("text=Filterga mos kitob topilmadi")).toBeVisible({ timeout: 5000 });
  });

  // A5.4 — loading then empty: page doesn't crash during loading state
  test("page stays functional during slow API load", async ({ page }) => {
    let resolve;
    const blocker = new Promise((r) => {
      resolve = r;
    });

    await page.route("**/api/v1/**", (route) => route.fulfill({ json: EMPTY_LIST }));
    await page.route("**/api/v1/book/list/", async (route) => {
      await blocker;
      return route.fulfill({ json: EMPTY });
    });

    await page.goto("/uz/community/all");
    // Header must remain visible during load (no crash / white screen)
    await expect(page.getByRole("banner")).toBeVisible({ timeout: 3000 });
    // Unblock and confirm empty state appears
    resolve();
    await expect(page.locator("text=Filterga mos kitob topilmadi")).toBeVisible({ timeout: 5000 });
  });

  // A5.5 — book list renders BookChatRow
  test("renders book rows when books exist", async ({ page }) => {
    await stubCommunityApis(page, [MOCK_BOOK]);
    await page.goto("/uz/community/all");
    await expect(page.locator("text=Community Test Kitob")).toBeVisible({ timeout: 5000 });
    // Row links to book-details
    const bookLink = page.locator(`a[href*="book-details/${MOCK_BOOK.id}"]`).first();
    await expect(bookLink).toBeVisible();
  });

  // A5.7 — URL query seeds search field
  test("?search= param pre-fills the search input", async ({ page }) => {
    await stubCommunityApis(page);
    await page.goto("/uz/community/all?search=python");
    // Search input should be pre-filled
    const input = page.locator('input[type="text"], input[type="search"]').first();
    await expect(input).toHaveValue("python", { timeout: 3000 });
  });

  // A5.8 — metadata
  test("page title matches type", async ({ page }) => {
    await stubCommunityApis(page);
    await page.goto("/uz/community/all");
    await expect(page).toHaveTitle(/Eldagi barcha kitoblar/);
  });

  test("sell type has correct title", async ({ page }) => {
    await stubCommunityApis(page);
    await page.goto("/uz/community/sell");
    await expect(page).toHaveTitle(/sotiladigan/);
  });
});
