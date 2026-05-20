# Kitobzor Frontend — Deployment Plan

Production deploy checklist for the Next.js 15 frontend. The site is meant
to ship as an installable **web app (PWA)**, anonymous-readable, with
Telegram-driven sign-in via the bot's ticket flow.

This document is the source of truth for what needs to be in place before
hitting "deploy". Pair it with `back-end/CLAUDE.md` for the API side.

---

## 1. Pre-deploy gate (must be green)

```bash
cd front-end
npm ci
npm run lint              # zero new errors vs. baseline
npm run i18n:check        # 3 locales sync
npm test                  # vitest, 45/45
npm run e2e               # Playwright smoke (requires `e2e:install` first)
npm run build             # production build
```

Then **manually verify** at 3 breakpoints (360 / 768 / 1440):

- `/uz/`, `/uz/shops`, `/uz/shops/[id]`, `/uz/community/sell`
- `/uz/account` while logged in
- `/uz/auth/auto?ticket=…` (use a fresh ticket from the bot)
- Dark mode toggle
- Anonymous nudge after 60s (clear `localStorage` first)

---

## 2. Environment variables (production `.env.production` or hosting UI)

| Variable                                             | Required    | Example                    | Notes                              |
| ---------------------------------------------------- | ----------- | -------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`                           | **yes**     | `https://api.kitobzor.uz/` | trailing slash mandatory           |
| `NEXT_PUBLIC_SUPPORT_PHONE`                          | no          | `+998 93 834 01 03`        | footer/contact                     |
| `NEXT_PUBLIC_SENTRY_DSN`                             | recommended | `https://…@sentry.io/…`    | `getSentryDsn()` no-ops when empty |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT`                     | recommended | `production`               | for filtering                      |
| `NEXT_PUBLIC_SENTRY_RELEASE`                         | yes (CI)    | git SHA                    | enables release tagging            |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` | optional    | mirror of above            | server/edge bundles                |

> **Never** put secret keys behind `NEXT_PUBLIC_*` — they ship in the bundle.

Validator in `src/config/env.js` throws in prod if the API base URL is
missing — fail-fast by design.

---

## 3. Web App (PWA) — what's left to wire

Goal: users can install the site to their home screen, see a splash
screen, and offline-browse cached pages.

### 3.1 Add `public/manifest.webmanifest`

```json
{
  "name": "Kitobzor",
  "short_name": "Kitobzor",
  "description": "Kitoblar marketplace — Telegram-style book sharing & trade",
  "start_url": "/uz/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#299E60",
  "lang": "uz",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["books", "shopping"]
}
```

### 3.2 Generate icons

```bash
# need: ImageMagick + a 1024×1024 master in public/assets/images/logo/icon-master.png
cd front-end
mkdir -p public/icons
convert public/assets/images/logo/icon-master.png -resize 192x192 public/icons/icon-192.png
convert public/assets/images/logo/icon-master.png -resize 512x512 public/icons/icon-512.png
convert public/assets/images/logo/icon-master.png -resize 512x512 -gravity center -extent 512x512 public/icons/icon-maskable-512.png
convert public/assets/images/logo/icon-master.png -resize 180x180 public/apple-touch-icon.png
convert public/assets/images/logo/icon-master.png -resize 32x32 public/favicon-32x32.png
convert public/assets/images/logo/icon-master.png -resize 16x16 public/favicon-16x16.png
```

### 3.3 Wire manifest in `layout.jsx`

Add inside `<head>`:

```jsx
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<meta name="theme-color" content="#299E60" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

### 3.4 Service worker (offline cache)

Recommend `next-pwa` (works with App Router as of 5.x):

```bash
npm i --save next-pwa
```

`next.config.js` wrap:

```js
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/v1\/(book|shop|base)\//,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "api-readonly" },
    },
  ],
});

