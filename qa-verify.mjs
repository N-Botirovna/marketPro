import { chromium } from "@playwright/test";
const BASE = "http://localhost:3000";
const OUT = "/tmp/kitobzor-qa";
const targets = process.argv.slice(2); // e.g. shops:/uz/shops home:/uz
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
for (const t of targets) {
  const [name, path] = t.split("=");
  const page = await ctx.newPage();
  try { await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 }); } catch {}
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/verify-dark-${name}.png`, fullPage: true });
  await page.close();
  console.log("✓", name);
}
await browser.close();
