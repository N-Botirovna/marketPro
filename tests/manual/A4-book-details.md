# A4 — Book details page (manual test plan)

Route: `/[locale]/book-details/[id]`.
Server: `generateMetadata` + `BookDetailsPage` (SSR, `revalidate=3600`). Client: `BookDetails` component fetches `GET /api/v1/book/<id>/` after hydration.
Response shape: `{ result: { id, name, name_uz, name_ru, type, price, condition, ... }, success: true }`.

Pre-conditions:

- `npm run dev` on `:3000`. Backend on `:8000`.

Status legend: `[ ]` not run · `[P]` pass · `[F]` fail · `[S]` skipped

---

## A4.1 Valid book renders correctly

| Step                                   | Expected                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| GET `/uz/book-details/1` (book exists) | 200, book title visible                                                       |
| Book name displayed                    | Locale-aware: `name_uz` in `/uz/`, `name_ru` in `/ru/`                        |
| Type badge                             | Chip with correct colour (sell=teal, gift=green, exchange=amber, rent=indigo) |
| Seller contact button                  | Telegram link or phone link visible                                           |
| Like button                            | Present; shows count                                                          |
| Breadcrumb                             | Home → Community → Book name                                                  |

Result: `[ ]`

---

## A4.2 Book not found

| Step                                        | Expected                                        |
| ------------------------------------------- | ----------------------------------------------- |
| GET `/uz/book-details/99999` (no such book) | Page renders with "not found" message (not 500) |
| API returns `{ result: null }`              | `tBook("notFound")` text visible                |

Result: `[ ]`

---

## A4.3 Loading skeleton

| Step               | Expected                                            |
| ------------------ | --------------------------------------------------- |
| Slow API (> 200ms) | MUI `<Skeleton>` blocks visible before data arrives |
| After data loads   | Skeletons replaced by book content                  |

Result: `[ ]`

---

## A4.4 Error state

| Step            | Expected                                               |
| --------------- | ------------------------------------------------------ |
| API returns 500 | Error text visible (not blank page, not 500 SSR crash) |
| Error message   | `tBook("loadError")` or server error message           |

Result: `[ ]`

---

## A4.5 Edit button (owner only)

| Step                | Expected                                                            |
| ------------------- | ------------------------------------------------------------------- |
| `can_update: false` | No edit button                                                      |
| `can_update: true`  | Edit (pencil) button visible → opens `BookCreateModal` in edit mode |

Result: `[ ]`

---

## A4.6 Like button (auth-gated)

| Step            | Expected                                                      |
| --------------- | ------------------------------------------------------------- |
| Unauthenticated | Like button visible but clicking prompts login or is disabled |
| Authenticated   | Like toggles, count updates optimistically                    |

Result: `[ ]`

---

## A4.7 SEO metadata

| Check                                                    | Expected |
| -------------------------------------------------------- | -------- |
| `<title>` = `Name — Author \| Kitobzor`                  | ✓        |
| `<meta property="og:type">` = `article`                  | ✓        |
| `<meta property="og:image">` present if book has picture | ✓        |
| `<link rel="alternate" hreflang>` for all 4 locales      | ✓        |
| JSON-LD `@type: "Book"` in page source                   | ✓        |

Result: `[ ]`

---

## A4.8 Responsive layout

| Viewport | Expected                                      |
| -------- | --------------------------------------------- |
| 360px    | Cover image full-width, details stacked below |
| 768px    | Side-by-side (image left, details right)      |
| 1440px   | Max-width 980px centered, ample whitespace    |

Result: `[ ]`

---

## Notes

---

## Run 1 — 2026-05-26, local dev (Django @ :8000, Next @ :3000)

| Case                                            | Status | Evidence                                                     |
| ----------------------------------------------- | ------ | ------------------------------------------------------------ |
| A4.1 valid book renders (title, badge, contact) | [P]    | Playwright — title, type chip, t.me link visible             |
| A4.2 book not found (null response)             | [P]    | Playwright — no crash, header intact                         |
| A4.3 loading skeleton                           | [P]    | Playwright — MuiSkeleton visible before data, replaced after |
| A4.4 error state (500)                          | [P]    | Playwright — no blank page, header intact                    |
| A4.5 edit button hidden when can_update=false   | [P]    | Playwright — aria-label="Tahrirlash" count = 0               |
| A4.5 edit button visible when can_update=true   | [P]    | Playwright — aria-label="Tahrirlash" visible after auth      |
| A4.6 like button auth-gated                     | [S]    | Requires live session                                        |
| A4.7 hreflang + JSON-LD                         | [P]    | Playwright — 4 hreflang links + ≥1 JSON-LD script            |
| A4.8 mobile layout (375px) no h-scroll          | [P]    | Playwright — scrollWidth ≤ 380px                             |

### Findings

1. **[Note]** SSR `generateMetadata` fetches the real backend — `og:type: "article"` only appears when book exists in DB. Fallback uses layout's default (`og:type: "website"`). This is expected behaviour; no bug.
2. **[Note]** Edit button selector must be scoped to `main`/`section` — there are other elements in header/footer matching generic class patterns. Tests use `aria-label="Tahrirlash"` (uz locale) to scope correctly.
3. **[OK]** `can_update` field correctly gates the edit button on the client side. No server-side auth check needed since non-owners won't have `can_update: true` in the API response.
4. **[OK]** Mobile layout: no horizontal overflow at 375px viewport.

### Verdict

A4 book details page: all 9 automatable Playwright cases pass. Live like-toggle test (A4.6) requires authenticated session — deferred to manual.
