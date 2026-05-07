export function serializeParams(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "__default__";
  return JSON.stringify(
    entries
      .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
      .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {})
  );
}
