"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";

/**
 * App Router styled-jsx registry (official Next.js pattern).
 *
 * Without this, `<style jsx>` blocks in client components (HeaderOne drawer,
 * Toast, BannerOne, ...) only get their CSS *class names* server-rendered —
 * the actual rules are injected on the client after hydration. On slow
 * connections that produced a visible flash of unstyled content (e.g. the
 * mobile drawer rendering fully expanded before its `translateX(-100%)`
 * rule applied). `useServerInsertedHTML` flushes the collected styled-jsx
 * rules into the SSR HTML so every styled-jsx component is styled at first
 * paint. Independent of MUI/emotion's own SSR registry.
 */
export default function StyledJsxRegistry({ children }) {
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
