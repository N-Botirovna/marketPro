"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import { PRIMARY_NAV, isNavItemActive, isShellHiddenPath } from "@/config/nav";
import { usePostBookAction } from "@/hooks/usePostBookAction";

/**
 * App-shell bottom tab bar — the signature "this is an app" surface on
 * mobile/tablet (< lg). Desktop (≥ lg) hides it and uses the side rail.
 *
 * Driven entirely by `PRIMARY_NAV` (src/config/nav.js): link items navigate,
 * the `center` item is the elevated "post a book" CTA wired to the same gate
 * as the floating FAB via `usePostBookAction`.
 */
export default function BottomTabBar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { trigger, checking } = usePostBookAction();

  if (isShellHiddenPath(pathname)) return null;

  return (
    <nav className="kz-tabbar" aria-label={t("Nav.primary")}>
      <ul className="kz-tabbar__list">
        {PRIMARY_NAV.map((item) => {
          const label = t(item.labelKey);

          if (item.center) {
            return (
              <li key={item.key} className="kz-tabbar__item kz-tabbar__item--center">
                <button
                  type="button"
                  className="kz-tabbar__post"
                  onClick={trigger}
                  disabled={checking}
                  aria-busy={checking}
                  aria-label={label}
                >
                  <Icon className={`ph-bold ph-${item.icon}`} aria-hidden="true" />
                </button>
                <span className="kz-tabbar__post-label">{label}</span>
              </li>
            );
          }

          const active = isNavItemActive(item, pathname);
          return (
            <li key={item.key} className="kz-tabbar__item">
              <Link
                href={item.href}
                className={`kz-tabbar__link ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="kz-tabbar__icon" aria-hidden="true">
                  <Icon className={`${active ? "ph-fill" : "ph"} ph-${item.icon}`} />
                </span>
                <span className="kz-tabbar__label">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <style jsx>{`
        .kz-tabbar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1090;
          background: color-mix(in srgb, var(--surface-card) 88%, transparent);
          backdrop-filter: saturate(180%) blur(12px);
          -webkit-backdrop-filter: saturate(180%) blur(12px);
          border-top: 1px solid var(--border-subtle);
          box-shadow: 0 -6px 20px rgba(15, 23, 42, 0.06);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        /* Desktop uses the side rail instead. */
        @media (min-width: 992px) {
          .kz-tabbar {
            display: none;
          }
        }

        .kz-tabbar__list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          align-items: stretch;
          height: 60px;
        }
        .kz-tabbar__item {
          flex: 1 1 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* next-intl <Link> is a custom component, so styled-jsx can't add its
           scope class to the rendered <a>. Target it via :global() under the
           scoped .kz-tabbar host — specificity (0,2,0) also beats the template's
           global "a { color:#0661e9 }" rule. */
        .kz-tabbar :global(.kz-tabbar__link) {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          width: 100%;
          height: 100%;
          min-height: 44px;
          text-decoration: none;
          color: var(--text-muted);
          transition: color var(--dur-fast, 0.15s) var(--ease-out, ease);
          -webkit-tap-highlight-color: transparent;
        }
        .kz-tabbar :global(.kz-tabbar__link.is-active) {
          color: var(--brand);
        }
        .kz-tabbar :global(.kz-tabbar__link:focus-visible) {
          outline: none;
          box-shadow: var(--ring);
          border-radius: var(--radius-md, 12px);
        }
        .kz-tabbar__icon {
          display: inline-flex;
          font-size: 23px;
          line-height: 1;
        }
        .kz-tabbar__label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Center "post" CTA — elevated brand puck overlapping the top edge. */
        .kz-tabbar__item--center {
          flex-direction: column;
          gap: 2px;
          position: relative;
        }
        .kz-tabbar__post {
          margin-top: -18px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid var(--surface-page);
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(
            135deg,
            hsl(148, 70%, 50%) 0%,
            hsl(168, 65%, 38%) 60%,
            hsl(188, 70%, 42%) 100%
          );
          box-shadow:
            0 8px 20px rgba(34, 197, 94, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.15);
          transition:
            transform var(--dur-fast, 0.15s) var(--ease-out, ease),
            box-shadow var(--dur-fast, 0.15s) var(--ease-out, ease);
        }
        .kz-tabbar__post:active {
          transform: scale(0.93);
        }
        .kz-tabbar__post:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .kz-tabbar__post:focus-visible {
          outline: 3px solid hsla(148, 70%, 45%, 0.55);
          outline-offset: 2px;
        }
        .kz-tabbar__post-label {
          font-size: 10.5px;
          font-weight: 600;
          line-height: 1;
          color: var(--text-muted);
        }

        @media (prefers-reduced-motion: reduce) {
          .kz-tabbar__link,
          .kz-tabbar__post {
            transition: none;
          }
        }
      `}</style>
    </nav>
  );
}
