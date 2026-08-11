/**
 * Deterministic, time-bucketed ordering for the home feed.
 *
 * Two things this fixes:
 *
 * 1. **Demand went last.** `wanted` ("I'm looking for this book") sat at the
 *    bottom of the page, below four supply rows, so the one section that asks
 *    a visitor to *act* was the one nobody scrolled to. It is now pinned to
 *    the first book row and never moves.
 *
 * 2. **Everything else was frozen.** The shops row and the collections row
 *    were always the first two blocks on the page and the supply rows always
 *    ran sell → gift → exchange → rent, so a returning visitor saw an
 *    identical page every time and only ever discovered the top of the feed.
 *    The supply rows and the discovery block (shops / collections) now rotate.
 *
 * The rotation is a pure function of a time bucket rather than `Math.random()`
 * on purpose: the home page is a server component under ISR, and a random
 * order would differ between the server-rendered payload and any re-render,
 * and would also make the layout untestable. A bucket index gives a page that
 * is stable for everyone at a given moment and different a few hours later.
 */

/** How long one ordering stays put. Four distinct home pages a day. */
export const ROTATION_PERIOD_MS = 6 * 60 * 60 * 1000;

/** Pinned to the top of the book rows — demand is the call to action. */
export const PINNED_SECTION = "wanted";

/**
 * Supply rows, in the order they appear at rotation offset 0. This is the
 * order the product owner asked for as the baseline: wanted → exchange →
 * sell → (gift → rent). Later offsets cycle it.
 */
export const ROTATING_SECTIONS = ["exchange", "sell", "gift", "rent"];

/** Non-book rows that rotate as one block between the supply rows. */
export const DISCOVERY_BLOCKS = ["shops", "collections"];

/**
 * Every book row the home page can render, keyed by the slug used in
 * `bookOrder`. `type` is the API/route slug ("sell", not "seller" — see
 * `utils/bookType.js`), `titleKey` lives in the `HomeBookList` namespace.
 */
export const HOME_BOOK_SECTIONS = {
  wanted: { type: "wanted", titleKey: "eldagiWantedTitle", href: "/community/wanted" },
  exchange: { type: "exchange", titleKey: "eldagiExchangeTitle", href: "/community/exchange" },
  sell: { type: "sell", titleKey: "eldagiSellTitle", href: "/community/sell" },
  gift: { type: "gift", titleKey: "eldagiGiftTitle", href: "/community/gift" },
  rent: { type: "rent", titleKey: "eldagiRentTitle", href: "/community/rent" },
};

/** All section slugs in a fixed order — what the page needs to pre-fetch. */
export const ALL_BOOK_SECTIONS = [PINNED_SECTION, ...ROTATING_SECTIONS];

/**
 * Which rotation bucket `now` falls into. Buckets are counted from the epoch
 * so every server (and every test) agrees without shared state.
 */
export function rotationIndex(now = Date.now(), periodMs = ROTATION_PERIOD_MS) {
  const ms = Number(now);
  const period = Number(periodMs);
  if (!Number.isFinite(ms) || !Number.isFinite(period) || period <= 0) return 0;
  return Math.floor(ms / period);
}

/** `rotate(["a","b","c"], 1)` → `["b","c","a"]`. Handles negative offsets. */
export function rotate(items, offset) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return [];
  const n = list.length;
  const shift = ((Math.trunc(Number(offset) || 0) % n) + n) % n;
  return [...list.slice(shift), ...list.slice(0, shift)];
}

/**
 * The full home ordering for a moment in time.
 *
 * @returns {{
 *   index: number,
 *   bookOrder: string[],      // section slugs, top to bottom
 *   discoveryAt: number,      // index in `bookOrder` to render shops/collections BEFORE
 *   discoveryOrder: string[], // ["shops","collections"] or the reverse
 * }}
 */
export function homeLayout(now = Date.now(), periodMs = ROTATION_PERIOD_MS) {
  const index = rotationIndex(now, periodMs);
  const rotated = rotate(ROTATING_SECTIONS, index);
  return {
    index,
    bookOrder: [PINNED_SECTION, ...rotated],
    // Never 0: the discovery block must not push `wanted` below the fold,
    // which is the whole point of pinning it. It lands somewhere between the
    // supply rows instead, so shops and collections are not permanently the
    // first thing on the page.
    discoveryAt:
      1 +
      (((index % ROTATING_SECTIONS.length) + ROTATING_SECTIONS.length) % ROTATING_SECTIONS.length),
    discoveryOrder: rotate(DISCOVERY_BLOCKS, index),
  };
}
