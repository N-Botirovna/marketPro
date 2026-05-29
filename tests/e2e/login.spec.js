import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ json: { result: { results: [] }, success: true } }),
    );
  });

  test("renders OTP code input", async ({ page }) => {
    await page.goto("/uz/login");
    // Login is OTP-based: user gets a code from Telegram bot and enters it here.
    await expect(page.locator('input[name="otp"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("honors ?next= for post-login redirect", async ({ page }) => {
    await page.goto("/uz/login?next=/uz/wishlist");
    // Page loads with ?next= intact — consumed on successful login.
    await expect(page.locator('input[name="otp"]')).toBeVisible();
    expect(page.url()).toContain("next=");
    expect(page.url()).toContain("wishlist");
  });
});
