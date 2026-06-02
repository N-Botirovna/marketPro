"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/services/auth";
import Icon from "@/components/Icon";

// Locale code → backend Languages enum value (the API stores the full word).
const LOCALE_TO_LANG = { uz: "uzbek", ru: "russian", en: "english", kaa: "karakalpak" };

// Native-name labels intentionally stay outside the i18n bundle: language
// names should always render in their own script regardless of the active
// locale (an English speaker still sees "Русский" not "Russian").
const LANGUAGES = [
  { code: "uz", short: "UZ", label: "O‘zbekcha" },
  { code: "ru", short: "RU", label: "Русский" },
  { code: "en", short: "EN", label: "English" },
  { code: "kaa", short: "QQ", label: "Qaraqalpaqsha" },
];

/**
 * Language switcher styled to match the kz-header family.
 *
 * Trigger is a compact circular button showing the two-letter active
 * locale code (e.g. "UZ"). Popover lists the four locales with native
 * name + ISO code badge. Selection persists for the next visit and
 * triggers a locale-aware navigation.
 */
const LanguageSwitcher = ({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = useLocale();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === activeLocale) || LANGUAGES[0];

  const choose = (code) => {
    setOpen(false);
    if (code === activeLocale) return;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("NEXT_LOCALE", code);
        localStorage.setItem("locale", code);
        // For a logged-in user this IS their language preference — persist it
        // so <LocaleSync> keeps routing them here on later visits. Anonymous
        // choices stay session/URL-level only (entry default is Uzbek).
        if (isAuthenticated) localStorage.setItem("preferred_locale", code);
      }
    } catch {
      /* localStorage blocked — server middleware will fall back */
    }
    // Persist to the account so the choice follows the user across devices.
    // Best-effort: a failure must not block the language switch itself.
    if (isAuthenticated && LOCALE_TO_LANG[code]) {
      updateUserProfile({ language: LOCALE_TO_LANG[code] }).catch(() => {});
    }
    router.replace(pathname, { locale: code });
  };

  return (
    <div ref={wrapRef} className={`kz-lang ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="kz-lang__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={current.label}
      >
        <span className="kz-lang__code">{current.short}</span>
      </button>

      {open && (
        <div className="kz-lang__menu" role="menu">
          {LANGUAGES.map((lang) => {
            const active = lang.code === activeLocale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => choose(lang.code)}
                className={`kz-lang__item ${active ? "kz-lang__item--active" : ""}`}
                role="menuitem"
                disabled={active}
              >
                <span className="kz-lang__item-code">{lang.short}</span>
                <span className="kz-lang__item-label">{lang.label}</span>
                {active && (
                  <Icon className="ph-fill ph-check kz-lang__item-check" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .kz-lang {
          position: relative;
          display: inline-block;
        }
        .kz-lang__btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-primary, #111827);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease;
        }
        @media (min-width: 576px) {
          .kz-lang__btn {
            width: 40px;
            height: 40px;
          }
        }
        .kz-lang__btn:hover {
          background: var(--surface-muted, #f3f4f6);
        }
        .kz-lang__btn:focus-visible {
          outline: 2px solid var(--main-600, hsl(148, 59%, 39%));
          outline-offset: 2px;
        }
        .kz-lang__code {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .kz-lang__menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 200px;
          background: var(--surface-card, #fff);
          border: 1px solid var(--border-subtle, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          padding: 6px;
          z-index: 110;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .kz-lang__item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-primary, #111827);
          font-size: 14px;
          text-align: left;
        }
        .kz-lang__item:hover {
          background: var(--surface-muted, #f3f4f6);
        }
        .kz-lang__item:disabled {
          cursor: default;
        }
        .kz-lang__item--active {
          background: var(--surface-muted, #f3f4f6);
          font-weight: 700;
        }
        .kz-lang__item-code {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: var(--text-secondary, #4b5563);
          background: var(--surface-page, #fff);
          padding: 3px 7px;
          border-radius: 6px;
          flex-shrink: 0;
          border: 1px solid var(--border-subtle, #e5e7eb);
          min-width: 30px;
          text-align: center;
        }
        .kz-lang__item-label {
          flex: 1;
        }
        .kz-lang__item-check {
          color: var(--main-600, hsl(148, 59%, 39%));
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;