module.exports = withPWA(nextConfig);
```

> Skip caching `/api/v1/auth/*`, `/api/v1/stories/`, `/api/v1/auth/me/` — they're user-specific or short-lived.

### 3.5 Install prompt UI (later)

`next-pwa` exposes the `beforeinstallprompt` event. We can add a header
icon ("Install app") that fires `deferredPrompt.prompt()`. Not blocking
for first deploy.

---

## 4. SEO & metadata

- Each route already has `generateMetadata` returning locale-aware title +
  description (PoliciesPage, FaqPage, BooksPage, CommunityPage,
  ShopsPage, ShopDetailPage). Verify when you add new routes.
- Add `public/robots.txt`:

  ```
  User-agent: *
  Allow: /
  Disallow: /uz/auth/auto
  Disallow: /uz/account
  Sitemap: https://kitobzor.uz/sitemap.xml
  ```

- Add `app/sitemap.js` (dynamic) — emit URLs for `/uz/`, `/shops`,
  `/community/{all|sell|gift|exchange|rent}`, `/policies`, `/faq`, plus
  per-book detail URLs pulled at build/revalidate time.

- Open Graph + Twitter cards: extend `metadata` in root `layout.jsx`
  with `openGraph` + `twitter` objects (logo + 1200×630 hero).

---

## 5. Security headers

Currently set via `next.config.js` `headers()`. Verify in production:

```bash
curl -sI https://kitobzor.uz/uz/ | grep -i 'content-security-policy\|x-frame\|strict-transport\|x-content-type'
```

Must include:

- `Content-Security-Policy` covering `api.kitobzor.uz`, `unpkg.com`
  (Phosphor icons), `fonts.googleapis.com`, `fonts.gstatic.com`,
  Sentry ingest domain.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  (prod only).
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 6. Performance budget

Target Lighthouse scores on `/uz/` (mobile, 3G):

- Performance ≥ 80
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95
- PWA ≥ 90

Watch for:

- **First Load JS** per route — keep `<200 kB` shared+route. Account is
  currently 264 kB (MUI + wizard). Consider `dynamic(() => …, {ssr:false})`
  for the BookCreateModal / StoryViewer if more pages start importing them.
- **LCP image** — BannerOne should preload its hero image.
- **No-CDN images** — `next/image` `remotePatterns` whitelist must include
  the production media host (`api.kitobzor.uz` or a CDN).

---

## 7. Hosting options (pick one)

### Option A — Vercel (recommended, fastest)

Pros: free tier, Next.js native, automatic preview deploys, edge CDN.

Steps:

1. Connect `front-end/` repo to Vercel.
2. Framework preset: **Next.js**.
3. Root directory: `front-end`.
4. Build command: `npm run build`.
5. Output: default (`.next`).
6. Env vars: paste from Section 2.
7. Custom domain → `kitobzor.uz` (or `www.`). Vercel auto-issues SSL.
8. (Optional) `vercel.json` with `regions: ["fra1"]` for EU proximity to
   Uzbekistan vs. default US.

Tradeoff: server functions execute on Vercel — your `/api/v1/*` calls
still hit `api.kitobzor.uz` directly (no proxy needed). CSP must allow
the backend domain.

### Option B — Self-host with Docker + Nginx

Pros: full control, lives next to the Django backend, single domain.

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
```

Compose entry (extend `back-end/docker-compose.yml`):

```yaml
frontend:
  build:
    context: ../front-end
    dockerfile: Dockerfile.frontend
  env_file:
    - ../front-end/.env.production
  expose:
    - "3000"
  depends_on:
    - django
  restart: unless-stopped
```

Nginx route `kitobzor.uz` → `frontend:3000`, `api.kitobzor.uz` → `django:8000`.

### Option C — Vercel for FE + existing Docker stack for BE

Cleanest split. Recommended if Vercel free tier is acceptable.

---

## 8. CI/CD pipeline (GitHub Actions outline)

`.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy frontend
on:
  push:
    branches: [main]
    paths:
      - "front-end/**"
      - ".github/workflows/deploy-frontend.yml"

jobs:
  test:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: front-end } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          { node-version: "20", cache: "npm", cache-dependency-path: front-end/package-lock.json }
      - run: npm ci
      - run: npm run i18n:check
      - run: npm run lint
      - run: npm test
      - run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.NEXT_PUBLIC_API_BASE_URL }}
          NEXT_PUBLIC_SENTRY_DSN: ${{ secrets.NEXT_PUBLIC_SENTRY_DSN }}
          NEXT_PUBLIC_SENTRY_RELEASE: ${{ github.sha }}

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: front-end
          vercel-args: "--prod"
```

(Drop the deploy job if you self-host; replace with `ssh + docker compose up -d`.)

---

## 9. Sentry release tagging

In `next.config.js` add the Sentry wizard's plugin (or `withSentryConfig`)
so each build uploads source maps tagged with `NEXT_PUBLIC_SENTRY_RELEASE`.
Then post-deploy:

```bash
sentry-cli releases finalize "$GIT_SHA"
sentry-cli releases deploys "$GIT_SHA" new -e production
```

---

## 10. Cutover checklist

1. **DNS**: `kitobzor.uz` → frontend host (or Vercel CNAME).
2. **API CORS**: confirm Django `CORS_ALLOWED_ORIGINS` includes
   `https://kitobzor.uz` (settings.py).
3. **Backend deploy first** (story endpoint, ticket-login,
   AllowAny permission change, bot menu) — `make migrate` for the Story
   table.
4. **Bot deploy**: restart the bot service so new handlers register.
5. **Frontend deploy**: push to `main`, watch CI.
6. **Smoke verify**:
   - Anonymous browse home → community → shop detail
   - Telegram bot → "Saytga avtomatik kirish" → opens site logged in
   - "Sayt uchun kod olish" → enter on `/login` manually
   - Post a book through the wizard
   - Story create/view
   - Wishlist after login
7. **Roll back plan**: Vercel keeps last 3 deployments — promote prior in
   the dashboard. For Docker: keep `:previous` image tag and `docker
compose up -d frontend` after retagging.

---

## 11. Telegram Mini App (future)

The site is ready to also work as a Telegram Mini App (`bot.setMenuButton`
with `web_app.url`). Open questions:

- Detect `window.Telegram.WebApp` and skip the OTP/ticket prompt — use
  `initDataUnsafe` instead.
- Match Telegram colour scheme via `themeParams.bg_color` (already have
  CSS vars — read `webApp.themeParams` and override).
- Use `webApp.openLink(...)` for outbound links so they open in Telegram's
  browser.

Not blocking for first deploy; adds 1-2 days of polish.

---

## 12. Open follow-ups (post-deploy)

- `vendor-two`, `vendor-two-details` legacy redirect kept; remove after 6
  months of analytics confirms no traffic.
- `VendorTwo.jsx`, `VendorTwoDetails.jsx`, `VendorTwoSideBar.jsx` dead
  code — schedule a cleanup PR.
- Email/SMS notification preferences screen (none yet).
- Multi-photo book listings (model+UI change).
- Story reactions / views / replies (additive).
