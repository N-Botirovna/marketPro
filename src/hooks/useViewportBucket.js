import { useEffect, useState } from "react";

/**
 * useViewportBucket — buckets `window.innerWidth` into one of
 * `"mobile" | "tablet" | "desktop"` strings (Bootstrap-aligned thresholds).
 *
 * Use as a `key` prop on slick-carousel wrappers so they remount when the
 * viewport crosses a breakpoint — slick caches layout dimensions at mount
 * and doesn't reflow on resize otherwise.
 *
 *   <Slider key={useViewportBucket()} {...settings} />
 */

const BREAKPOINT_MOBILE_MAX = 767; // Bootstrap sm
const BREAKPOINT_TABLET_MAX = 991; // Bootstrap md

function classify(width) {
  if (width <= BREAKPOINT_MOBILE_MAX) return "mobile";
  if (width <= BREAKPOINT_TABLET_MAX) return "tablet";
  return "desktop";
}

export function useViewportBucket() {
  // SSR-safe default: assume desktop (matches the current desktop-first design)
  const [bucket, setBucket] = useState("desktop");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function update() {
      const next = classify(window.innerWidth);
      setBucket((prev) => (prev === next ? prev : next));
    }

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return bucket;
}
