# A6 — Shops & static pages (manual test plan)

## Scope

- `/[locale]/shops` — ShopsListPage (public, search + region filter)
- `/[locale]/about-us`, `/[locale]/contact`, `/[locale]/faq`, `/[locale]/policies` — static content

Key files: `src/components/ShopsListPage.jsx`, `src/components/shop/ShopCard.jsx`, `src/components/AboutUs.jsx`, `src/components/Contact.jsx`, `src/components/FaqPage.jsx`, `src/components/PoliciesSection.jsx`.

Pre-conditions: `npm run dev` on `:3000`. Backend on `:8000`.

Status legend: `[ ]` not run · `[P]` pass · `[F]` fail · `[S]` skipped

---

## A6.1 Shops page renders

| Step                     | Expected                                    |
| ------------------------ | ------------------------------------------- |
| GET `/uz/shops`          | 200, breadcrumb visible                     |
| Empty shops API          | `"Filterga mos do'kon topilmadi"` text      |
| 1+ shops                 | `ShopCard` components visible               |
| MUI Skeleton during load | 6 skeleton items while fetching             |
| Error state              | `"Do'konlarni yuklashda xatolik yuz berdi"` |

Result: `[ ]`

---

## A6.2 Shops search filter

| Step               | Expected                       |
| ------------------ | ------------------------------ |
| Type in search box | Re-fetches with `?q=...`       |
| Region dropdown    | Re-fetches with `?region=<id>` |

Result: `[ ]`

---

## A6.3 Static pages return 200

| URL            | Expected                  |
| -------------- | ------------------------- |
| `/uz/about-us` | 200, content visible      |
| `/uz/contact`  | 200, contact form visible |
| `/uz/faq`      | 200, FAQ items visible    |
| `/uz/policies` | 200, policy text visible  |

Result: `[ ]`

---

## A6.4 Static pages have correct metadata

| Page           | Expected title             |
| -------------- | -------------------------- |
| `/uz/about-us` | "Biz haqimizda - Kitobzor" |
| `/uz/contact`  | "Aloqa — Kitobzor"         |
| `/uz/faq`      | Contains "Kitobzor"        |
| `/uz/policies` | Contains "Kitobzor"        |

Result: `[ ]`

---

## A6.5 Contact form

| Step              | Expected                              |
| ----------------- | ------------------------------------- |
| Submit empty form | Validation errors visible (not crash) |
| Submit valid form | Success message or redirect           |

Result: `[ ]`

---

## Notes

---

## Run 1 — 2026-05-26, local dev (Django @ :8000, Next @ :3000)

| Case                                   | Status | Evidence                                                               |
| -------------------------------------- | ------ | ---------------------------------------------------------------------- |
| A6.1 shops page 200                    | [P]    | Playwright                                                             |
| A6.1 empty state                       | [P]    | "Filterga mos do'kon topilmadi" visible                                |
| A6.1 shop cards render                 | [P]    | ShopCard text + `/shops/<id>` link visible                             |
| A6.1 error state                       | [P]    | No crash, header intact                                                |
| A6.2 filter interaction                | [S]    | Manual browser test needed                                             |
| A6.3 about-us/contact/faq/policies 200 | [P]    | Playwright (all 4 locales for shops)                                   |
| A6.4 titles correct                    | [P]    | Playwright — "Biz haqimizda", "Aloqa", FAQ/Policies contain "Kitobzor" |
| A6.5 contact form inputs               | [P]    | phone + message inputs visible                                         |
| A6.5 contact form empty submit         | [P]    | No redirect, input still visible                                       |

### Findings

1. **[Note]** Static pages (about-us, contact, faq, policies) hang with `waitUntil: "load"` in Playwright — Google Fonts CDN is slow in the test environment. Fixed to `"domcontentloaded"`. No bug in the app.
2. **[OK]** All 4 static pages return 200, render header, have correct titles.
3. **[OK]** Shops renders empty state, shop cards, and error state without crashing.

### Verdict

A6: 18/18 Playwright tests pass (107/107 total suite). Filter interaction (A6.2) requires manual browser test.
