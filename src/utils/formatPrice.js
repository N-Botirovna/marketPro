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

// Group thousands with a comma using a pure string operation. We deliberately
// do NOT use `Intl.NumberFormat` with a locale like `uz-UZ`: Node's server ICU
// and the browser ICU emit different group separators for that locale (space
// vs comma), so every price text differed between SSR and client and triggered
// a React hydration mismatch. Manual grouping is identical everywhere.
function groupThousands(value) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
