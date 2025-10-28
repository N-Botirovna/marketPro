// Simple wrapper around localStorage for tokens and small items

export function setItem(key, value) {
  if (typeof window === "undefined") return;
  try {
    // Store as string directly (tokens are already strings)
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Storage setItem error:', error);
    }
  }
}

export function getItem(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    // Try to parse as JSON, if fails return as string
    try {
      return JSON.parse(raw);
    } catch {
      return raw; // Return as string if not JSON
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Storage getItem error:', error);
    }
    return null;
  }
}

export function removeItem(key) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Storage removeItem error:', error);
    }
  }
}

// Clear all auth-related storage
export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user_data');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Storage clear error:', error);
    }
  }
}









