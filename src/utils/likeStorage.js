const STORAGE_KEY = 'liked_ids';

function _read() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function _write(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage quota exceeded or unavailable — silently ignore
  }
}

export function addLike(id) {
  const ids = _read();
  const key = String(id);
  if (!ids.includes(key)) {
    _write([...ids, key]);
  }
}

export function removeLike(id) {
  const key = String(id);
  _write(_read().filter(existing => existing !== key));
}

export function isLiked(id) {
  return _read().includes(String(id));
}

export function getAllLikes() {
  return _read();
}

export function clearLikes() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
