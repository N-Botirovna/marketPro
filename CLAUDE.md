# Kitobzor Frontend — Senior Frontend Engineer Guide

Next.js 15 App Router (JavaScript). `../back-end/` REST API'si bilan ishlaydi. Hozirgi asosiy maqsad: **mobil-responsive moslashtirish**. Boshqa work (perf, bug-fix, i18n cleanup) parallel.

## 1. Doimiy qoidalar (senior FE engineer mindset)

1. **Mobile-first, har doim.** Yangi komponent yozsangiz **xs (mobil)dan boshlang**, keyin md/lg/xl uchun override. `col-12 col-md-6 col-lg-4` — to'g'ri; `col-lg-4` yolg'iz — noto'g'ri. MUI'da `sx={{ width: { xs: '100%', md: '50%' } }}` patterni.

2. **Fixed height/width yo'q.** `style={{ height: 380 }}`, `style={{ width: 1200 }}` kabi inline o'lcham qo'shilmasin. Image conteyner uchun `aspect-ratio` yoki `min-height` + `max-height`. Mavjud joylarda topganda — fix qiling.

3. **3 ta style system'ni aralashtirmang.**
   - **Yangi komponent:** MUI v9 `sx` props yoki SCSS module. Bootstrap class'lar legacy uchun.
   - **Legacy komponent (Bootstrap):** Bootstrap responsive class'larini qo'shing (`d-md-block`, `col-*`). Yangi SCSS rule ochmang, hatto SCSS file'lardan ham olisroq turing.
   - **MUI komponent:** `sx` + theme breakpointlar. `MaterialThemeProvider.jsx`'ni o'qing.
   - **H-11 freeze policy (Phase 3, 2026-05):** yangi komponentlarda Bootstrap utility'lar (`col-md-*`, `d-flex`, `btn-primary`, …) **qo'shilmaydi**. Legacy fayllar tuzatilmasa ham OK, ammo yangi fayl yoki katta refactor o'rnida MUI `sx` yoki theme'ni tanlang. Migration tartibi: `HeaderOne` → `FooterOne` → `BannerOne` → card'lar → form'lar. ESLint orqali avtomatik tutib bera olmadik (regex juda shovqinli — har bir mavjud fayl ham ogohlantirardi); code review birinchi to'siq.

4. **jQuery yangi kodga kirmaydi.** Mavjud jQuery'ga asoslangan plugin (slick-carousel, isotope-layout, wowjs, select2) sindirsangiz, **React-native alternative** bilan almashtiring (Embla/Swiper, CSS grid, IntersectionObserver, MUI Autocomplete).

5. **HTTP `src/lib/http.js`'dan boshqa joydan emas.** `fetch` to'g'ridan-to'g'ri ishlatmang. Service file `src/services/<domain>.js` yozing, u `http`'ni chaqiradi. Cache TTL'ni `http.js:10-27` mapidan tekshiring va kerak bo'lsa qo'shing.

6. **localStorage'ga komponentdan tegmang.** `src/utils/storage.js` orqali. Auth uchun esa `useAuth()` hook + `src/services/auth.js`.

7. **Komponentlar uchun `"use client"` faqat kerak bo'lganda.** Hook ishlatasizmi, event handler kerakmi, `useState`/`useEffect`/`useRouter` chaqiryapsizmi — `"use client"` qo'ying. Aks holda Server Component'da qoldiring (bundle kichik bo'ladi). Hozirgi loyihada juda ko'p komponent ortiqcha `"use client"`'da.

8. **next-intl `Link` ishlatish majburiy.** `next/link`'dan emas, `@/i18n/navigation`'dan. Aks holda locale prefix tushib qoladi.

9. **API kontrakt — backendni o'qib turing.** `../back-end/CLAUDE.md` § "API conventions". Response envelope: `data.result.results` (paginated), `data.result` (single), `data.result + code` (error). Yangi endpoint qo'shilsa, **avval** `src/config/index.js`'ga URL, **keyin** `src/services/<domain>.js`'da normalizatsiya.

10. **Test qoplamasi nol — bu bug.** Yangi feature bilan kamida bittadan **smoke test** (Playwright tavsiya etiladi) yoki **manual test plan PR description'da**. UI test'siz "done" yo'q.

11. **Lint majburiy.** `npm run lint` (Next.js ESLint). PR'dan oldin yashil bo'lsin. Senior task: `.eslintrc` ni explicit qiling va `import/order`, `react-hooks/exhaustive-deps` rule'larini yoqing.

12. **Console.log production'da tushiriladi** (`next.config.js:30-35` `removeConsole`). Lekin development uchun emoji-prefiksli log (`📦`, `🔄`, `❌`) kelishuv — yangisini qo'shsangiz shu pattern'ga moslang.

13. **Hydration mismatch'ga sabab bo'ladigan kod**:
    - `Date.now()`, `Math.random()`, `localStorage`, `window` SSR fazasida — `useEffect` ichida yoki `dynamic(() => ..., { ssr: false })`.
    - `suppressHydrationWarning` faqat root-level `<body>` (mavjud `layout.jsx:46`)'da — komponentlar darajasida ishlatmang.

