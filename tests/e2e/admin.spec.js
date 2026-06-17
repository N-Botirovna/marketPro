import { test, expect } from "@playwright/test";

const STAFF_USER = {
  id: 1,
  first_name: "Boss",
  user_type: "user",
  role: "admin",
  is_staff: true,
};
const NORMAL_USER = { ...STAFF_USER, role: "simple", is_staff: false };

const SUMMARY = {
  result: {
    days: 30,
    kpis: {
      total_users: 100,
      new_users: 5,
      active_books: 50,
      new_books: 3,
      total_shops: 4,
      banned_books: 1,
      total_books: 51,
    },
    series: [{ date: "2026-06-01", new_users: 1, new_books: 1, active_users: 2 }],
  },
  success: true,
};

function setAuth(page) {
  return page.evaluate(() => {
    localStorage.setItem("auth_token", "fake_access_token");
    localStorage.setItem("refresh_token", "fake_refresh_token");
    localStorage.setItem("token_expires_at", String(Date.now() + 3_600_000));
    localStorage.setItem("login_time", String(Date.now()));
  });
}

function mockApi(page, user) {
  return page.route("**/api/v1/**", (route) => {
    const url = route.request().url();
    if (url.includes("/auth/me/")) return route.fulfill({ json: user });
    if (url.includes("/analytics/dashboard/summary/")) return route.fulfill({ json: SUMMARY });
    return route.fulfill({ json: { result: {}, success: true } });
  });
}

test.describe("admin dashboard route gate", () => {
  test("staff user sees the dashboard", async ({ page }) => {
    await mockApi(page, STAFF_USER);
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/admin");
    await expect(page.getByText("Boshqaruv paneli")).toBeVisible({ timeout: 10_000 });
  });

  test("non-staff user is redirected away from /admin", async ({ page }) => {
    await mockApi(page, NORMAL_USER);
    await page.goto("/uz/");
    await setAuth(page);
    await page.goto("/uz/admin");
    await page.waitForURL((url) => !url.pathname.includes("/admin"), { timeout: 10_000 });
    expect(page.url()).not.toContain("/admin");
  });
});
