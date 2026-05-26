import { test, expect } from "@playwright/test";

test.describe("Auth", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ json: { result: { results: [] }, success: true } }),
    );
  });

  // A2.1 — Login page renders
  test("login page renders OTP input", async ({ page }) => {
    const res = await page.goto("/uz/login");
    expect(res?.ok()).toBe(true);
    await expect(page.locator('input[name="otp"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  // A2.4 — ProtectedRoute redirects unauthenticated user
  test("account page redirects to login when unauthenticated", async ({ page }) => {
    // Ensure no auth tokens in localStorage.
    await page.goto("/uz/");
    await page.evaluate(() => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_expires_at");
      localStorage.removeItem("user_data");
    });

    await page.goto("/uz/account");
    // ProtectedRoute runs client-side; wait for redirect to login.
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("wishlist page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/uz/");
    await page.evaluate(() => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_expires_at");
      localStorage.removeItem("user_data");
    });

    await page.goto("/uz/wishlist");
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  // A2.1 — ?next= preserved
  test("login page preserves ?next= param", async ({ page }) => {
    await page.goto("/uz/login?next=/uz/wishlist");
    await expect(page.locator('input[name="otp"]')).toBeVisible();
    expect(page.url()).toContain("next=");
    expect(page.url()).toContain("wishlist");
  });

  // A2.3 — Invalid OTP shows field error (mocked 400 response)
  test("invalid OTP shows field-level error", async ({ page }) => {
    await page.route("**/api/v1/auth/**", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 400,
          json: {
            result: "Kod noto'g'ri yoki muddati o'tgan",
            code: "invalid_otp",
            success: false,
          },
        });
      }
      return route.continue();
    });

    await page.goto("/uz/login");
    await page.fill('input[name="otp"]', "000000");
    await page.click('button[type="submit"]');
    // Error text appears in the UI (either field error or general error).
    const errorLocator = page.locator('[role="alert"], .field-error, [class*="error"]').first();
    await expect(errorLocator).toBeVisible({ timeout: 4000 });
  });
});