14. **Image domain whitelist.** Yangi rasm hosti qo'shilsa, `next.config.js:14-27` `remotePatterns`'ga qo'shing, aks holda `<Image>` ishlamaydi.

15. **`NEXT_PUBLIC_*` env variable** — bundle ichida ko'rinadi. Hech qachon secret qo'ymang.

## 2. Stack (tasdiqlangan versiyalar)

| Paket                               | Versiya                                                                                                                                        | Eslatma                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `next`                              | 15.0.2                                                                                                                                         | App Router                                                  |
| `react`                             | 18                                                                                                                                             | (peer dep)                                                  |
| `next-intl`                         | 4.4.0                                                                                                                                          | Locale-prefixed routing (uz/ru/en)                          |
| `@mui/material`                     | **9.0.1**                                                                                                                                      | (eski CLAUDE.md "v7" deb yozgan — noto'g'ri edi)            |
| `@mui/icons-material`               | 9.0.1                                                                                                                                          |                                                             |
| `@emotion/react`, `@emotion/styled` | MUI peer                                                                                                                                       | CSS-in-JS                                                   |
| `bootstrap`                         | 5.3.3                                                                                                                                          | SCSS orqali to'liq import                                   |
| `axios`                             | 1.11.0                                                                                                                                         | Custom wrapper: `src/lib/http.js`                           |
| `sass`                              | 1.71.1                                                                                                                                         | dev dep                                                     |
| `@fullhuman/postcss-purgecss`       | 8.0.0                                                                                                                                          | Prod CSS optimization                                       |
| `typescript`                        | 5.9.3                                                                                                                                          | **Konfiguratsiya bor, lekin kod JS** — yangi fayllar ham JS |
| Legacy plugins                      | `jquery@4.0.0`, `slick-carousel@1.8.1`, `react-slick@0.30.2`, `isotope-layout@3.0.6`, `wowjs@1.1.3`, `select2@4.1.0-rc.0`, `animate.css@4.1.1` | Yangi kodga kirmaydi                                        |
| `@phosphor-icons/react`             | 2.1.10                                                                                                                                         | Icon library                                                |

Node engine `package.json`'da specified emas — Node 18+ tavsiya etiladi.

## 3. Buyruqlar

```bash
npm install
npm run dev       # :3000
npm run build     # production build (PurgeCSS + removeConsole faollashadi)
npm start         # production server
npm run lint      # next lint (default rules — config yo'q)
```

**Avtomatik test runner yo'q.** Yangi smoke test qo'shsangiz Playwright/Vitest joriy qiling.

## 4. Repo layout

```
front-end/
├── src/middleware.js             # next-intl locale matcher + section redirects (community → community/all)
├── next.config.js                # image domains, headers, compiler, experimental.optimizePackageImports
├── postcss.config.mjs            # PurgeCSS prod-only, safelist Bootstrap/slick/AOS
├── jsconfig.json                 # @/ → src/
├── tsconfig.json                 # mavjud, ammo JS ishlatiladi
├── src/
│   ├── app/[locale]/             # App Router (LOCALE PREFIX MAJBURIY)
│   │   ├── layout.jsx            # async — locale validate, providers, ProtectedRoute, ConditionalHeader
│   │   ├── page.jsx              # home — server component, dynamic imports below-fold
│   │   ├── loading.jsx           # Preloader spinner
│   │   ├── globals.scss          # Bootstrap selective import + project SASS layers
│   │   ├── performance.css       # content-visibility, will-change, reduced-motion
│   │   ├── font.css              # @font-face
│   │   ├── (auth)/
│   │   │   ├── layout.jsx        # passthrough (auth pages — no header)
│   │   │   └── login/page.jsx
│   │   ├── about-us/, contact/, faq/, policies/
│   │   ├── books/                    # redirect to community/all
│   │   ├── community/[type]/page.jsx # tab: all, following, popular (middleware redirects /community → /community/all)
│   │   ├── book-details/[id]/page.jsx
│   │   ├── shops/                    # shop listing
│   │   ├── user/[id]/                # public user profile
│   │   ├── vendor/, vendor-two/, vendor-two-details/  # legacy template
│   │   ├── account/page.jsx
│   │   └── wishlist/page.jsx
│   ├── components/               # ~56 fayl flat + profile/ subdirectory (product-details/ deleted)
│   ├── config/index.js           # API_BASE_URL + API_ENDPOINTS dict
│   ├── lib/http.js               # axios instance: cache TTL map, dedup, JWT refresh queue
│   ├── services/                 # auth, books, shops, categories, regions, banners, posts, orders, products, vendors, comments
│   ├── hooks/                    # useAuth, useLike, useToast, ... (lokal hook'lar)
│   ├── utils/                    # storage.js (localStorage wrapper), locale helpers
│   ├── i18n/                     # routing.js (locales: uz/ru/en), request.js (server config), navigation.js (Link/redirect)
│   ├── messages/                 # uz.json (707), en.json (703), ru.json (703)
│   └── helper/                   # Animation, BootstrapInit, ColorInit, Countdown, Preloader, QuantityControl, RouteScrollToTop, ScrollToTopInit
├── public/assets/                # template assets (images/, sass/, css/, webfonts/)
├── AUTH_SYSTEM_FIXED.md          # arxiv — auth refactor tarixi
├── FLICKERING_FIX_FINAL.md       # arxiv — hydration flicker yechilishi
├── PERFORMANCE_OPTIMIZATIONS.md  # arxiv — perf optimizatsiyalar ro'yxati
├── PROTECTED_ROUTE_FIX.md        # arxiv — ProtectedRoute redesign
└── TOKEN_REFRESH_FIX.md          # arxiv — 401 refresh queue logic
```

