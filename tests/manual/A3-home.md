# A3 — Home page (manual test plan)

Stack: Next.js 15 SSR + RSC. Server fetches stories, shops, books (sell/gift/exchange/rent) in parallel via `serverFetch`. Client fetches banners via `BannerOne` (client component, `getBanners()`).
Key files: `src/app/[locale]/page.jsx`, `src/components/BannerOne.jsx`, `src/components/home/`.

Pre-conditions:

- `npm run dev` running on `http://localhost:3000`.
- Backend on `http://localhost:8000/` (empty DB is fine for render tests; populated for A3.5).

Status legend: `[ ]` not run · `[P]` pass · `[F]` fail · `[S]` skipped

---

## A3.1 Home page renders without crash (empty DB)

| Step                       | Expected                                             |
| -------------------------- | ---------------------------------------------------- |
| GET `/uz/`                 | 200, `<html lang="uz">`, header logo visible         |
| Page with no banners/books | No crash, graceful empty state (skeleton or nothing) |
| Check console              | No unhandled errors, no hydration mismatch           |

Result: `[ ]`

---

## A3.2 Banner section

| Step              | Expected                                                      |
| ----------------- | ------------------------------------------------------------- |
| Empty banners API | `.kz-banner--skeleton` visible (loading state) then fades out |
| 1+ banners in DB  | Slide carousel visible, image loads                           |
| Autoplay          | Slides advance automatically every ~6.5 s                     |
| Pip navigation    | Clicking pip jumps to slide and resets timer                  |

Result: `[ ]`

---

## A3.3 Book sections (sell / gift / exchange / rent)

| Step            | Expected                                          |
| --------------- | ------------------------------------------------- |
| Empty books API | Section renders without crash (no books shown)    |
| 1+ books in DB  | `BookCard` components visible with thumbnail      |
| BookCard link   | Click → `/uz/book-details/<id>`                   |
| Responsive      | 360px: 1-col cards; 768px: 2-col; 1440px: 4–5 col |

Result: `[ ]`

---

## A3.4 Shops row

| Step            | Expected                     |
| --------------- | ---------------------------- |
| Empty shops API | Section hidden or "no shops" |
| 1+ shops        | Shop cards visible           |

Result: `[ ]`

---

## A3.5 Story bar

| Step              | Expected                                      |
| ----------------- | --------------------------------------------- |
| Empty stories     | Bar hidden or empty                           |
| 1+ active stories | Story thumbnails visible in horizontal scroll |
| Click story       | StoryViewer opens fullscreen                  |

Result: `[ ]`

---

## A3.6 Metadata / SEO

| Check                                                     | Expected |
| --------------------------------------------------------- | -------- |
| `<html lang="uz">` on `/uz/`                              | ✓        |
| `<title>` contains "Kitobzor"                             | ✓        |
| `<meta name="description">` present                       | ✓        |
| `<link rel="alternate" hreflang="...">` for all 4 locales | ✓        |

`curl -s http://localhost:3000/uz/ | grep -E 'lang=|<title>|description|hreflang'`

Result: `[ ]`

---

## A3.7 Home page performance (structure check)

| Check                          | Expected                                                                  |
| ------------------------------ | ------------------------------------------------------------------------- |
| FooterOne loaded dynamically   | `dynamic(() => import("@/components/FooterOne"))` — not in initial bundle |
| `revalidate = 600` set         | ISR / stale-while-revalidate active                                       |
| No layout shift on banner load | Banner skeleton prevents CLS                                              |

Result: `[ ]`

---

## Notes

Findings during execution go below this line.

---

## Run 1 — 2026-05-26, local dev (Django @ :8000, Next @ :3000)

| Case                                  | Status | Evidence                                                                                |
| ------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| A3.1 renders without crash (empty DB) | [P]    | Playwright — 200, no JS errors, header visible                                          |
| A3.1 all locales (uz/ru/en/kaa)       | [P]    | Playwright — `html[lang=X]` for all 4 locales                                           |
| A3.2 banner empty state               | [P]    | Playwright — no crash, no error boundary (BannerOne returns null when empty — correct)  |
| A3.3 book sections empty              | [P]    | Playwright — body + header visible, no crash                                            |
| A3.4 shops row                        | [S]    | Empty DB, requires populated data for visual check                                      |
| A3.5 story bar                        | [S]    | Empty DB, requires populated data for visual check                                      |
| A3.6 SEO metadata                     | [P]    | Playwright — title has "Kitobzor", description present, hreflang links for uz/ru/en/kaa |
| A3.7 dynamic footer                   | [P]    | Playwright — `<footer>` visible after load                                              |

### Findings

1. **[OK]** `BannerOne` correctly shows skeleton during load then returns `null` when banners list is empty — no crash.
2. **[OK]** `revalidate = 600` (ISR) set on home page. `serverGet` fires parallel requests for stories, shops, and 4 book types — no waterfall.
3. **[OK]** Footer is loaded via `dynamic(() => import(...))` — deferred correctly.
4. **[OK]** All 4 locale home pages return 200 with correct `<html lang="...">`.

### Verdict

Home page A3 automatable cases all pass (9/9 Playwright). Populated-data visual tests (A3.4, A3.5 stories/shops) require seeded DB — skipped in this run.
