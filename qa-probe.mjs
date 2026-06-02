import { chromium } from "@playwright/test";
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
async function probe(path, sel = "h1") {
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { missing: true };
    const cs = getComputedStyle(el);
    // walk up to find first non-transparent bg
    let bg = "rgba(0, 0, 0, 0)", n = el;
    while (n && (bg === "rgba(0, 0, 0, 0)" || bg === "transparent")) { bg = getComputedStyle(n).backgroundColor; n = n.parentElement; }
    return { text: el.innerText.slice(0, 25), color: cs.color, ctxBg: bg };
  }, sel);
  await page.close();
  return r;
}
console.log("shops h1 :", JSON.stringify(await probe("/uz/shops")));
console.log("login h1 :", JSON.stringify(await probe("/uz/login")));
console.log("about h1 :", JSON.stringify(await probe("/uz/about-us")));
await browser.close();
