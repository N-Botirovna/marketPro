# A7 — Account & Wishlist (manual test plan)

Routes: `/[locale]/account` (protected), `/[locale]/wishlist` (protected).
Both redirect to `/login?next=...` via `ProtectedRoute` when unauthenticated.

Key files: `src/components/ProfileDashboard.jsx`, `src/components/WishListSection.jsx`, `src/components/profile/ProfileTabs.jsx`, `src/config/index.js` (PROTECTED_PAGES).

Pre-conditions: `npm run dev` on `:3000`. Backend on `:8000`.

Status legend: `[ ]` not run · `[P]` pass · `[F]` fail · `[S]` skipped

---

## A7.1 Unauthenticated redirects

| URL                       | Expected                               |
| ------------------------- | -------------------------------------- |
| `/uz/account` (no token)  | Client redirect → `/uz/login?next=...` |
| `/uz/wishlist` (no token) | Client redirect → `/uz/login?next=...` |

Result: `[ ]` — covered in A2.4

---

## A7.2 WishList — unauthenticated gate UI

| Step                                                      | Expected                                               |
| --------------------------------------------------------- | ------------------------------------------------------ |
| Load `/uz/wishlist` without token (before redirect fires) | `"Sevimlilarni ko'rish uchun kiring"` text + login CTA |

Result: `[ ]`

---

## A7.3 WishList — authenticated, empty

| Step                      | Expected                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| Logged in, no liked books | `"Sevimlilar bo'sh"` + `"Hozircha yoqtirgan kitoblaringiz yo'q"` |

Result: `[ ]`

---

## A7.4 WishList — authenticated, books present

| Step                               | Expected                                                   |
| ---------------------------------- | ---------------------------------------------------------- |
| `getLikedBooks()` returns 1+ books | BookCard grid renders                                      |
| Click BookCard                     | → `/uz/book-details/<id>`                                  |
| Toggle heart on card               | Book removed from list (isLiked=false drops it from state) |

Result: `[ ]`

---

## A7.5 Account — loading state

| Step                                   | Expected                                        |
| -------------------------------------- | ----------------------------------------------- |
| Authenticated, slow `/api/v1/auth/me/` | `Spin` + `"Ma'lumotlar yuklanmoqda..."` visible |

Result: `[ ]`

---

## A7.6 Account — profile renders

| Step                                     | Expected                            |
| ---------------------------------------- | ----------------------------------- |
| `GET /api/v1/auth/me/` returns user data | Name, region visible in ProfileHero |
| Tabs: kitoblarim / arxiv                 | Both tabs switch content            |
| "Kitob qo'shish" button                  | Opens BookCreateModal               |
| Edit profile button                      | Opens ProfileEditModal              |

Result: `[ ]`

---

## A7.7 Account — SSR metadata

| Check             | Expected                                 |
| ----------------- | ---------------------------------------- |
| `<title>`         | "Mening profilim — Kitobzor"             |
| `robots: noindex` | `<meta name="robots" content="noindex">` |

Result: `[ ]`

---

## A7.8 Wishlist SSR metadata

| Check             | Expected                                 |
| ----------------- | ---------------------------------------- |
| `<title>`         | "Saralanganlar — Kitobzor"               |
| `robots: noindex` | `<meta name="robots" content="noindex">` |

Result: `[ ]`

---

## A7.9 Responsive layout

| Viewport       | Expected                          |
| -------------- | --------------------------------- |
| 360px account  | Single-column profile info        |
| 360px wishlist | BookCard `col-12` (single column) |

Result: `[ ]`

---

## Notes

---

## Run 1 — 2026-05-26, local dev (Django @ :8000, Next @ :3000)

| Case                                      | Status | Evidence                                                                    |
| ----------------------------------------- | ------ | --------------------------------------------------------------------------- |
| A7.1 account redirect (unauthenticated)   | [P]    | Playwright — waitForURL(/login/)                                            |
| A7.1 wishlist redirect (unauthenticated)  | [P]    | Playwright — waitForURL(/login/)                                            |
| A7.2 wishlist login-gate                  | [P]    | ProtectedRoute fires before WishListSection gate — page redirects to /login |
| A7.3 wishlist empty state (authenticated) | [P]    | "Sevimlilar bo'sh" visible                                                  |
| A7.4 wishlist renders BookCard            | [P]    | book title + book-details link visible                                      |
| A7.5 account loading spinner              | [P]    | Spin component visible during blocked API                                   |
| A7.6 account profile renders name         | [P]    | "Ali" text visible after getUserProfile() resolves                          |
| A7.6 account tabs visible                 | [P]    | .profile-tabs\_\_btn visible                                                |
| A7.7 account noindex + title              | [P]    | "Mening profilim", robots=noindex                                           |
| A7.8 wishlist noindex + title             | [P]    | "Saralanganlar", robots=noindex                                             |
| A7.9 wishlist no h-scroll on mobile       | [P]    | scrollWidth ≤ 380px at 375px viewport                                       |

### Findings

1. **[Note]** `getUserProfile()` returns `{ user: data }` where `data` is the raw response body — it does NOT use `normalizeItem`. The ME endpoint returns user fields at the top level (not wrapped in `{ result: { ... } }`). Stub must match: `route.fulfill({ json: MOCK_USER })` not `{ result: MOCK_USER }`.
2. **[Note]** `isRefreshTokenExpired()` falls back to `!loginTime` when token is not a real JWT. Test `setAuth()` must also set `login_time` or the hook clears auth immediately on mount.
3. **[Note]** WishList login-gate panel (`"Sevimlilarni ko'rish uchun kiring"`) is a dead-letter UI — `ProtectedRoute` always redirects before `WishListSection` can render it. The panel exists as SSR-safe fallback only.
4. **[OK]** Both pages correctly set `robots: noindex`. Private per-user content stays out of crawlers.

### Verdict

A7: 11/11 Playwright tests pass. Live profile-edit and book archive/tab switch tests require manual browser testing with real auth session.
