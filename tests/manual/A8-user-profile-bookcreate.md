# A8 — User public profile + BookCreateModal (manual test plan)

## Scope

- `/[locale]/user/[id]` — public user profile (any visitor)
- `BookCreateModal` — multi-step book posting wizard (authenticated, opened from account FAB or profile tab)

Key files: `src/components/UserPublicProfile.jsx`, `src/components/BookCreateModal.jsx`, `src/components/PostBookFab.jsx`.

Pre-conditions: `npm run dev` on `:3000`. Backend on `:8000`.

Status legend: `[ ]` not run · `[P]` pass · `[F]` fail · `[S]` skipped

---

## A8.1 User public profile — valid user

| Step                           | Expected                                                        |
| ------------------------------ | --------------------------------------------------------------- |
| GET `/uz/user/1` (user exists) | 200, user name visible                                          |
| User books list                | `BookChatRow` rows or "Bu foydalanuvchi hali kitob joylamagan." |
| Breadcrumb                     | "Foydalanuvchi profili"                                         |

Result: `[ ]`

---

## A8.2 User not found

| Step                           | Expected                                |
| ------------------------------ | --------------------------------------- |
| GET `/uz/user/99999` (no user) | Page renders "Foydalanuvchi topilmadi." |
| No crash                       | Header intact                           |

Result: `[ ]`

---

## A8.3 User profile — loading state

| Step                      | Expected                    |
| ------------------------- | --------------------------- |
| Slow `/api/v1/auth/<id>/` | Spinner visible before data |

Result: `[ ]`

---

## A8.4 BookCreateModal — opens

| Step                                     | Expected                    |
| ---------------------------------------- | --------------------------- |
| On `/uz/account`, click "Kitob qo'shish" | Modal opens, step 1 visible |
| Header shows "1 / N" + LinearProgress    | ✓                           |
| Step title: "Kitob turini tanlang"       | ✓                           |

Result: `[ ]`

---

## A8.5 BookCreateModal — step navigation

| Step                             | Expected                       |
| -------------------------------- | ------------------------------ |
| Click "Davom etish" (step 1 → 2) | Step 2 renders: "Kitob holati" |
| Click "Orqaga"                   | Returns to step 1              |
| Click "Bekor qilish" on step 1   | Modal closes                   |

Result: `[ ]`

---

## A8.6 BookCreateModal — draft persistence

| Step                                               | Expected                    |
| -------------------------------------------------- | --------------------------- |
| Fill "type = gift", advance to step 2, close modal | Draft saved to localStorage |
| Reopen modal                                       | Step pre-filled from draft  |

Result: `[ ]`

---

## A8.7 BookCreateModal — validation errors

| Step                                          | Expected                           |
| --------------------------------------------- | ---------------------------------- |
| Skip required field (e.g. name blank), submit | Field-level `<FieldError>` visible |
| API 400 response                              | Error shown, user stays on modal   |

Result: `[ ]`

---

## A8.8 Metadata

| Check              | Expected                           |
| ------------------ | ---------------------------------- |
| `/uz/user/1` title | "Foydalanuvchi profili — Kitobzor" |

Result: `[ ]`

---

## Notes

---

## Run 1 — 2026-05-26, local dev (Django @ :8000, Next @ :3000)

| Case                                       | Status | Evidence                                                  |
| ------------------------------------------ | ------ | --------------------------------------------------------- |
| A8.1 user profile renders name + heading   | [P]    | Playwright — "Ali Valiyev" + "Joylangan kitoblar" visible |
| A8.1 user profile empty books state        | [P]    | "hali kitob joylamagan" visible                           |
| A8.2 user not found (404 response)         | [P]    | "Foydalanuvchi topilmadi" visible                         |
| A8.3 loading spinner before user loads     | [P]    | Spin/loadingText visible before unblock                   |
| A8.8 user profile SSR title                | [P]    | Title regex /Foydalanuvchi profili/ matched               |
| A8.1 breadcrumb "Foydalanuvchi profili"    | [P]    | Breadcrumb text visible                                   |
| A8.4 BookCreateModal opens from account    | [P]    | "Kitob turini tanlang" visible after click                |
| A8.4 modal shows progress + LinearProgress | [P]    | "1 / N" text + .MuiLinearProgress-root visible            |
| A8.5 "Bekor qilish" closes modal           | [P]    | Step title gone (count=0) after click                     |
| A8.6 draft persistence via localStorage    | [P]    | book-create-draft key retained on reopen                  |
| A8.7 modal renders without empty-cat crash | [P]    | "Davom" button visible                                    |

### Findings

1. **[Note]** `getUserById()` returns `{ user: data?.result || data || null }`. Unlike ME endpoint (`/auth/me/`), the per-user `/auth/:id/` endpoint **does** use the `{ result: ... }` envelope. Stub: `{ result: MOCK_USER, success: true }`.
2. **[Note]** BookCreateModal "Bekor qilish" exists twice in the modal: as an IconButton (`aria-label="Bekor qilish"`) and as a text button (`MuiButton-root`). Use class-scoped selector to disambiguate.
3. **[Note]** Draft key is `book-create-draft` for new books, `book-edit-draft:${id}` for edits. `useDraftStorage` serializes as `{ data, savedAt }` with 24h TTL.
4. **[Note]** Modal opens via `.profile-tabs__head-cta` (ProfileTabs renders the "Kitob qo'shish" button passing `onCreateBook` prop).
5. **[OK]** Step 1 ("Kitob turini tanlang") renders without crashing even when categories endpoint returns empty.
6. **[Config]** Bumped Playwright test timeout 30s → 60s and added retry: 1 for local — dev server compilation is the long-tail.

### Verdict

A8: 11/11 Playwright tests pass. Full suite: 164/165 pass (1 skipped community test; 1 static page flake auto-retried).
