/**
 * useAbortable — convenience hook for components that fetch on mount
 * (or in response to deps changing) and need to bail cleanly on unmount
 * or re-fetch (M-21).
 *
 * Why this exists:
 *   Components today follow the pattern
 *     useEffect(() => { service.getX().then(setState) }, [...]);
 *   When the component unmounts mid-flight, axios still resolves and
 *   the .then() calls setState on an unmounted component. React 18
 *   logs a warning ("Can't perform a React state update on an
 *   unmounted component") and worse, the network request keeps using
 *   bandwidth + a backend worker for nothing.
 *
 * Pattern:
 *   useAbortable((signal) => {
 *     return getBooks({ params, signal })
 *       .then(setBooks)
 *       .catch((err) => {
 *         if (err.name !== "AbortError") throw err;
 *       });
 *   }, [params]);
 *
 *   Services pass `signal` through to axios via `http.get(url, { signal })`
 *   — axios v1+ understands the AbortSignal API natively.
 */

import { useEffect, useRef } from "react";

export function useAbortable(effect, deps = []) {
  const effectRef = useRef(effect);
  // Keep the ref fresh without retriggering the effect when only the
  // callback identity changes (callers don't always memoize).
  effectRef.current = effect;

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve(effectRef.current(controller.signal)).catch((err) => {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
        return;
      }
      // Surface anything else; component-level error boundaries / toast
      // logic handle the visible side.
      if (process.env.NODE_ENV === "development") {
        console.error("useAbortable effect failed:", err);
      }
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller owns deps
  }, deps);
}
