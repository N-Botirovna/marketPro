import { test, expect } from "@playwright/test";

test.describe("Mobile header drawer", () => {
  // Only run on mobile-chromium project.
  test.skip(({ browserName }, testInfo) => {
    return !testInfo.project.name.startsWith("mobile-");
  }, "mobile project only");

  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ json: { result: { results: [] }, success: true } }),
    );
  });

  test("opens the drawer when hamburger is clicked", async ({ page }) => {
    await page.goto("/uz/");
    const hamburger = page.locator('button[aria-label="Open menu"]').first();
    await expect(hamburger).toBeVisible();

    await hamburger.click();
    // Drawer becomes `.active` when open.
    await expect(page.locator(".mobile-menu.active")).toBeVisible();
    // Body scroll lock class is added.
    await expect(page.locator("body.body-no-scroll")).toHaveCount(1);
  });
});
