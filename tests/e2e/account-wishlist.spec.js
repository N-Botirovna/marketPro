import { test, expect } from "@playwright/test";

const EMPTY = { result: { count: 0, next: null, previous: null, results: [] }, success: true };

const MOCK_USER = {
  id: 1,
  first_name: "Ali",
  last_name: "Valiyev",
  app_phone_number: "+998901234567",
  user_type: "user",
  region: { id: 1, name: "Toshkent" },
  picture: null,
  bio: "Test bio",
};

const MOCK_BOOK = {
  id: 55,
  name: "Liked Kitob",
  name_uz: "Liked Kitob",
  type: "seller",
  price: "25000",
  condition: "good",
  is_liked: true,
  like_count: 1,
  picture: null,
  posted_by: { id: 2, first_name: "Sardor" },
  shop: null,
};

function setAuth(page) {
  return page.evaluate(() => {
    localStorage.setItem("auth_token", "fake_access_token");
    localStorage.setItem("refresh_token", "fake_refresh_token");
    localStorage.setItem("token_expires_at", String(Date.now() + 3_600_000));
    localStorage.setItem("login_time", String(Date.now())); // isRefreshTokenExpired() checks this
    localStorage.setItem("user_data", JSON.stringify({ id: 1, first_name: "Ali" }));
  });
}

function clearAuth(page) {
  return page.evaluate(() => {
    ["auth_token", "refresh_token", "token_expires_at", "user_data"].forEach((k) =>
      localStorage.removeItem(k),
    );
  });
}

async function stubAccountApis(page, { user = MOCK_USER, books = [], likedBooks = [] } = {}) {
  await page.route("**/api/v1/**", (route) => {
    const url = route.request().url();
    // ME endpoint returns user directly (no result wrapper) — getUserProfile() does { user: data }
    if (url.includes("/auth/me/")) return route.fulfill({ json: user });
    if (url.includes("/auth/refresh/"))
      return route.fulfill({ json: { access_token: "new_token", success: true } });
    if (url.includes("/book/liked/"))
      return route.fulfill({
        json: {
          result: { count: likedBooks.length, next: null, previous: null, results: likedBooks },
          success: true,
        },
      });
    if (url.includes("/book/list/"))
      return route.fulfill({
        json: {
          result: { count: books.length, next: null, previous: null, results: books },
          success: true,
        },
      });
    if (url.includes("/shop/list/")) return route.fulfill({ json: EMPTY });
    if (url.includes("/regions/"))
      return route.fulfill({ json: { result: { results: [] }, success: true } });
    return route.fulfill({ json: EMPTY });
  });
}

test.describe("Account & Wishlist (A7)", () => {
  // A7.1 — unauthenticated redirects (detailed coverage in A2; smoke here)
  test("account redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/uz/");
    await clearAuth(page);
    await page.goto("/uz/account");
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("wishlist redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/uz/");
    await clearAuth(page);
    await page.goto("/uz/wishlist");
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  // A7.2 — WishList unauthenticated: ProtectedRoute redirects before gate panel renders
  test("wishlist redirects to login (ProtectedRoute fires before WishListSection gate)", async ({
    page,
  }) => {
    await page.goto("/uz/");
    await clearAuth(page);
    await page.goto("/uz/wishlist");
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  // A7.3 — WishList empty state (authenticated)
  test("wishlist shows empty state when no liked books", async ({ page }) => {
    await stubAccountApis(page, { likedBooks: [] });
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/wishlist");
    await expect(page.locator("text=Sevimlilar bo'sh")).toBeVisible({ timeout: 6000 });
  });

  // A7.4 — WishList renders liked books
  test("wishlist renders BookCard when liked books exist", async ({ page }) => {
    await stubAccountApis(page, { likedBooks: [MOCK_BOOK] });
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/wishlist");
    await expect(page.locator("text=Liked Kitob")).toBeVisible({ timeout: 6000 });
    // BookCard links to book-details
    const bookLink = page.locator(`a[href*="book-details/${MOCK_BOOK.id}"]`).first();
    await expect(bookLink).toBeVisible();
  });

  // A7.5 — Account loading state
  test("account shows spinner while loading profile", async ({ page }) => {
    let resolve;
    const blocker = new Promise((r) => {
      resolve = r;
    });

    await page.route("**/api/v1/**", (route) => {
      const url = route.request().url();
      if (url.includes("/auth/me/"))
        return blocker.then(() => route.fulfill({ json: { result: MOCK_USER, success: true } }));
      if (url.includes("/auth/refresh/"))
        return route.fulfill({ json: { result: { access: "new_token" }, success: true } });
      return route.fulfill({ json: EMPTY });
    });

    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/account");

    // Spinner or loading text should appear before data arrives
    const spinner = page.locator('[class*="spin"], [class*="Spin"]').first();
    const loadingText = page.getByText("Ma'lumotlar yuklanmoqda");
    await expect(spinner.or(loadingText).first()).toBeVisible({ timeout: 4000 });
    resolve();
  });

  // A7.6 — Account renders profile data
  test("account renders user name when authenticated", async ({ page }) => {
    await stubAccountApis(page);
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/account");
    // User name visible in ProfileHero
    await expect(page.locator("text=Ali").first()).toBeVisible({ timeout: 6000 });
  });

  test("account tabs are visible", async ({ page }) => {
    await stubAccountApis(page);
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/account");
    await page.waitForTimeout(2000);
    // ProfileTabs renders "kitoblarim" and "arxiv" buttons
    const tabs = page.locator(".profile-tabs__btn");
    await expect(tabs.first()).toBeVisible({ timeout: 5000 });
  });

  // A7.7 — Account metadata
  test("account page has noindex and correct title", async ({ page }) => {
    await stubAccountApis(page);
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/account", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Mening profilim/);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });

  // A7.8 — Wishlist metadata
  test("wishlist page has noindex and correct title", async ({ page }) => {
    await stubAccountApis(page, { likedBooks: [] });
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/wishlist", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Saralanganlar/);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });

  // A7.9 — Responsive: no horizontal scroll at 375px
  test("wishlist has no horizontal overflow on mobile", async ({ page }) => {
    await stubAccountApis(page, { likedBooks: [MOCK_BOOK] });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/wishlist");
    await expect(page.locator("text=Liked Kitob")).toBeVisible({ timeout: 6000 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(380);
  });
});
