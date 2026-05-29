"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Full-screen branded loading surface with rotating Kitobzor facts so the
 * wait feels intentional instead of a blank spinner. Used by ProtectedRoute's
 * auth gate and the bot → site auto-login interstitial.
 *
 * Facts come from the `LoadingFacts.items` i18n array (read via `t.raw`) and
 * cross-fade every ~2.2s. Respects reduced-motion (no flip/marquee, instant
 * text swap) via CSS.
 */
const LoadingScreen = ({ title }) => {
  const t = useTranslations("LoadingFacts");
  const facts = (() => {
    try {
      const raw = t.raw("items");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  })();

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (facts.length < 2) return undefined;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % facts.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [facts.length]);

  const fact = facts.length ? facts[index] : "";

  return (
    <div className="kz-loader" role="status" aria-live="polite">
      <div className="kz-loader__book" aria-hidden="true">
        <i className="ph-fill ph-book-open-text" />
      </div>
      {title ? <p className="kz-loader__title">{title}</p> : null}
      {/* keyed so each fact re-triggers the fade-in animation */}
      <p key={index} className="kz-loader__fact">
        {fact}
      </p>
      <div className="kz-loader__bar" aria-hidden="true">
        <span />
      </div>
    </div>
  );
};

export default LoadingScreen;
