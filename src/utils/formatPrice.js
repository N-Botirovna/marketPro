const LOCALE_MAP = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

const CURRENCY_MAP = {
  uz: { currency: 'UZS', symbol: "so'm" },
  ru: { currency: 'UZS', symbol: "so'm" },
  en: { currency: 'UZS', symbol: 'UZS' },
};

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(n) ? null : n;
}

export function formatPrice(value, locale = 'uz') {
  const n = toNumber(value);
  if (n === null) return '';

  const bcp47 = LOCALE_MAP[locale] ?? LOCALE_MAP.uz;
  const formatted = new Intl.NumberFormat(bcp47, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

  return `${formatted} ${CURRENCY_MAP[locale]?.symbol ?? "so'm"}`;
}

export function formatNumber(value, locale = 'uz') {
  const n = toNumber(value);
  if (n === null) return '';

  const bcp47 = LOCALE_MAP[locale] ?? LOCALE_MAP.uz;
  return new Intl.NumberFormat(bcp47, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
