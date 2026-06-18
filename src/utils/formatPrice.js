const CURRENCY_MAP = {
  uz: { currency: "UZS", symbol: "so'm" },
  ru: { currency: "UZS", symbol: "so'm" },
  en: { currency: "UZS", symbol: "UZS" },
};

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(n) ? null : n;
}

// Group thousands with a (non-breaking) space using a pure string operation —
// the Uzbek convention is "160 000", not "160,000". We deliberately do NOT use
// `Intl.NumberFormat` with a locale like `uz-UZ`: Node's server ICU and the
// browser ICU emit different group separators for that locale, so every price
// text differed between SSR and client and triggered a React hydration
// mismatch. A literal separator constant is identical everywhere, so it stays
// hydration-safe. The separator is a NBSP ( ) so a number never wraps
// across lines mid-group ("160\n000").
const GROUP_SEPARATOR = " ";
function groupThousands(value) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
}

export function formatPrice(value, locale = "uz") {
  const n = toNumber(value);
  if (n === null) return "";
  return `${groupThousands(n)} ${CURRENCY_MAP[locale]?.symbol ?? "so'm"}`;
}

export function formatNumber(value) {
  const n = toNumber(value);
  if (n === null) return "";
  return groupThousands(n);
}