**`@/` path alias** `src/`'ga ishora qiladi (`jsconfig.json`). Har doim alias orqali import qiling: `import http from "@/lib/http"`.

## 5. Routing

- **Locale prefix invariant**: `localePrefix: 'always'` (`src/i18n/routing.js:1-7`). `/about` mavjud emas — faqat `/uz/about`, `/ru/about`, `/en/about`. Middleware (`src/middleware.js`) bo'sh prefixni redirect qiladi (`matcher: /((?!api|_next|_vercel|.*\\..*|assets).*)`). `SECTION_DEFAULTS` map'dagi yo'llar uchun index yo'q bo'lsa, middleware default tabga 307 redirect qiladi (masalan `/uz/community` → `/uz/community/all`).
- **Root layout async** (`src/app/[locale]/layout.jsx:1-60`): locale validation, message import, `NextIntlClientProvider`, `ProtectedRoute`, `ConditionalHeader`, `suppressHydrationWarning` body'da.
- **Server vs Client components:**
  - Layout — server.
  - `page.jsx` — odatda server (data fetch, metadata), klient komponentlarni ichida render qiladi.
  - Komponentlar — aksariyat `"use client"` (hook va event handlerlar uchun).
- **Error boundaries:** `src/app/[locale]/error.jsx` (locale-level), `src/app/global-error.jsx` (root fallback), `src/app/[locale]/not-found.jsx`. All wired to `captureException()` (Sentry).
- **Dynamic routes:** `book-details/[id]`, `user/[id]`. Legacy `/product-details` removed in Phase 7.

## 6. i18n (next-intl)

- **Locales**: `['uz', 'en', 'ru']`. Default: `uz`.
- **`routing.js`**: server tomonda config.
- **`request.js`**: per-request message loader, locale invalid bo'lsa default'ga fallback.
- **`navigation.js`**: `Link`, `redirect`, `usePathname` re-exporti — barchasi locale-aware.
- **Message files**:
  - `uz.json`, `en.json`, `ru.json` — 578 keys each (sinxron, `npm run i18n:check` bilan enforced).
- **Yangi key qo'shganda 3 ta faylga ham qo'shing**. `npm run i18n:check` drift'ni topadi va CI'da fail bo'ladi (`scripts/check-i18n.mjs`).
- **Pluralization** (`{count, plural, one {# book} other {# books}}`) yoqilgan ICU MessageFormat orqali.

## 7. HTTP & services

### `src/lib/http.js` (228 lines)

Axios instance:

- `baseURL` = `process.env.NEXT_PUBLIC_API_BASE_URL` || `https://api.kitobzor.uz/`.
- `timeout` 20s, `withCredentials: false`.

**Request interceptor** (lines 61-120):

