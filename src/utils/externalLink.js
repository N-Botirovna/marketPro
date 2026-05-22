/**
 * Detect a social/media platform from a free-form URL and surface a
 * matching Phosphor icon class + i18n label key.
 *
 * Admin types a URL ("https://t.me/kitobzor/123" / "https://instagram.com/p/abc")
 * and the frontend picks the right glyph automatically — keeping the
 * admin form to just "paste a link". Unknown hosts fall back to a generic
 * link icon and a neutral "Open" label.
 *
 * Returns `{ icon, labelKey, hostname }` or `null` for missing/invalid input.
 */
const PLATFORMS = [
  {
    match: /(^|\.)t\.me$|(^|\.)telegram\.me$/i,
    icon: "ph-fill ph-telegram-logo",
    labelKey: "openInTelegram",
  },
  {
    match: /(^|\.)instagram\.com$/i,
    icon: "ph-fill ph-instagram-logo",
    labelKey: "openInInstagram",
  },
  {
    match: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i,
    icon: "ph-fill ph-youtube-logo",
    labelKey: "openInYoutube",
  },
  { match: /(^|\.)tiktok\.com$/i, icon: "ph-fill ph-tiktok-logo", labelKey: "openInTiktok" },
  {
    match: /(^|\.)facebook\.com$|(^|\.)fb\.com$/i,
    icon: "ph-fill ph-facebook-logo",
    labelKey: "openInFacebook",
  },
  {
    match: /(^|\.)twitter\.com$|(^|\.)x\.com$/i,
    icon: "ph-fill ph-x-logo",
    labelKey: "openInTwitter",
  },
];

const DEFAULT = { icon: "ph ph-arrow-square-out", labelKey: "openLink" };

export function detectExternalLink(url) {
  if (!url || typeof url !== "string") return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  const match = PLATFORMS.find((p) => p.match.test(host));
  return {
    icon: match?.icon || DEFAULT.icon,
    labelKey: match?.labelKey || DEFAULT.labelKey,
    hostname: host,
  };
}
