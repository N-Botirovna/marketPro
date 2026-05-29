import { test, expect } from "@playwright/test";

test.describe("Mobile header drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({ json: { result: { results: [] }, success: true } }),
    );
  });

  test("opens the drawer when hamburger is clicked", async ({ page }, testInfo) => {
    // Only run on mobile viewport projects.
    test.skip(!testInfo.project.name.startsWith("mobile-"), "mobile project only");

    await page.goto("/uz/");
    // Hamburger button uses translated aria-label; select by aria-expanded state.
    const hamburger = page.locator("button[aria-expanded]").first();
    await expect(hamburger).toBeVisible();

    await hamburger.click();
    // Drawer becomes .kz-drawer--open when active.
    await expect(page.locator(".kz-drawer.kz-drawer--open")).toBeVisible();
    // Body scroll lock class is added.
    await expect(page.locator("body.body-no-scroll")).toHaveCount(1);
  });
});
