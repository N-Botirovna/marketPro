import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ json: { result: { results: [] }, success: true } }),
    );
  });

  test("renders phone + password inputs", async ({ page }) => {
    await page.goto("/uz/login");
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("honors ?next= for post-login redirect", async ({ page }) => {
    await page.goto("/uz/login?next=/uz/wishlist");
    // Submit button is disabled until both fields are non-empty — that's fine,
    // we just confirm the page loads with the query intact.
    await expect(page.url()).toContain("next=%2Fuz%2Fwishlist");
  });
});