- `Authorization: Bearer ${localStorage['auth_token']}`.
- `Accept-Language: ${currentLocale}`.
- **Per-endpoint cache TTL** (`lines 10-27`):
  - `/regions/` 24h
  - `/categories/` 1h
  - `/books/` 10m
  - `/auth/`, `/orders/`, `/profile/` 0 (cache yo'q)
- **Cache key**: `${url}?${params}::${locale}::${authSuffix(token)}` (token'ning oxirgi 12 belgisi auth discriminator).
- **In-flight request dedup** — bir xil URL+params parallel bo'lsa, bir xil promise return qilinadi.

**Response interceptor** (lines 130-225):

- Muvaffaqiyatli GET → cache'ga yozadi (`{data, timestamp}`).
- **401 → token refresh queue**:
  - Birinchi 401: `POST /api/v1/auth/refresh/` urinadi.
  - `isRefreshing` flag bilan concurrent refresh oldini oladi.
  - Refresh fail: `clearHttpCache()` + `clearAuthStorage()` + locale-aware login'ga redirect.
  - Failed request'lar refresh tugaguncha kutadi, keyin yangi token bilan replay.
- Xato wrap: `error.normalized = { status, message, data }`.

**Yangi endpoint qo'shilganda:**

1. `src/config/index.js:API_ENDPOINTS`'ga URL qo'shing.
2. `src/services/<domain>.js`'da function yozing — `data.result?.results || data.results || []` patterni bilan normalize qiling.
3. Cache TTL kerak bo'lsa `http.js:10-27`'da mapping qo'shing.
4. **Mutation (POST/PATCH/DELETE) muvaffaqiyatli bo'lsa, related cache'ni qo'lda invalidate qiling.** Hozir avtomatik invalidation yo'q (gap). Yangi mutatsiyada `clearHttpCache(prefix)` chaqiring.

### `src/services/` inventari (16 fayl, 793 line)

| Service                                                                           | TTL'li GET           | Mutation                                      |
| --------------------------------------------------------------------------------- | -------------------- | --------------------------------------------- |
| `auth.js`                                                                         | `/me/` 0             | login, refresh, logout, register, OTP request |
| `books.js`                                                                        | `/books/` 10m        | create, like/unlike, comments CRUD            |
| `categories.js`                                                                   | `/categories/` 1h    | —                                             |
| `regions.js`                                                                      | `/regions/` 24h      | —                                             |
| `shops.js`                                                                        | `/shops/` (qo'shing) | create                                        |
| `banners.js`                                                                      | `/banners/` 30m      | —                                             |
| `posts.js`, `comments.js`, `orders.js`, `products.js`, `vendors.js`, `contact.js` | turli                | turli                                         |

## 8. Auth

**Token storage** (`src/utils/storage.js:1-123`):

- localStorage keys: `auth_token`, `refresh_token`, `token_expires_at`, `user_data`, `login_time`.
- `clearAuthStorage()` — barchasini tozalaydi.
- `getCurrentLocale()` — URL → localStorage → browser → 'uz' fallback chain.
- SSR-safe (`typeof window` check).

**Auth hook** (`src/hooks/useAuth.js:1-118`):

- State: `{ isAuthenticated, isLoading, token, logout, refreshAuth }`.
- Mount paytida: refresh token expired? logout. Access token expired? refresh. Otherwise authenticated.
- Abort ref — komponent unmount bo'lsa async ish bekor qilinadi.

**JWT helpers** (`src/services/auth.js`):

- `getJwtExpiry(token)` — `exp` claim'ni decode qiladi.
- `isTokenExpired()` — `token_expires_at` vs `Date.now()`.
- `isRefreshTokenExpired()` — 5 daqiqalik grace period.
- **Login OTP-based**: `requestOtp({phone_number})` → `loginWithPhoneOtp({phone_number, otp_code})`.

**ProtectedRoute** (`src/components/ProtectedRoute.jsx:1-77`):

- Root layout'da o'rab turuvchi komponent.
- `useLayoutEffect` — sinxron auth check (flash yo'q).
- `PUBLIC_PAGES` ro'yxati (`login`, `register`, `forgot-password`) auth check'dan o'tib ketadi.
- Refresh token bor, lekin access yo'q bo'lsa — async refresh, spinner ko'rsatadi.
- Refresh fail → `router.push('/login')` (locale-aware).

**Tarixiy fix hujjatlar** (root'da, hali tirik):

- `AUTH_SYSTEM_FIXED.md` — JWT + OTP refactor tarixi.
- `TOKEN_REFRESH_FIX.md` — 401 queue logikasi tafsilotlari.
- `PROTECTED_ROUTE_FIX.md` — ProtectedRoute redesign motivlari.
- `FLICKERING_FIX_FINAL.md` — hydration flicker (Preloader, ConditionalHeader).
- `PERFORMANCE_OPTIMIZATIONS.md` — dynamic imports, performance.css, image sizing.

Bularni o'chirmang — context manbasi sifatida saqlanadi. Lekin **fakt manbasi shu CLAUDE.md**.

## 9. Style system (eng katta og'riq nuqtasi)

3 ta system birga yashaydi:

### 1) Bootstrap 5.3

- `globals.scss:1-22`'da selective import (functions, variables, grid, utilities, buttons, forms, modal, navbar, dropdown, card).
- Breakpointlar: `xs <576 / sm ≥576 / md ≥768 / lg ≥992 / xl ≥1200 / xxl ≥1400`.
- Legacy komponentlar Bootstrap ishlatadi (HeaderOne, FooterOne, BannerOne, BookCard).

### 2) MUI v9

- Emotion + theme `MaterialThemeProvider.jsx`.
- Yangi komponentlar uchun afzallik beriladi.
- Responsive: `sx={{ display: { xs: 'none', md: 'block' }, p: { xs: 2, md: 4 } }}`.

### 3) Custom SCSS

- `globals.scss` (49 line) — layer organization (`abstracts/`, `components/`, `layout/`, `utilities/`, `extras`).
- `public/assets/sass/` — template scaffolding.
- **Yangi SCSS rule qo'shishdan oldin** Bootstrap utility yoki MUI `sx` bilan hal qila olasizmi ko'ring.

### PurgeCSS (`postcss.config.mjs`)

- Production-only.
- **Safelist**: Bootstrap state class'lari (`modal`, `dropdown`, `show`, `fade`, `collapse`), slick, AOS, custom utilities.
- Production'da yangi class JSX'da qo'shilsa, safelist'ga qo'shilmaganligi sababli yo'qolib ketishi mumkin — safelist regex'ni tekshiring (`postcss.config.mjs:5-27`).

### Performance optimizations (`performance.css`)

- `content-visibility: auto` — kartochka va image'lar offscreen render'sini "abstract box" qiladi.
- `will-change` — slider va hover joylari uchun.
- `@media (prefers-reduced-motion)` — accessibility.

## 10. Komponentlar (`src/components/`)

~56 fayl flat (bitta kichik papka: `profile/`). `product-details/` papkasi Phase 7'da olib tashlandi. Asosiy kategoriyalar:

### Hamma sahifada (touch once, fix everywhere)

- **HeaderOne.jsx** (21KB) — search, category dropdown, location dropdown, mobile menu, like counter, login/logout. Scroll effect (>150px). `d-lg-block d-none` / `d-lg-none d-block` desktop/mobile toggles.
- **FooterOne.jsx** (7.2KB) — newsletter, links, contact.
- **BottomFooter.jsx** (586B) — copyright bar.
- **ConditionalHeader.jsx** — login sahifalarida header'ni yashiradi.
- **ProtectedRoute.jsx** — auth gating.

### Kitob kartochkasi

- **BookCard.jsx** — `col-12 col-sm-6 col-md-6 col-lg-4 col-xxl-3` grid; thumbnail `aspectRatio: '3 / 4'` (Phase 5 done). Link target: `/book-details/${id}` (Phase 7 migrated).

### Slider/legacy

- **BannerOne.jsx** — react-slick + `dynamic({ ssr: false })`. `aspectRatio: '16 / 7'` + clamp typography (Phase 5).
- **BannerThree.jsx**, **HotDealsOne.jsx**, **ShortProductOne.jsx**, **RecommendedOne.jsx**, **TestimonialOne.jsx** — slick-based, `ssr: false`. NewArrivalTwo deleted in Phase 7.
- Slick remount on breakpoint via `<Slider key={useViewportBucket()} ...>` (workaround for jQuery slick's lack of resize-awareness).

### Modal forms (Bootstrap + FieldError + mapValidationError + useDraftStorage)

- **BookCreateModal.jsx** — 744 LOC; uses `useDraftStorage` for 24h auto-resume on new-book flow.
- **PostCreateModal.jsx**, **SellerRegistrationModal.jsx** — same pattern (FieldError + mapValidationError).
- All three have `modal-fullscreen-md-down` for mobile UX.
- **MaterialCategoryDropdown.jsx**, **MaterialLocationDropdown.jsx** — Autocomplete-like dropdowns.
- **MaterialThemeProvider.jsx** — theme + palette + typography overrides.

### Vendor / shop sahifalari

- **VendorTwo.jsx** — `/vendor-two` route, search results target (HeaderOne search'i shu yerga yo'naltiradi).
- **VendorTwoDetails.jsx**, **VendorTwoSideBar.jsx** — `/vendor-two-details` route.
- **VendorsList.jsx** — `/vendor` route.
- **TopVendorsOne.jsx** — home + AboutUs'da ishlatiladi.
- VendorsListTwo deleted in Phase 7 (zero importers).

### Profil

- **ProfileDashboard.jsx**, **ProfileForm.jsx**, **UserProfile.jsx**, **UserPublicProfile.jsx**, **Account.jsx**.

### Breadcrumb va h.k.

- **Breadcrumb.jsx**, **BreadcrumbTwo.jsx**, **BreadcrumbThree.jsx**, **BreadcrumbImage.jsx** — 4 ta variant, bittasini saqlab qolish refactor task'i.

### Form / input

- **AuthLogin.jsx**, **Contact.jsx** — vanilla state, **schema validatsiyasi yo'q**. Field-level errors via `<FieldError />` + `mapValidationError` (Phase 3). AuthLogin honors `?next=` query for post-login redirect.

### Mayda

- **Toast.jsx**, **Spin.jsx**, **LanguageSwitcher.jsx**, **CounterSection.jsx**, **FaqSection.jsx**, **StepsSection.jsx**, **WhyBecomeSeller.jsx**, **WishListSection.jsx**.

## 11. Konfiguratsiya fayllari

| Fayl                                       | Asosiy nuqtalar                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.js`                           | Image: AVIF/WebP, `remotePatterns: ['api.kitobzor.uz']`, SVG sandbox; `removeConsole` prod'da (error/warn saqlanadi); `reactStrictMode: false`; `experimental.optimizePackageImports` (MUI, slick, axios, React tree-shaking); **security headers** (CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, HSTS prod-only) `/(.*)` source'da; static asset 1y cache |
| `postcss.config.mjs`                       | PurgeCSS prod-only, safelist + custom hyphenated class extractor                                                                                                                                                                                                                                                                                                                                              |
| `src/middleware.js`                        | next-intl middleware + community redirect; matcher API/\_next/\_vercel/assets dan tashqari                                                                                                                                                                                                                                                                                                                    |
| `jsconfig.json`                            | `@/` alias                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tsconfig.json`                            | TS configured, kod JS                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/config/env.js`                        | Runtime env validator: `getApiBaseUrl()` prod'da `NEXT_PUBLIC_API_BASE_URL` yo'q bo'lsa **throw qiladi**; dev'da `http://localhost:8000/` fallback + warning. `getSentryDsn()`, `getSentryEnvironment()`, `getSentryRelease()`, `getSupportPhone()` ham shu yerda                                                                                                                                             |
| `src/config/index.js`                      | Faqat `env.js` orqali env'lardan o'qiydi (silent fallback yo'q)                                                                                                                                                                                                                                                                                                                                               |
| `sentry.{client,server,edge}.config.js`    | `@sentry/nextjs` auto-instrumentation init. DSN bo'sh bo'lsa no-op. `tracesSampleRate: 0.1` (bot bilan parity)                                                                                                                                                                                                                                                                                                |
| `src/lib/sentry.js`                        | Client-side lazy init helper + `captureException(error, context)` wrapper                                                                                                                                                                                                                                                                                                                                     |
| `.eslintrc.json`                           | Explicit Next.js core-web-vitals + react-hooks/exhaustive-deps + import/order + `no-restricted-imports` (next/link → @/i18n/navigation) + `no-restricted-syntax` (`dangerouslySetInnerHTML` warn, sanitize allowlist override)                                                                                                                                                                                |
| `.prettierrc.json` + `.prettierignore`     | Prettier 3 config, ignored: node_modules, .next, public/assets, src/messages                                                                                                                                                                                                                                                                                                                                  |
| `.husky/pre-commit` + `.lintstagedrc.json` | Husky 9 + lint-staged: `eslint --fix && prettier --write` JS/JSX'da, `prettier --write` SCSS/CSS/JSON/MD'da                                                                                                                                                                                                                                                                                                   |

### Env variables

| Variable                                             | Required     | Default                       | Eslatma                                        |
| ---------------------------------------------------- | ------------ | ----------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`                           | **Prod: ha** | dev: `http://localhost:8000/` | Bo'sh bo'lsa prod build/runtime'da `Error`     |
| `NEXT_PUBLIC_SUPPORT_PHONE`                          | yo'q         | `+998 93 834 01 03`           | Footer/Contact uchun                           |
| `NEXT_PUBLIC_SENTRY_DSN`                             | yo'q         | bo'sh                         | Bo'sh bo'lsa Sentry no-op                      |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT`                     | yo'q         | `NODE_ENV`                    | `production` / `staging` / `development`       |
| `NEXT_PUBLIC_SENTRY_RELEASE`                         | yo'q         | bo'sh                         | Git SHA bilan to'ldirilsin (CI)                |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` | yo'q         | NEXT*PUBLIC*\* fallback       | Server/edge config uchun (bundle'ga chiqmaydi) |

## 12. State / data flow

- **Global state library yo'q** (Zustand/Redux/Jotai/Context yo'q).
- Auth state — `useAuth()` hook + localStorage.
- Per-component state — `useState`.
- Cache state — `http.js` Map (in-memory), tab-local.
- Locale state — URL + localStorage.
- **Multi-tab sync (Phase 2)**: `useStorageSync` hook (`src/hooks/useStorageSync.js`) bir tab'dagi logout boshqa tablarni `auth-changed` custom event orqali xabardor qiladi. `useAuth` shu event'ga subscribe bo'ladi.

## 13. Performance

- **Dynamic imports** (`page.jsx`): NewsletterOne, ShippingOne, FaqSection, FooterOne, BottomFooter — below-fold.
- **Slick wrappers** — har birida `dynamic({ ssr: false })`.
- **PurgeCSS** — prod CSS bundle qisqartiriladi.
- **performance.css** — content-visibility + will-change.
- **Bundle analyzer yo'q** — qo'shish tavsiya etiladi (`@next/bundle-analyzer`).
- **Image `sizes`** atributi BannerOne'da to'g'ri (`(max-width: 768px) 100vw, 1200px`); boshqa joylarda audit qiling.

## 14. Forms

- Schema-validation library **yo'q** — manual `useState` + manual error.
- **Error model (Phase 3)**: `mapValidationError(err)` → `{general, fields}`. Render via `<FieldError message={fields.fieldName} />` (`src/components/FieldError.jsx`). DRF envelope + bare + nested shapes handled in `src/lib/errors.js` (`extractFieldErrors`).
- **Draft persistence (Phase 4 partial)**: `useDraftStorage(key, data, opts)` hook (`src/hooks/useDraftStorage.js`) auto-saves form data to localStorage with 24h TTL. BookCreateModal uses it for new-book flow (edit flow is excluded to avoid stale-state bleed). File/Blob fields skipped (not serializable). Cleared on successful submit.
- Future task: full XState refactor of BookCreateModal into step components remains deferred — `useDraftStorage` covers the main UX gap.

## 15. Lint / Test / CI

| Buyruq                            | Maqsad                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                    | `next lint` — `.eslintrc.json` config.                                                                            |
| `npm run lint:fix`                | Auto-fix.                                                                                                         |
| `npm run format` / `format:check` | Prettier 3.                                                                                                       |
| `npm test`                        | Vitest unit testlar (`tests/unit/**/*.test.{js,jsx}`).                                                            |
| `npm run test:watch`              | Watch mode.                                                                                                       |
| `npm run test:coverage`           | v8 coverage, `src/lib/` + `src/utils/`'ga fokus.                                                                  |
| `npm run e2e`                     | Playwright smoke tests (`tests/e2e/**/*.spec.js`). Birinchi marta `npm run e2e:install` chaqirib browser yuklang. |
| `npm run i18n:check`              | uz/ru/en key drift. CI'da fail bo'ladi.                                                                           |

**Test holati**: 43 unit test yashil (errors, mapValidationError, httpResilience, idempotency, useDraftStorage). 3 ta Playwright spec (home, login, mobile-menu) — backend stand-up'siz ishlaydi (`page.route()` bilan mocked).

**Husky/lint-staged**: `npm install` paytida `prepare` script orqali hook o'rnatiladi. Staged JS/JSX'da `eslint --fix && prettier --write`, qolganlarda `prettier --write`.

**CI** (`.github/workflows/ci.yml`):

1. `test` job — i18n:check → lint → vitest → build (har push/PR).
2. `e2e` job — Playwright chromium smoke (push + `e2e` label'lar PR'larida; failure'da report artifact).

**Observability** — `@sentry/nextjs` ulangan. `NEXT_PUBLIC_SENTRY_DSN` bo'sh bo'lsa no-op. `tracesSampleRate: 0.1` (bot bilan parity). Sentry `error.jsx` va `global-error.jsx`'da `captureException` bilan ulanadi.

## 16. Responsive audit (joriy holat)

| Sahifa              | Holati            | Tafsilot                                                                                                                |
| ------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/` home            | ✅                | BannerOne `aspectRatio: 16/7`, BookCard `aspectRatio: 3/4`, slick wrapper'lar `useViewportBucket` bilan remount qiladi. |
| `book-details/[id]` | ✅                | `col-12 col-md-6 col-lg-6`, sanitized description.                                                                      |
| `contact`           | ✅                | `col-12 col-md-7 col-lg-8` + responsive padding.                                                                        |
| `wishlist`          | ✅                | Table cell padding `px-12 px-md-24 px-lg-40` (Phase 5b).                                                                |
| `account`           | OK                | Form input'lar Bootstrap form-control (fluid).                                                                          |
| `(auth)/login`      | ✅                | MUI-friendly, mobile responsive.                                                                                        |
| Modallar            | ✅                | `modal-fullscreen-md-down` (`<992px`'da to'liq ekran).                                                                  |
| `vendor*`           | Audit yetishmagan | Per-page sweep next sprint.                                                                                             |

**Universal blockers — barchasi yopildi**:

- ~~`style={{ height: 380 }}` (BannerOne)~~ → `aspectRatio: 16/7`.
- ~~`style={{ height: '220px' }}` (BookCard)~~ → `aspectRatio: 3/4`.
- Slick resize-awareness → `key={useViewportBucket()}` remount (`src/hooks/useViewportBucket.js`).
- ~~`col-lg-*` only patterns~~ → `col-12 col-md-* col-lg-*`.

HeaderOne mobile drawer (<992px) `body.body-no-scroll` scroll lock bilan. `aspect-3-4`, `aspect-16-7`, `aspect-4-3` utility classlari `globals.scss`'da.

**Tuzatish strategiyasi**:

1. Chrome DevTools Device Mode'da test (360, 414, 768, 1024, 1440).
2. Inline fixed o'lcham → `aspect-ratio` + `min-height: 0`.
3. Slick → Embla yoki Swiper React (resize-aware).
4. `col-lg-*` only → `col-12 col-md-6 col-lg-4`.

## 17. Sharp edges

1. ~~**`reactStrictMode: false`** — double-render bug'larni yashiradi.~~ → Phase 3'da yoqildi (`next.config.js:11`). Yangi effect cleanup bug'lari endi development'da topiladi.
2. **`suppressHydrationWarning` on body** — barcha mismatch'larni yashiradi.
3. ~~`product-details/page.jsx` legacy~~ → Phase 7'da olib tashlandi.
4. **Vendor pages**: `/vendor`, `/vendor-two`, `/vendor-two-details` — hali template-stage; `/vendor-two` search target. Per-page mobile audit yetishmagan.
5. **Cache invalidation manual** — yangi book yaratish `/books/` cache'ni TTL (10m) gacha eski tutadi.
6. **`isRefreshing` flag global module-level** — multi-instance bo'lsa race. Hozir yagona client uchun OK; multi-tab sync uchun `useStorageSync` qo'shildi.
7. ~~**`PERFORMANCE_OPTIMIZATIONS.md` mavjud lekin sinxronlanmagan**~~ → Phase 5 (L-3)'da arxiv `*_FIX.md` fayllari `docs/archive/`'ga ko'chirildi. Fakt manbasi hali ham shu CLAUDE.md.
8. ~~`.env*` `.gitignore`'da faqat `.env*.local`~~ → tuzatildi: `.env`, `.env.local`, `.env.production` ignored, `.env.example` allowlisted.
9. ~~`NEXT_PUBLIC_API_BASE_URL` default `api-dev.kitobzor.uz`~~ → `getApiBaseUrl()` (`src/config/env.js`) endi prod'da throw qiladi; default yo'q.
10. ~~**Phosphor icon CDN** (unpkg) — preconnect bor, lekin CDN tushib qolsa fallback yo'q.~~ → Phase 0 (H-12)'da `@phosphor-icons/web` paketi self-host qilindi (`layout.jsx` `import "@phosphor-icons/web/regular"`). CSP'da unpkg endi yo'q.
11. **Console.log ko'p** — `removeConsole` prod'da o'chiradi (error/warn saqlanadi). Yangi kodga `if (process.env.NODE_ENV === 'development')` wrapper qo'ying.
12. **OpenTelemetry/Prisma webpack warning** — `@sentry/nextjs` Node integration'i tirsiqlanadi. Faqat warning, build'ga ta'sir qilmaydi.
13. ~~**`Idempotency-Key` header FE'da yuboriladi, BE'da hozircha ignore qilinadi**~~ → Phase 2 (H-7)'da `utils.middleware.IdempotencyMiddleware` qo'shildi: 24h Redis dedup, faqat 2xx javoblar cache'lanadi, replay'da `X-Idempotency-Replay: true` header keladi.
14. **BookCreateModal 744 LOC** — `PLAN_BOOKCREATEMODAL_SPLIT.md`'da to'liq split rejasi tayyor (Phase 5 deferred). `useDraftStorage` UX gap'ini yopdi, lekin code organization gap qoldi.
15. **JWT in localStorage (C-4)** — Phase 0'da mitigatsiya: CSP qattiqlandi (`unpkg.com` olib tashlandi, `dangerouslyAllowSVG=false`), Phase 1'da serverda logout endpoint refresh tokenni blacklist qiladi (FE `logoutUser()` shu yo'lga ko'chdi). To'liq httpOnly cookie migratsiyasi `PLAN_HTTPONLY_AUTH.md`'da deferred.
16. **`X-Request-ID` correlation ID** (Phase 2 H-18) endi har bir mutation'da yuboriladi (`http.js:90-104`). Yangi servis qo'shsangiz, axios `config.headers["X-Request-ID"]` o'rnatish kerak emas — interceptor avtomatik qo'shadi.

## 18. Backend bilan kelishuv

`../back-end/CLAUDE.md` § 13 ham o'qing. Qisqacha:

1. Endpoint kerak bo'lsa Swagger'da tekshiring: `http://localhost:8000/api/schema/swagger-ui/` (admin login).
2. Endpoint yo'q yoki noto'g'ri javob bersa — `src/services/`'da workaround qilmang, backendga issue tashlang.
3. PR commit message'da `API:` prefix bilan kontrakt o'zgarishini ko'rsating.

## 19. Yangi feature qo'shish — checklist

1. **Branch oching**: `feature/<short-name>` yoki `fix/<bug>`.
2. **Backend endpoint** mavjudligini tekshiring (Swagger).
3. **`src/config/index.js`** — URL.
4. **`src/services/<domain>.js`** — function. Response normalize. Mutation: `withIdempotency()` config qo'shing.
5. **HTTP cache TTL** (`src/lib/http.js:18-35`) yangi pattern uchun kerak bo'lsa qo'shing.
6. **Komponent yozing** — mobil-first, MUI `sx` yoki Bootstrap `col-12 col-md-* col-lg-*`. Inline fixed o'lcham yo'q.
7. **Form xato**: `mapValidationError(err)` + `<FieldError message={fieldError('name')} />`. `alert()` ishlatmang.
8. **Foydalanuvchi HTML**: `sanitizeHtml()` (`src/lib/sanitize.js`) orqali, keyin `dangerouslySetInnerHTML` (`.eslintrc` allowlist).
9. **i18n keys** — `uz/en/ru.json` uchovida. `npm run i18n:check` ishga tushirib drift'ni tekshiring.
10. **Unit test** — `tests/unit/<name>.test.js`. Lib/utility kod uchun majburiy.
11. **`npm run lint && npm test && npm run i18n:check && npm run build`** yashil.
12. **3 breakpoint test**: 360px / 768px / 1440px (Playwright yoki Chrome Device Mode).
13. **`CLAUDE.md`'ni yangilang** agar yangi konvensiya kirgizgan bo'lsangiz.
