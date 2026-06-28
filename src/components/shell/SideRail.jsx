"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import { RAIL_NAV, isNavItemActive, isShellHiddenPath } from "@/config/nav";

/**
 * App-shell desktop side rail — the persistent left navigation on ≥ lg
 * (the bottom tab bar takes over below lg). Driven by `RAIL_NAV`
 * (src/config/nav.js), which carries a couple more destinations than the
 * 5-slot mobile bar (Shops gets its own entry).
 *
 * Pure navigation: the brand/logo stays in the top header and posting a book
 * stays on the floating FAB, so the rail introduces no duplicate affordances.
 * Content is offset by `--rail-w` via a body padding rule in globals.scss.
 */
export default function SideRail() {
  const t = useTranslations();
  const pathname = usePathname();

  if (isShellHiddenPath(pathname)) return null;

  return (
    <aside className="kz-rail" aria-label={t("Nav.primary")}>
      <Link href="/" className="kz-rail__brand" aria-label="Kitobzor">
        <span className="kz-rail__brand-mark" aria-hidden="true">
          <Image src="/assets/images/logo/kitobzor-logo.png" alt="" width={40} height={40} />
        </span>
      </Link>
      <ul className="kz-rail__list">
        {RAIL_NAV.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <li key={item.key} className="kz-rail__item">
              <Link
                href={item.href}
                className={`kz-rail__link ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="kz-rail__icon" aria-hidden="true">
                  <Icon className={`${active ? "ph-fill" : "ph"} ph-${item.icon}`} />
                </span>
                <span className="kz-rail__label">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <style jsx>{`
        .kz-rail {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--rail-w, 84px);
          z-index: 95;
          background: var(--surface-card);
          border-right: 1px solid var(--border-subtle);
          display: none;
          overflow-y: auto;
          overscroll-behavior: contain;
        }
        /* Desktop only — below lg the bottom tab bar is used instead. */
        @media (min-width: 992px) {
          .kz-rail {
            display: block;
          }
        }

        /* Brand sits at the very top, aligned to the header band height — on
           desktop the header sheds its own logo, so this is THE brand mark. */
        .kz-rail :global(.kz-rail__brand) {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 64px;
          border-bottom: 1px solid var(--border-subtle);
          text-decoration: none;
        }
        .kz-rail__brand-mark {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--brand-soft);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }
        .kz-rail__brand-mark :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .kz-rail__list {
          list-style: none;
          margin: 0;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* next-intl <Link> is a custom component, so styled-jsx can't scope to
           its rendered <a>. Target via :global() under the scoped host; the
           (0,2,0) specificity also beats the template's global "a" colour. */
        .kz-rail :global(.kz-rail__link) {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 10px 4px;
          border-radius: var(--radius-lg, 16px);
          text-decoration: none;
          color: var(--text-muted);
          transition:
            color var(--dur-fast, 0.15s) var(--ease-out, ease),
            background-color var(--dur-fast, 0.15s) var(--ease-out, ease);
        }
        .kz-rail :global(.kz-rail__link:hover) {
          color: var(--text-primary);
          background: var(--surface-muted);
        }
        .kz-rail :global(.kz-rail__link.is-active) {
          color: var(--brand);
          background: var(--brand-soft);
        }
        .kz-rail :global(.kz-rail__link:focus-visible) {
          outline: none;
          box-shadow: var(--ring);
        }

        .kz-rail__icon {
          display: inline-flex;
          font-size: 25px;
          line-height: 1;
        }
        .kz-rail__label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1.1;
          text-align: center;
        }

        @media (min-width: 1280px) {
          .kz-rail {
            width: var(--rail-w-xl, 92px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .kz-rail :global(.kz-rail__link) {
            transition: none;
          }
        }
      `}</style>
    </aside>
  );
}
