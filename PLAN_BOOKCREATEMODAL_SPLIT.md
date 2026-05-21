# Plan — split BookCreateModal into step components (M-28)

**Status:** designed, not executed.
**Owner:** Frontend SWE.
**Estimated effort:** 1–2 dev-days incl. tests.

## Why

`src/components/BookCreateModal.jsx` is ~750 LOC managing roughly 20
pieces of state with multiple coupled effects, a manual step counter,
and conditional renders for create-vs-edit. The 24h-draft hook
(`useDraftStorage`) papered over the UX gap, but the file remains
hard to test, hard to review, and increasingly hard to evolve. New
field additions risk cascading regressions because no step is
isolated.

The frontend test suite has _zero_ unit coverage for this component.
Splitting unlocks per-step Vitest cases.

## Target shape

```
src/components/book-create/
├── BookCreateModal.jsx         # ~150 LOC: dialog shell + step router
├── reducer.js                  # ~120 LOC: state machine + actions
├── useBookCreateState.js       # ~50 LOC: reducer + draft persistence hook
├── steps/
│   ├── TypeStep.jsx            # type / condition / purpose
│   ├── DetailsStep.jsx         # category / subcategory / language / script / cover / author / pages / year / isbn
│   ├── PricingStep.jsx         # price / discount / exchange targets / shop selection
│   ├── DescriptionStep.jsx     # description + image upload
│   └── ReviewStep.jsx          # read-only summary + submit
└── api.js                      # createBook / updateBook + cache invalidation
```

Every step component receives `(state, dispatch, t)` and renders its
fields against the central reducer. No step owns local state — that's
the discipline.

## Reducer contract

```js
// reducer.js
export const ACTIONS = {
  SET_FIELD: "SET_FIELD", // { name, value }
  CLEAR_FIELD_ERROR: "CLEAR_FIELD_ERROR", // { name }
  SET_ERRORS: "SET_ERRORS", // { general, fields }
  NEXT_STEP: "NEXT_STEP",
  PREV_STEP: "PREV_STEP",
  GOTO_STEP: "GOTO_STEP", // { index }
  HYDRATE_DRAFT: "HYDRATE_DRAFT", // { data } — restore from useDraftStorage
  RESET: "RESET",
};

export const initialState = {
  step: 0,
  formData: {
    /* every field */
  },
  errors: { general: null, fields: {} },
  loading: false,
  preview: null, // local-only File preview URL
};
```

`useBookCreateState` wires the reducer into `useDraftStorage` so the
24h draft restore keeps working unchanged.

## Step extraction recipe

For each step:

1. Identify the field cluster from the current monolith's `formData`
   sections (the comments at the top of BookCreateModal already group
   them).
2. Move that JSX into a new `*Step.jsx` file that imports `useBookCreateContext`
   (a tiny context provider in `useBookCreateState`).
3. Reuse `<FieldError />` (`src/components/FieldError.jsx`) and
   `mapValidationError` (`src/lib/mapValidationError.js`) exactly as-is.
4. Write a Vitest case per step: render, fill a field, dispatch
   `SET_FIELD`, assert state.

## Migration sequence (one PR per step)

PRs are intentionally small so review fits in 30 min:

1. **PR 1 — Scaffold:** add `book-create/` directory with the reducer,
   hook, and an empty `BookCreateModal.jsx` that re-exports the old
   component. Tests for the reducer only. No behavior change.
2. **PR 2 — TypeStep:** extract `BOOK_TYPE` / `CONDITION` / `PURPOSE`
   fields. Wire dispatch. Update the monolith to import + render
   `<TypeStep />` for that step index.
3. **PR 3 — DetailsStep:** category / subcategory / metadata.
4. **PR 4 — PricingStep:** price / discount / exchange / shop.
5. **PR 5 — DescriptionStep:** description + image upload (this is the
   biggest one — preview state moves to the reducer).
6. **PR 6 — ReviewStep:** read-only summary + submit.
7. **PR 7 — Cleanup:** delete the legacy monolith, rename
   `book-create/BookCreateModal.jsx` to be the canonical entry,
   update import sites.

After PR 7 the file disappears and the audit's M-28 score lifts.

## Risks / things that go wrong if rushed

- **Draft format compatibility:** existing users have drafts saved in
  the legacy shape. The reducer's `HYDRATE_DRAFT` must accept and
  normalize the old shape, or you wipe in-flight book postings on
  rollout.
- **`useViewportBucket` slick-remount key** is referenced from this
  component — keep the same key shape during migration.
- **`useDraftStorage` excludes File fields by design.** Don't try to
  cache the image preview in the draft; just re-prompt on resume.
- **Edit mode (`editBook` prop)** loads existing data over the
  initial state — make sure `HYDRATE_DRAFT` is only triggered for new-
  book flow, not edit. The legacy code already gets this right; mirror
  it.

## Verification per PR

- `npm run lint && npm test && npm run i18n:check && npm run build` green.
- Manual: create a book end-to-end at 360px / 768px / 1440px. Edit a
  book end-to-end. Confirm the draft survives a refresh in create
  mode and does NOT bleed into edit mode.

## Out of scope

- Schema-validation library (Zod / Yup) — the current
  `mapValidationError + FieldError` approach stays.
- XState — the audit floated this; not needed once the reducer is in
  place. Keep it boring.
