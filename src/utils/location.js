/**
 * Owner-location helpers for book payloads.
 *
 * The backend nests the poster's location as flat fields on `posted_by`
 * (`region_name`, `district_name` — see back-end users/serializers.py
 * UserShortSerializer). Shop-owned books carry no location in the short
 * serializer, so these helpers return null for them and callers hide the row.
 */

/**
 * "Region, District" for the user who posted the book, or null when the
 * payload has no location (shop books, incomplete legacy profiles).
 */
export function bookOwnerLocation(book) {
  const owner = book?.posted_by;
  if (!owner) return null;
  const parts = [owner.region_name, owner.district_name].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}
