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
 * Footer — three balanced columns:
 *
 *   1) Brand + Telegram-bot CTA      (left, the primary conversion path)
 *   2) Site & Help links             (centre, two short stacks)
 *   3) Account / Social              (right, auth-aware profile entry)
 *
 * Removed (template leftovers):
 *   - Redundant phone/email/address (Contact page already covers these)
 *   - App-store buttons (no native app yet)
 *   - Twitter / LinkedIn / Pinterest (we don't run those accounts)
 *
 * The whole footer sits over a soft pattern background. Surfaces use the
 * `--surface-*` CSS vars so dark mode renders without extra rules.
 */
const FooterOne = () => {
  const tF = useTranslations("Footer");
  const tHeader = useTranslations("Header");
  const { isAuthenticated: isAuth } = useAuth();

  return (
    <footer
      className="footer"
      style={{
        position: "relative",
        backgroundColor: "var(--surface-page)",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "48px",
        paddingBottom: "32px",
      }}
    >
      <img
        src="/assets/images/bg/kitobzor-footer-bg.png"
        alt=""
        aria-hidden="true"
        className="body-bottom-bg"
      />

      <div className="container container-lg position-relative">
        <div className="row gy-5">
          {/* ─── Brand + Telegram bot CTA ───────────────────────────── */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-item">
              <div className="footer-item__logo mb-16">
                <Link
                  href="/"
                  aria-label="Kitobzor"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    textDecoration: "none",
                    color: "var(--text-primary)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "#e7f1ea",
                      boxShadow: "0 6px 14px rgba(34, 197, 94, 0.18)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src="/assets/images/logo/kitobzor-logo.png"
                      alt=""
                      width={44}
                      height={44}
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    kitobzor
                  </span>
                </Link>
              </div>
              <p className="mb-16" style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {tF("about.blurb")}
              </p>
              {/* Bot deep-link intentionally removed from the footer — the
                  login page is the single canonical entry to the bot, so
                  there's no need to advertise it elsewhere on the site. */}
            </div>
          </div>

          {/* ─── Site nav ────────────────────────────────────────────── */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6
              className="mb-16"
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                letterSpacing: 0.5,
              }}
            >
              {tF("site.title")}
            </h6>
            <ul className="footer-menu list-unstyled m-0">
              <FooterLink href="/" label={tF("site.home")} />
              <FooterLink href="/shops" label={tF("site.shops")} />
              <FooterLink href="/community/all" label={tF("site.community")} />
              <li className="mb-10">
                <button
                  type="button"
                  onClick={openSellerModal}
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    transition: "color 0.15s ease",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  className="hover-text-main-500"
                >
                  {tF("site.becomeSeller")}
                </button>
              </li>
            </ul>
          </div>

          {/* ─── Help / info ─────────────────────────────────────────── */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6
              className="mb-16"
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                letterSpacing: 0.5,
              }}
            >
              {tF("help.title")}
            </h6>
            <ul className="footer-menu list-unstyled m-0">
              <FooterLink href="/about-us" label={tF("help.aboutUs")} />
              <FooterLink href="/contact" label={tF("help.contact")} />
              <FooterLink href="/faq" label={tF("help.faq")} />
              <FooterLink href="/policies" label={tF("help.privacy")} />
            </ul>
          </div>

          {/* ─── Account + Social ────────────────────────────────────── */}
          <div className="col-lg-4 col-md-12">
            <h6
              className="mb-16"
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                letterSpacing: 0.5,
              }}
            >
              {tF("account.title")}
            </h6>

            <div className="mb-20">
              {isAuth ? (
                <Link
                  href="/account"
                  className="d-inline-flex align-items-center gap-12 rounded-3 px-16 py-12 w-100"
                  style={{
                    backgroundColor: "var(--surface-card)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    boxShadow: "var(--shadow-card)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <span
                    className="flex-center rounded-circle flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "var(--main-50, hsl(148, 59%, 95%))",
                      color: "var(--main-600, hsl(148, 59%, 39%))",
                      fontSize: 20,
                    }}
                  >
                    <Icon className="ph-fill ph-user" aria-hidden="true" />
                  </span>
                  <span className="d-flex flex-column" style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      {tF("account.openProfile")}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                      }}
                    >
                      {tF("account.openProfileHint")}
                    </span>
                  </span>
                  <Icon
                    className="ph ph-caret-right ms-auto"
                    style={{ fontSize: 18, color: "var(--text-muted)" }}
                    aria-hidden="true"
                  />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="d-inline-flex align-items-center gap-12 rounded-3 px-16 py-12 w-100"
                  style={{
                    backgroundColor: "var(--surface-card)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <span
                    className="flex-center rounded-circle flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "var(--main-50, hsl(148, 59%, 95%))",
                      color: "var(--main-600, hsl(148, 59%, 39%))",
                      fontSize: 20,
                    }}
                  >
                    <Icon className="ph-fill ph-sign-in" aria-hidden="true" />
                  </span>
                  <span className="d-flex flex-column" style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{tHeader("login")}</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                      }}
                    >
                      {tF("account.loginHint")}
                    </span>
                  </span>
                  <Icon
                    className="ph ph-caret-right ms-auto"
                    style={{ fontSize: 18, color: "var(--text-muted)" }}
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>

            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                {tF("social.followUs")}
              </p>
              <ul className="d-flex gap-12 list-unstyled m-0">
                <li>
                  <a
                    href={getTelegramChannelUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram"
                    className="flex-center rounded-circle"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "var(--surface-card)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--main-600, hsl(148, 59%, 39%))",
                      fontSize: 18,
                    }}
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
                    className="flex-center rounded-circle"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "var(--surface-card)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--main-600, hsl(148, 59%, 39%))",
                      fontSize: 18,
                    }}
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
                    className="flex-center rounded-circle"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "var(--surface-card)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--main-600, hsl(148, 59%, 39%))",
                      fontSize: 18,
                    }}
                  >
                    <Icon className="ph-fill ph-facebook-logo" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, label }) => (
  <li className="mb-10">
    <Link
      href={href}
      style={{
        fontSize: 14,
        color: "var(--text-secondary)",
        textDecoration: "none",
        transition: "color 0.15s ease",
      }}
      className="hover-text-main-500"
    >
      {label}
    </Link>
  </li>
);

export default FooterOne;
