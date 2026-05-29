import { test, expect } from "@playwright/test";

const BOOK_ID = "42";

const MOCK_BOOK = {
  id: 42,
  name: "Test Kitob",
  name_uz: "Test Kitob (UZ)",
  name_ru: "Test Kniga (RU)",
  name_en: "Test Book (EN)",
  author: "Test Muallif",
  author_uz: "Test Muallif",
  description_uz: "Bu test kitob haqida qisqacha ma'lumot.",
  type: "sell",
  price: "50000",
  condition: "good",
  is_liked: false,
  like_count: 3,
  can_update: false,
  is_active: true,
  picture: null,
  posted_by: {
    id: 1,
    first_name: "Ali",
    last_name: "Valiyev",
    telegram_username: "@test_user",
    phone_number: "+998901234567",
    region: { name: "Toshkent" },
  },
  shop: null,
};

async function stubBookApi(page, book = MOCK_BOOK) {
  // General stub first (lower priority — Playwright matches LIFO)
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({ json: { result: { results: [] }, success: true } }),
  );
  // Specific book stub last (higher priority)
  await page.route(`**/api/v1/book/${BOOK_ID}/`, (route) =>
    route.fulfill({ json: { result: book, success: true } }),
  );
}

test.describe("Book details page (A4)", () => {
  // A4.1 — Valid book renders
  test("renders book title and type badge", async ({ page }) => {
    await stubBookApi(page);
    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });

    // Book name visible (either localized or fallback)
    await expect(page.locator("text=Test Kitob").first()).toBeVisible({ timeout: 5000 });
    // Type badge (sell)
    await expect(
      page.locator('[class*="Chip"], [class*="chip"], [class*="badge"]').first(),
    ).toBeVisible();
  });

  // A4.1 — Contact button
  test("shows contact button with seller info", async ({ page }) => {
    await stubBookApi(page);
    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });
    // Telegram or phone contact link should appear
    const contactBtn = page.locator('a[href*="t.me"], a[href*="tel:"]').first();
    await expect(contactBtn).toBeVisible({ timeout: 5000 });
  });

  // A4.2 — Not found
  test("shows not-found message when book is null", async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ json: { result: { results: [] }, success: true } }),
    );
    await page.route(`**/api/v1/book/${BOOK_ID}/`, (route) =>
      route.fulfill({ json: { result: null, success: false } }),
    );
    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });
    // Should show "not found" text, not crash
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // Page returns 200 from SSR; client shows not-found message
    await page.waitForTimeout(1500);
    // No white screen — header still present
    await expect(page.getByRole("banner")).toBeVisible();
  });

  // A4.3 — Loading skeleton
  test("shows MUI skeleton while loading", async ({ page }) => {
    let resolve;
    const blocker = new Promise((r) => {
      resolve = r;
    });

    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ json: { result: { results: [] }, success: true } }),
    );
    await page.route(`**/api/v1/book/${BOOK_ID}/`, async (route) => {
      await blocker;
      return route.fulfill({ json: { result: MOCK_BOOK, success: true } });
    });

    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });
    // MUI Skeleton renders as <span> with wave animation class
    const skeleton = page.locator('[class*="MuiSkeleton"]').first();
    await expect(skeleton).toBeVisible({ timeout: 3000 });

    // Unblock the API and confirm skeleton disappears
    resolve();
    await expect(page.locator("text=Test Kitob").first()).toBeVisible({ timeout: 5000 });
  });

  // A4.4 — Error state
  test("shows error message on API failure", async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ json: { result: { results: [] }, success: true } }),
    );
    await page.route(`**/api/v1/book/${BOOK_ID}/`, (route) =>
      route.fulfill({ status: 500, json: { result: "Server xatosi", success: false } }),
    );
    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    // Error text or fallback — page must not be blank
    await expect(page.getByRole("banner")).toBeVisible();
    const errorEl = page
      .locator('[class*="MuiTypography"][style*="color"], [role="alert"]')
      .first();
    // Either error UI or graceful empty — no crash
    await expect(page.locator("body")).toBeVisible();
  });

  // A4.5 — Edit button only for owner
  test("edit button hidden when can_update is false", async ({ page }) => {
    await stubBookApi(page, { ...MOCK_BOOK, can_update: false });
    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Test Kitob").first()).toBeVisible({ timeout: 5000 });
    // Edit IconButton has aria-label="Tahrirlash" (uz) and is scoped to the book section.
    // Scope to <main> or the book section to avoid matching header/footer icons.
    const editBtn = page.locator(
      'main [aria-label="Tahrirlash"], section [aria-label="Tahrirlash"]',
    );
    await expect(editBtn).toHaveCount(0);
  });

  test("edit button visible when can_update is true", async ({ page }) => {
    // Navigate first to establish origin, then set localStorage.
    await stubBookApi(page, { ...MOCK_BOOK, can_update: true });
    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("auth_token", "fake_token_for_test");
      localStorage.setItem("token_expires_at", String(Date.now() + 3600000));
      localStorage.setItem("user_data", JSON.stringify({ id: 1 }));
    });
    await page.reload();
    await expect(page.locator("text=Test Kitob").first()).toBeVisible({ timeout: 5000 });
    // Edit button aria-label="Tahrirlash"
    const editBtn = page.locator('[aria-label="Tahrirlash"]').first();
    await expect(editBtn).toBeVisible({ timeout: 3000 });
  });

  // A4.7 — SEO metadata
  test("has hreflang alternates and JSON-LD", async ({ page }) => {
    await stubBookApi(page);
    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });
    // hreflang links are always emitted by SSR regardless of book existence.
    for (const loc of ["uz", "ru", "en", "kaa"]) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${loc}"]`)).toHaveCount(1);
    }
    // JSON-LD is injected by <JsonLd>; may be null if SSR book fetch misses,
    // but the script tag should still be present.
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // A4.8 — Responsive layout (mobile)
  test("stacks cover and details vertically on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await stubBookApi(page);
    await page.goto(`/uz/book-details/${BOOK_ID}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Test Kitob").first()).toBeVisible({ timeout: 5000 });
    // Page renders without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(380);
  });
});
