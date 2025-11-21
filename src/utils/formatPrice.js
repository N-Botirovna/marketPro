/**
 * Format price with thousand separators and currency
 * @param {number|string} price - Price value
 * @param {string} locale - Locale for formatting (uz, ru, en)
 * @returns {string} Formatted price string (e.g., "35 000 so'm")
 */
export function formatPrice(price, locale = 'uz') {
  if (price === null || price === undefined || price === '') {
    return '';
  }

  // Convert to number
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '';
  }

  // Format number with spaces as thousand separators
  const formatted = numPrice.toLocaleString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace(/,/g, ' ');

  // Return with "so'm" suffix
  return `${formatted} so'm`;
}

