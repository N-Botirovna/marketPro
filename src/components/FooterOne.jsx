"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { openSellerModal } from "@/lib/sellerModal";
import { getFacebookUrl, getInstagramUrl, getTelegramChannelUrl } from "@/config/env";
import Icon from "@/components/Icon";

/**
 * Footer — app-like, minimal, token-driven (Phase 2 of the redesign).
 *
 * Migrated off the Bootstrap grid + scattered inline styles to a self-scoped
 * styled-jsx CSS grid (per CLAUDE.md §1.3 migration order: HeaderOne → Footer).
 * The old 1920px `body-bottom-bg` <img> — which relied on `overflow-x:hidden`
 * to avoid horizontal scroll (audit P2) — is gone; the footer is now a clean
 * surface that pairs with the app shell (bottom tab bar / side rail).
 *
 * Columns:
 *   1) Brand + blurb + socials   (left)
 *   2) Saytda links              (site nav)
 *   3) Yordam links              (help / info)
 *   4) Account CTA               (auth-aware, right)
 *
 * next-intl <Link> is a custom component, so link rules are written with
 * :global() under the scoped `.kz-footer` host (raw <a>/<button> are scoped
 * automatically).
 */
const FooterOne = () => {
  const tF = useTranslations("Footer");
  const tHeader = useTranslations("Header");
  const { isAuthenticated: isAuth } = useAuth();

  return (
    <footer className="kz-footer">
      <div className="kz-footer__inner">
        <div className="kz-footer__grid">
          {/* ─── Brand + blurb + socials ─────────────────────────────── */}
          <div className="kz-footer__brand">
            <Link href="/" aria-label="Kitobzor" className="kz-footer__brand-link">
              <span className="kz-footer__brand-mark" aria-hidden="true">
                <Image
                  src="/assets/images/logo/kitobzor-logo.png"
                  alt=""
                  width={44}
                  height={44}
                  style={{ objectFit: "cover" }}
                />
              </span>
              <span className="kz-footer__brand-name">kitobzor</span>
            </Link>
            <p className="kz-footer__blurb">{tF("about.blurb")}</p>

            <p className="kz-footer__social-label">{tF("social.followUs")}</p>
            <ul className="kz-footer__socials">
              <li>
                <a
                  href={getTelegramChannelUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="kz-footer__social"
                >
                  <Icon className="ph-fill ph-telegram-logo" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={getInstagramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="kz-footer__social"
                >
                  <Icon className="ph-fill ph-instagram-logo" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={getFacebookUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="kz-footer__social"
                >
                  <Icon className="ph-fill ph-facebook-logo" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* ─── Site nav ────────────────────────────────────────────── */}
          <nav className="kz-footer__col" aria-label={tF("site.title")}>
            <h3 className="kz-footer__heading">{tF("site.title")}</h3>
            <ul className="kz-footer__menu">
              <FooterLink href="/" label={tF("site.home")} />
              <FooterLink href="/shops" label={tF("site.shops")} />
              <FooterLink href="/community/all" label={tF("site.community")} />
              <li>
                <button type="button" onClick={openSellerModal} className="kz-footer__seller-btn">
                  {tF("site.becomeSeller")}
                </button>
              </li>
            </ul>
          </nav>

          {/* ─── Help / info ─────────────────────────────────────────── */}
          <nav className="kz-footer__col" aria-label={tF("help.title")}>
            <h3 className="kz-footer__heading">{tF("help.title")}</h3>
            <ul className="kz-footer__menu">
              <FooterLink href="/about-us" label={tF("help.aboutUs")} />
              <FooterLink href="/contact" label={tF("help.contact")} />
              <FooterLink href="/faq" label={tF("help.faq")} />
              <FooterLink href="/policies" label={tF("help.privacy")} />
            </ul>
          </nav>

          {/* ─── Account CTA (auth-aware) ────────────────────────────── */}
          <div className="kz-footer__account">
            <h3 className="kz-footer__heading">{tF("account.title")}</h3>
            <Link href={isAuth ? "/account" : "/login"} className="kz-footer__account-card">
              <span className="kz-footer__account-icon" aria-hidden="true">
                <Icon className={isAuth ? "ph-fill ph-user" : "ph-fill ph-sign-in"} />
              </span>
              <span className="kz-footer__account-text">
                <span className="kz-footer__account-title">
                  {isAuth ? tF("account.openProfile") : tHeader("login")}
                </span>
                <span className="kz-footer__account-hint">
                  {isAuth ? tF("account.openProfileHint") : tF("account.loginHint")}
                </span>
              </span>
              <Icon className="ph ph-caret-right kz-footer__account-caret" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .kz-footer {
          margin-block-start: auto;
          background: var(--surface-card);
          border-top: 1px solid var(--border-subtle);
        }
        .kz-footer__inner {
          max-width: var(--container-max, 1240px);
          margin: 0 auto;
          padding: 44px 20px 36px;
        }
        @media (min-width: 768px) {
          .kz-footer__inner {
            padding: 56px 24px 40px;
          }
        }

        .kz-footer__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px 24px;
        }
        @media (min-width: 768px) {
          .kz-footer__grid {
            grid-template-columns: 1.6fr 1fr 1fr;
          }
        }
        @media (min-width: 992px) {
          .kz-footer__grid {
            grid-template-columns: 1.7fr 1fr 1fr 1.5fr;
            gap: 40px;
          }
        }

        /* Brand spans the full row on phones (above the two link columns). */
        .kz-footer__brand {
          grid-column: 1 / -1;
        }
        @media (min-width: 768px) {
          .kz-footer__brand {
            grid-column: auto;
          }
        }

        .kz-footer :global(.kz-footer__brand-link) {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--text-primary);
        }
        .kz-footer__brand-mark {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--brand-soft);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .kz-footer__brand-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .kz-footer__blurb {
          margin: 16px 0 20px;
          max-width: 34ch;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.55;
        }

        .kz-footer__social-label {
          margin: 0 0 8px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .kz-footer__socials {
          display: flex;
          gap: 10px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .kz-footer__social {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--surface-muted);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 19px;
          transition:
            color var(--dur-fast, 0.15s) var(--ease-out, ease),
            background-color var(--dur-fast, 0.15s) var(--ease-out, ease),
            transform var(--dur-fast, 0.15s) var(--ease-out, ease);
        }
        .kz-footer__social:hover {
          color: var(--brand);
          background: var(--brand-soft);
          transform: translateY(-2px);
        }
        .kz-footer__social:focus-visible {
          outline: none;
          box-shadow: var(--ring);
        }

        .kz-footer__heading {
          margin: 0 0 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
        }
        .kz-footer__menu {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }
        .kz-footer :global(.kz-footer__link),
        .kz-footer__seller-btn {
          display: inline-block;
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: color var(--dur-fast, 0.15s) var(--ease-out, ease);
        }
        .kz-footer :global(.kz-footer__link:hover),
        .kz-footer__seller-btn:hover {
          color: var(--brand);
        }
        .kz-footer :global(.kz-footer__link:focus-visible),
        .kz-footer__seller-btn:focus-visible {
          outline: none;
          box-shadow: var(--ring);
          border-radius: 4px;
        }

        .kz-footer__account {
          grid-column: 1 / -1;
        }
        @media (min-width: 992px) {
          .kz-footer__account {
            grid-column: auto;
          }
        }
        .kz-footer :global(.kz-footer__account-card) {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-lg, 16px);
          background: var(--surface-page);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          text-decoration: none;
          box-shadow: var(--shadow-sm);
          transition:
            transform var(--dur-fast, 0.15s) var(--ease-out, ease),
            box-shadow var(--dur-fast, 0.15s) var(--ease-out, ease);
        }
        .kz-footer :global(.kz-footer__account-card:hover) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }
        .kz-footer :global(.kz-footer__account-card:focus-visible) {
          outline: none;
          box-shadow: var(--ring);
        }
        .kz-footer__account-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          flex-shrink: 0;
          background: var(--brand-soft);
          color: var(--brand);
          font-size: 21px;
        }
        .kz-footer__account-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .kz-footer__account-title {
          font-size: 14px;
          font-weight: 700;
        }
        .kz-footer__account-hint {
          font-size: 12px;
          color: var(--text-muted);
        }
        .kz-footer :global(.kz-footer__account-caret) {
          margin-left: auto;
          font-size: 18px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
      `}</style>
    </footer>
  );
};

const FooterLink = ({ href, label }) => (
  <li>
    <Link href={href} className="kz-footer__link">
      {label}
    </Link>
  </li>
);

export default FooterOne;
