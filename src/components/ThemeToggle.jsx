"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getResolvedTheme, getThemeMode, setThemeMode, subscribeTheme } from "@/lib/theme";
import Icon from "@/components/Icon";

const NEXT_MODE = { light: "dark", dark: "system", system: "light" };
const MODE_ICON = {
  light: "ph-fill ph-sun",
  dark: "ph-fill ph-moon-stars",
  system: "ph ph-circle-half",
};

/**
 * Tri-state theme cycle: light → dark → system → light.
 *
 * The "system" state matches `prefers-color-scheme` and reacts live to
 * OS changes (handled by `subscribeTheme` in `@/lib/theme`). Default for
 * a first-time visitor is "system" — they only land on an explicit mode
 * once they tap the button.
 *
 * Pre-hydration we render a same-sized placeholder so the bar doesn't
 * jump as the resolved theme arrives.
 */
const ThemeToggle = ({ className = "" }) => {
  const t = useTranslations("ThemeToggle");
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("system");
  const [resolved, setResolved] = useState("light");

  useEffect(() => {
    setMounted(true);
    setMode(getThemeMode());
    setResolved(getResolvedTheme());
    return subscribeTheme((next) => {
      setMode(next.mode);
      setResolved(next.resolved);
    });
  }, []);

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{ display: "inline-block", width: 40, height: 40 }}
      />
    );
  }

  const nextMode = NEXT_MODE[mode] || "light";
  const labelMap = {
    light: t("switchToDark"),
    dark: t("switchToSystem"),
    system: t("switchToLight"),
  };
  const label = labelMap[mode];
  const iconClass = mode === "system" ? MODE_ICON.system : MODE_ICON[resolved];

  return (
    <button
      type="button"
      onClick={() => setThemeMode(nextMode)}
      aria-label={label}
      title={label}
      className={`kz-theme-toggle ${className}`}
      data-mode={mode}
    >
      <Icon className={iconClass} aria-hidden="true" />
      <style jsx>{`
        .kz-theme-toggle {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-secondary, #4b5563);
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition:
            background 0.15s ease,
            color 0.15s ease;
        }
        @media (min-width: 576px) {
          .kz-theme-toggle {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
        }
        .kz-theme-toggle:hover {
          background: var(--surface-muted, #f3f4f6);
          color: var(--text-primary, #111827);
        }
        .kz-theme-toggle:focus-visible {
          outline: 2px solid var(--main-600, hsl(148, 59%, 39%));
          outline-offset: 2px;
        }
        /* Small dot when the user has opted out of "system" so they know
           the toggle is overriding their OS preference. Matches Telegram's
           settings-page convention. */
        .kz-theme-toggle[data-mode="light"]::after,
        .kz-theme-toggle[data-mode="dark"]::after {
          content: "";
          position: absolute;
          bottom: 6px;
          right: 8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--main-600, hsl(148, 59%, 39%));
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
