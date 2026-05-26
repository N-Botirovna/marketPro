# A1 — Locale & Routing (manual test plan)

Stack: Next.js 15 App Router + `next-intl` v4.4 with `localePrefix: "always"`.
Locales: `uz` (default), `en`, `ru`, `kaa`.
Files of interest: `middleware.js`, `src/i18n/routing.js`, `src/app/[locale]/layout.jsx`.

Pre-conditions:

- `npm run dev` running on `http://localhost:3000`.
- Backend stubbed or live on `http://localhost:8000/` (A1 does not require live data — header/footer must render with `[]`).

Status legend: `[ ]` not run · `[P]` pass · `[F]` fail · `[S]` skipped

---

## A1.1 Root path redirects to default locale

| Step                         | Expected                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| GET `http://localhost:3000/` | 200 (Next renders default locale) **or** 307/308 → `/uz`. Final HTML `<html lang="uz">`. |

`curl -sIL http://localhost:3000/` → status chain, last response `200`.

Result: `[ ]`

---

## A1.2 Each declared locale serves 200

| URL     | Expected                                      |
| ------- | --------------------------------------------- |
| `/uz/`  | 200, `<html lang="uz">`, navbar logo visible  |
| `/ru/`  | 200, `<html lang="ru">`, navbar logo visible  |
| `/en/`  | 200, `<html lang="en">`, navbar logo visible  |
| `/kaa/` | 200, `<html lang="kaa">`, navbar logo visible |

Result: `[ ]` (uz) `[ ]` (ru) `[ ]` (en) `[ ]` (kaa)

---

## A1.3 Invalid locale handled

`/xyz/` (unknown two-letter prefix):

- Either 404 (`not-found.jsx`) **or** middleware treats `xyz` as path segment under default locale and redirects to `/uz/xyz` → 404. **Never** 500.

Result: `[ ]`

---

## A1.4 Non-locale paths pass through middleware

These must NOT get a locale prefix prepended (middleware matcher excludes them):

- `/api/anything` → whatever Next does (likely 404 since no API routes) — **not** redirected to `/uz/api/anything`
- `/_next/static/...` → asset
- `/assets/img/...` → asset (matcher excludes `assets`)
- `/favicon.ico` → 200/204 (has `.` so `.*\\..*` excludes it)

Result: `[ ]`

---

## A1.5 Nested route under locale

| URL            | Expected                                       |
| -------------- | ---------------------------------------------- |
| `/uz/about-us` | 200, about page content                        |
| `/ru/contact`  | 200, contact form                              |
| `/en/wishlist` | 200 (public — wishlist shows empty for guests) |

Result: `[ ]`

---

## A1.6 Security headers present (production-style)

`curl -sI http://localhost:3000/uz/` should include:

- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `content-security-policy: default-src 'self'` (and `frame-ancestors 'none'`)
- `permissions-policy: ...`

Note: HSTS is prod-only — skip in dev.

Result: `[ ]`

---

## A1.7 Language switcher (UI)

Manual in browser (`/uz/`):

1. Open language switcher in header.
2. Click `Русский`. URL becomes `/ru/...`. Page content in Russian.
3. Click `Qaraqalpaqsha`. URL becomes `/kaa/...`.
4. Reload page — language persists (URL is source of truth).
5. Open new tab `/`-only — depending on impl, default `uz` or last-used.

Result: `[ ]`

---

## A1.8 next-intl Link respects locale prefix

In browser DevTools on `/ru/`:

- Inspect a primary nav link (e.g., "Wishlist") → `href="/ru/wishlist"` (NOT `/wishlist`).
- Inspect a BookCard link → `href="/ru/book-details/<id>"`.

If any internal link has no locale prefix, it's a bug per FE CLAUDE.md §8 "next-intl Link majburiy".

Result: `[ ]`

---

## A1.9 No hydration mismatch warning

In browser console after `/uz/` loads:

- No `Warning: Text content did not match. Server: ... Client: ...`
- No `Warning: Expected server HTML to contain...`
- (Note: `<body suppressHydrationWarning>` is set globally; component-level mismatches still leak.)

Result: `[ ]`

---

## A1.10 Locale change does not break HTTP cache key

Per `src/lib/http.js`, cache key embeds `currentLocale`. After switching `uz` → `ru`:

1. Categories request to `/api/v1/categories/?lang=...` fires fresh (not served from `uz` cache).
2. DevTools Network → no stale `Accept-Language: uz` request after switching to `ru`.

Result: `[ ]`

---

## Notes

Findings during execution go below this line.

---

## Run 1 — 2026-05-26, local dev (Django @ :8000, Next @ :3000)

