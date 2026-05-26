# A2 — Auth (manual test plan)

Stack: OTP-based login (Telegram bot → 6-digit code). JWT in localStorage (`auth_token`, `refresh_token`). `useAuth` hook + `ProtectedRoute`.
Files: `src/components/AuthLogin.jsx`, `src/services/auth.js`, `src/hooks/useAuth.js`, `src/components/ProtectedRoute.jsx`, `src/utils/storage.js`.

Pre-conditions:

- `npm run dev` running on `http://localhost:3000`.
- Django backend running on `http://localhost:8000/` (OTP endpoints required for A2.2+; A2.1 can use stubbed).

Status legend: `[ ]` not run · `[P]` pass · `[F]` fail · `[S]` skipped

---

## A2.1 Login page renders correctly

| Step                              | Expected                                                                 |
| --------------------------------- | ------------------------------------------------------------------------ |
| GET `/uz/login`                   | 200, OTP code input visible (`input[name="otp"]`), submit button present |
| GET `/uz/login?next=/uz/wishlist` | Same, URL contains `next=` + `wishlist`                                  |

`curl -sI http://localhost:3000/uz/login` → 200.

Result: `[ ]`

---

## A2.2 OTP login flow (requires live backend + Telegram bot)

| Step                                             | Expected                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| Send `/start` to Telegram bot → get 6-digit code | Code appears in bot chat                                           |
| Navigate `/uz/login`, enter code, submit         | Redirect to home (or `?next=` target)                              |
| Check `localStorage`                             | `auth_token`, `refresh_token`, `token_expires_at`, `user_data` set |
| `GET /uz/account`                                | 200, user profile visible                                          |

Result: `[ ]`

---

## A2.3 Invalid OTP code

| Step                                     | Expected                                   |
| ---------------------------------------- | ------------------------------------------ |
| Enter wrong code (e.g. `000000`), submit | Field-level error visible (not page crash) |
| Enter expired code                       | Field-level error visible                  |

Result: `[ ]`

---

## A2.4 ProtectedRoute — unauthenticated access

| URL                              | Expected                                                               |
| -------------------------------- | ---------------------------------------------------------------------- |
| `/uz/account` (unauthenticated)  | Redirect to `/uz/login?next=%2Fuz%2Faccount`                           |
| `/uz/wishlist` (unauthenticated) | Server returns 200 (SSR), client-side redirect to `/uz/login?next=...` |

Result: `[ ]` (account) `[ ]` (wishlist)

---

## A2.5 Token refresh (access token expired)

| Step                                                                   | Expected                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------ |
| Let `auth_token` expire (or manually clear `token_expires_at` to past) | On next API call: transparent refresh, no logout |
| `POST /api/v1/auth/refresh/` succeeds                                  | New token stored, request replayed               |

Result: `[ ]`

---

## A2.6 Token refresh failure → logout

| Step                                         | Expected                                            |
| -------------------------------------------- | --------------------------------------------------- |
| Set `refresh_token` to expired/invalid value | On next protected API call: redirect to `/uz/login` |
| Check `localStorage`                         | `auth_token`, `refresh_token` cleared               |

Result: `[ ]`

---

## A2.7 Logout

| Step                                     | Expected                         |
| ---------------------------------------- | -------------------------------- |
| Click logout button (header avatar menu) | `localStorage` auth keys cleared |
| Page redirects to `/uz/` or `/uz/login`  | No 401 loop                      |
| Back button → `/uz/account`              | Redirected to login again        |

Result: `[ ]`

---

## A2.8 Multi-tab sync

| Step                                    | Expected                                                       |
| --------------------------------------- | -------------------------------------------------------------- |
| Open `/uz/account` in Tab 1 (logged in) | Profile visible                                                |
| Log out in Tab 2                        | Tab 1 should detect `auth-changed` event and redirect to login |

Result: `[ ]`

---

## Notes

Findings during execution go below this line.

---

## Run 1 — 2026-05-26, local dev (Django @ :8000, Next @ :3000)

| Case                                      | Status | Evidence                                                                                      |
| ----------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| A2.1 login renders OTP input              | [P]    | Playwright `auth.spec.js` — input[name="otp"] + submit button visible                         |
| A2.1 ?next= preserved                     | [P]    | Playwright — URL contains `next=` + `wishlist`                                                |
| A2.2 OTP live login                       | [S]    | Requires Telegram bot active (not tested in this run)                                         |
| A2.3 invalid OTP field error              | [P]    | Playwright (mocked 400) — error visible in UI                                                 |
| A2.4 /account redirect (unauthenticated)  | [P]    | Playwright — waitForURL(/login/) succeeds                                                     |
| A2.4 /wishlist redirect (unauthenticated) | [P]    | Playwright — waitForURL(/login/) succeeds. Both /account and /wishlist are in PROTECTED_PAGES |
| A2.5 token refresh transparent            | [S]    | Requires live tokens (not tested in this run)                                                 |
| A2.6 refresh fail → logout                | [S]    | Requires live tokens (not tested in this run)                                                 |
| A2.7 logout                               | [S]    | Requires live session (not tested in this run)                                                |
| A2.8 multi-tab sync                       | [S]    | Manual browser test needed                                                                    |

### Findings (action items)

1. **[Note]** `PROTECTED_PAGES = ["/account", "/wishlist"]` in `src/config/index.js`. Original A2.4 plan incorrectly marked `/wishlist` as public — corrected. Both pages redirect to login for unauthenticated users.
2. **[OK]** `ProtectedRoute` redirects happen client-side (via `router.push("/login")`), so HTTP status is always 200 from server. This is expected behavior for client-side SPA auth gates.
3. **[OK]** No regression: A2 Playwright tests + all prior tests (home, login, mobile-menu) green — 21/21 pass.

### Verdict

A2 automatable cases pass. Live OTP/token-refresh flows require manual testing with active Telegram bot session.
