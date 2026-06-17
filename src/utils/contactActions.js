/**
 * Derive the seller contact actions for a book detail page.
 *
 * Contact is gated to signed-in users: the backend only returns the seller's
 * phone / telegram handle to authenticated requests, while the public
 * `has_phone` / `has_telegram` booleans let us still render the buttons for
 * everyone. Anonymous visitors see the buttons but `requiresLogin` is true —
 * the UI intercepts the click, shows a "sign in" toast, and bounces them to
 * the login page instead of opening the channel.
 *
 * @param {object}  params
 * @param {object}  params.postedBy        - book.posted_by serializer object
 * @param {boolean} params.isAuthenticated - current viewer auth state
 * @param {string} [params.prefill]        - pre-filled Telegram message text
 * @returns {{
 *   hasTelegram: boolean, hasPhone: boolean, requiresLogin: boolean,
 *   tgUrl: (string|null), telHref: (string|null), smsHref: (string|null),
 * }}
 */
export function getContactActions({ postedBy, isAuthenticated, prefill = "" } = {}) {
  const handle = postedBy?.telegram_username
    ? String(postedBy.telegram_username).replace(/^@/, "")
    : null;
  const rawPhone = postedBy?.app_phone_number || postedBy?.phone_number || null;
  const phoneClean = rawPhone ? String(rawPhone).replace(/\s/g, "") : null;

  // Prefer the explicit presence booleans (returned to everyone, incl.
  // anonymous visitors who never receive the actual handle/number); fall back
  // to the resolved value for older payloads that predate the booleans.
  const hasTelegram = Boolean(postedBy?.has_telegram ?? handle);
  const hasPhone = Boolean(postedBy?.has_phone ?? phoneClean);

  const tgUrl = handle ? `https://t.me/${handle}?text=${encodeURIComponent(prefill)}` : null;

  return {
    hasTelegram,
    hasPhone,
    requiresLogin: !isAuthenticated,
    tgUrl,
    telHref: phoneClean ? `tel:${phoneClean}` : null,
    smsHref: phoneClean ? `sms:${phoneClean}` : null,
  };
}

export default getContactActions;