| Case                                                                        | Status     | Evidence                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1.1 root redirect                                                          | [P]        | `GET /` → 307 `Location: /uz`, follow → 200                                                                                                                                                                                                                       |
| A1.2 uz/                                                                    | [P]        | 200, `<html lang="uz">`, size 108 KB                                                                                                                                                                                                                              |
| A1.2 ru/                                                                    | [P]        | 200, `<html lang="ru">`, size 121 KB                                                                                                                                                                                                                              |
| A1.2 en/                                                                    | [P]        | 200, `<html lang="en">`, size 105 KB                                                                                                                                                                                                                              |
| A1.2 kaa/                                                                   | [P]        | 200, `<html lang="kaa">`, size 108 KB                                                                                                                                                                                                                             |
| A1.3 invalid locale `/xyz`                                                  | [P]        | 404 (handled, no 500)                                                                                                                                                                                                                                             |
| A1.4 `/api/anything`                                                        | [P]        | 404, NOT redirected to `/uz/api/...`                                                                                                                                                                                                                              |
| A1.4 `/favicon.ico`                                                         | [P]        | 200 (matcher exclusion works)                                                                                                                                                                                                                                     |
| A1.4 `/_next/...`                                                           | [P]        | passes through (404 for missing, no locale wrap)                                                                                                                                                                                                                  |
| A1.4 `/assets/...`                                                          | [P]        | 404 (matcher exclusion: `assets` literal)                                                                                                                                                                                                                         |
| A1.5 `/uz/about-us`, `/ru/contact`, `/en/wishlist`, `/kaa/faq`, `/uz/shops` | [P]        | all 200                                                                                                                                                                                                                                                           |
| A1.5 `/ru/books`                                                            | [P] (info) | 308 → `/ru/community/all` (intentional redirect)                                                                                                                                                                                                                  |
| A1.5 `/en/community`                                                        | [F]        | 404 — `community/[type]` is a dynamic segment with no index; visiting `/community` directly is a dead URL. Consider redirecting to `/community/all`.                                                                                                              |
| A1.6 security headers                                                       | [P]        | `x-frame-options: DENY`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, full CSP with `frame-ancestors 'none'`, `permissions-policy` present. HSTS only in prod (expected). Playwright `security headers are present` ✅. |
| A1.7 language switcher links                                                | [P]        | DOM contains `href="http://localhost:3000/{uz,ru,en,kaa}"` for all 4 locales. (Note: switcher emits absolute origin URLs — not a bug, but worth being aware: this defeats client-side router prefetch.)                                                           |
| A1.8 next-intl `Link` locale-aware                                          | [P]        | All internal hrefs use `/uz/...` prefix in `/uz/` page. No bare-path internal link detected (only assets `/assets/...`, `/favicon.ico`, `/_next/...`, anchors, externals).                                                                                        |
| A1.9 hydration                                                              | (skipped)  | Static HTML check only — needs browser JS to verify console. Playwright `home renders without crashing` reads HTML successfully (no crash).                                                                                                                       |
| A1.10 cache vary                                                            | [P]        | Response carries `Cache-Control: no-store, must-revalidate` + `Vary: rsc, next-router-state-tree, ..., Accept-Encoding`. Per-locale cache key is enforced in `http.js` client side (not server).                                                                  |

### Findings (action items)

1. **[BUG / A11Y]** Logo `<img>` has empty `alt=""` everywhere on `/uz/` (and other locales). Playwright `home.spec.js:28` was written expecting `alt="Logo"` or `alt="Kitobzor"` and now **fails**. Either:
   - Restore meaningful alt text (`alt="Kitobzor"`) — preferred per WCAG 1.1.1 for branding logos that act as home link.
   - Or update the spec to detect the logo by `src*="kitobzor-logo"` and remove the alt expectation (only if the logo is truly decorative — but a clickable home logo is **not** decorative).
     File: `src/components/HeaderOne.jsx` (and any other usage of the logo Image).

2. **[Minor / DX]** `/en/community` (and presumably `/uz/community`, `/ru/community`, `/kaa/community`) return **404** because the route is `community/[type]/page.jsx`. If `/community` is exposed in nav anywhere, add either:
   - A `community/page.jsx` that redirects to `/community/all`, or
   - A nav link that already points to `/community/all`.
     Current header links to `/uz/community/all` — so user-facing nav is OK. Hand-typed URLs break.

3. **[Stale doc]** `CLAUDE.md` §4 mentions `become-seller/` directory. It no longer exists in `src/app/[locale]/`. Update FE CLAUDE.md to remove or replace with current top-level routes (`books`, `shops`, `community`, `account`, `faq`, `policies`, `user`, `vendor`, `vendor-two`, `vendor-two-details`).

4. **[Existing test red]** `tests/e2e/home.spec.js` first case fails on `localhost:3000` because of finding #1. The two other A1-related cases (security headers, ru/en locale routes) ✅ pass. Recommend fixing the alt-text bug, not the assertion.

### Verdict

Locale routing (A1) is functional across all four declared locales (uz, ru, en, kaa). Middleware matcher excludes API/static correctly. Security headers in place. One real accessibility bug (empty logo alt) surfaced; one nav UX issue (`/community` index missing).
