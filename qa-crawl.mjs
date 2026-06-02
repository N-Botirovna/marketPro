/**
 * QA crawler — har bir route'ni desktop+mobil × light+dark da ochib:
 *  - to'liq sahifa skrinshoti oladi (/tmp/kitobzor-qa/<scheme>-<vp>-<name>.png)
 *  - console error/warning, pageerror, va >=400 javoblarni yig'adi
 *  - hammasini /tmp/kitobzor-qa/report.json ga yozadi
 *
 * Auth sahifalar uchun AUTH_TOKEN / AUTH_REFRESH / AUTH_USER env beriladi.
 * Foydalanish:
 *   node qa-crawl.mjs                       # public pages
 *   AUTH_TOKEN=... AUTH_REFRESH=... AUTH_USER='{...}' node qa-crawl.mjs --auth
 */
import { chromium, devices } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.QA_BASE || "http://localhost:3000";
const OUT = "/tmp/kitobzor-qa";
const AUTH_MODE = process.argv.includes("--auth");

fs.mkdirSync(OUT, { recursive: true });

// {name, path, auth}
const ROUTES = [
  { name: "home", path: "/uz" },
  { name: "about-us", path: "/uz/about-us" },
  { name: "contact", path: "/uz/contact" },
  { name: "faq", path: "/uz/faq" },
  { name: "policies", path: "/uz/policies" },
  { name: "community-all", path: "/uz/community/all" },
  { name: "community-popular", path: "/uz/community/popular" },
  { name: "community-following", path: "/uz/community/following" },
  { name: "shops", path: "/uz/shops" },
  { name: "vendor", path: "/uz/vendor" },
  { name: "vendor-two", path: "/uz/vendor-two" },
  { name: "book-details-1", path: "/uz/book-details/1" },
  { name: "book-details-2", path: "/uz/book-details/2" },
  { name: "user-2", path: "/uz/user/2" },
  { name: "login", path: "/uz/login" },
  { name: "account", path: "/uz/account", auth: true },
  { name: "wishlist", path: "/uz/wishlist", auth: true },
];

const SCHEMES = ["light", "dark"];
const VIEWPORTS = [
  { vp: "desktop", opts: { viewport: { width: 1440, height: 900 } } },
  { vp: "mobile", opts: { ...devices["Pixel 5"] } },
];

const report = [];

const browser = await chromium.launch();

for (const scheme of SCHEMES) {
  for (const { vp, opts } of VIEWPORTS) {
    const context = await browser.newContext({ ...opts, colorScheme: scheme });

    // Auth sahifalar uchun localStorage'ni har sahifa ochilishidan oldin to'ldirish.
    if (AUTH_MODE && process.env.AUTH_TOKEN) {
      const expiresAt = Date.now() + 60 * 60 * 1000;
      await context.addInitScript(
        ([token, refresh, user, exp]) => {
          try {
            localStorage.setItem("auth_token", token);
            localStorage.setItem("refresh_token", refresh);
            localStorage.setItem("token_expires_at", String(exp));
            localStorage.setItem("user_data", user);
            localStorage.setItem("login_time", String(Date.now()));
          } catch {}
        },
        [
          process.env.AUTH_TOKEN,
          process.env.AUTH_REFRESH || "",
          process.env.AUTH_USER || "{}",
          expiresAt,
        ],
      );
    }

    for (const route of ROUTES) {
      if (route.auth && !AUTH_MODE) continue;
      if (!route.auth && AUTH_MODE) continue;

      const page = await context.newPage();
      const consoleErrors = [];
      const consoleWarnings = [];
      const pageErrors = [];
      const badResponses = [];

      page.on("console", (msg) => {
        const type = msg.type();
        if (type === "error") consoleErrors.push(msg.text().slice(0, 300));
        else if (type === "warning") consoleWarnings.push(msg.text().slice(0, 200));
      });
      page.on("pageerror", (err) => pageErrors.push(String(err).slice(0, 300)));
      page.on("response", (resp) => {
        const s = resp.status();
        if (s >= 400) badResponses.push(`${s} ${resp.url().slice(0, 160)}`);
      });

      let navStatus = "ok";
      try {
        await page.goto(BASE + route.path, {
          waitUntil: "networkidle",
          timeout: 45000,
        });
      } catch (e) {
        navStatus = "TIMEOUT/ERROR: " + String(e).slice(0, 120);
      }
      await page.waitForTimeout(1200);

      const file = `${scheme}-${vp}-${route.name}.png`;
      try {
        await page.screenshot({ path: path.join(OUT, file), fullPage: true });
      } catch (e) {
        navStatus += " | screenshot-fail: " + String(e).slice(0, 80);
      }

      // Sahifa sarlavhasi + ko'rinadigan h1 (bo'sh sahifa detektori).
      const title = await page.title().catch(() => "");
      const bodyText = (await page.evaluate(() => document.body?.innerText || "").catch(() => "")).slice(0, 120).replace(/\s+/g, " ");

      report.push({
        scheme, vp, route: route.name, path: route.path,
        navStatus, title,
        bodyPreview: bodyText,
        consoleErrors, consoleWarnings: consoleWarnings.slice(0, 8),
        pageErrors, badResponses,
        screenshot: file,
      });

      await page.close();
      process.stdout.write(`✓ ${scheme}/${vp}/${route.name}\n`);
    }
    await context.close();
  }
}

await browser.close();

const reportFile = path.join(OUT, AUTH_MODE ? "report-auth.json" : "report.json");
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
console.log("\nReport:", reportFile, "| screenshots in", OUT);
