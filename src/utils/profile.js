/**
 * Profile-completeness helpers.
 *
 * To post a book under their own name, a user must have a region AND a
 * district on their profile (the backend enforces the same rule and rejects
 * incomplete profiles with the `profile_incomplete` code). These helpers let
 * the UI pre-check before opening the create flow and route the user to the
 * profile-edit screen instead.
 *
 * `region`/`district` arrive in two shapes depending on the endpoint:
 *   - a nested object: `{ id, name, ... }`
 *   - a bare id: `12` or `"12"`
 * so both readers normalize to a truthy id (ids start at 1, so 0/""/null are
 * all treated as "missing").
 */

function idOf(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") {
    return value.id ?? value.value ?? null;
  }
  return value;
}

export function getRegionId(user) {
  return idOf(user?.region);
}

export function getDistrictId(user) {
  return idOf(user?.district);
}

/** True when the user can post a book — region AND district are both set. */
export function isProfileComplete(user) {
  return Boolean(getRegionId(user)) && Boolean(getDistrictId(user));
}
