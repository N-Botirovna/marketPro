"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { isAuthenticated } from "@/services/auth";
import { getLikedBooks } from "@/services/books";
import { addLike, clearLikes, getAllLikes } from "@/utils/likeStorage";
import { useAuth } from "@/hooks/useAuth";
import { Link, usePathname } from "@/i18n/navigation";
import { openSellerModal } from "@/lib/sellerModal";
import Icon from "@/components/Icon";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * Telegram-inspired header.
 *
 *   Desktop : [☰] [🟢 kitobzor]                       [🌙] [🌐] [👤]
 *   Mobile  : [☰] [🟢 kitobzor]                                  [👤]
 *
 * The hamburger opens a slide-in drawer (Telegram-style) holding the
 * secondary nav — Profile, Wishlist, Open shop, About, Contact, FAQ,
 * Privacy, Settings (theme + language), Logout. The header bar itself
 * only carries the brand, quick theme/language toggles (desktop), and a
 * single avatar button.
 *
 * Primary site navigation (Shops, Community books, Contact) used to live
 * here but was removed — those surfaces are already represented as cards
 * on the homepage, and the drawer surfaces Contact/etc. directly.
 */
const HeaderOne = () => {
  const pathname = usePathname();
  const { isAuthenticated: isAuth, isLoading: authLoading, logout } = useAuth();
  const tHeader = useTranslations("Header");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [likedBooksCount, setLikedBooksCount] = useState(0);
  const [scroll, setScroll] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [isAuth]);

  useEffect(() => {
    const onScroll = () => setScroll(window.pageYOffset > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const fetchCount = async () => {
      if (!isAuth) {
        setLikedBooksCount(0);
        clearLikes();
        return;
      }
      try {
        const res = await getLikedBooks();
        const books = res.books || [];
        books.forEach((b) => b?.id && addLike(b.id));
        setLikedBooksCount(res.count || books.length || 0);
      } catch {
        setLikedBooksCount(0);
      }
    };
    fetchCount();
  }, [isAuth, authLoading]);

  useEffect(() => {
    if (!isAuth) return undefined;
    const sync = () => {
      try {
        setLikedBooksCount(getAllLikes().length);
      } catch {
        /* localStorage blocked — keep previous count */
      }
    };
    window.addEventListener("bookLiked", sync);
    window.addEventListener("bookUnliked", sync);
    return () => {
      window.removeEventListener("bookLiked", sync);
      window.removeEventListener("bookUnliked", sync);
    };
  }, [isAuth]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.toggle("body-no-scroll", menuActive);
    return () => document.body.classList.remove("body-no-scroll");
  }, [menuActive]);

  useEffect(() => {
    setMenuActive(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const onDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

  const closeAll = useCallback(() => {
    setMenuActive(false);
    setProfileOpen(false);
  }, []);

  const handleSellerClick = useCallback(() => {
    closeAll();
    openSellerModal();
  }, [closeAll]);

  const handleLogout = useCallback(async () => {
    closeAll();
    try {
      await logout();
    } catch {
      /* logout swallows errors itself — best-effort */
    }
  }, [closeAll, logout]);

  return (
    <>
      <header className={`kz-header ${scroll ? "kz-header--scrolled" : ""}`} role="banner">
        <div className="kz-header__inner">
          {/* Hamburger — always visible (Telegram style). Opens the
              secondary-nav drawer. */}
          <button
            type="button"
            onClick={() => setMenuActive((p) => !p)}
            className="kz-header__icon-btn"
            aria-label={tHeader("menu")}
            aria-expanded={menuActive}
          >
            <Icon className="ph ph-list" />
          </button>

          <Link href="/" className="kz-header__logo" aria-label="Kitobzor" onClick={closeAll}>
            <span className="kz-header__logo-mark">
              <Image
                src="/assets/images/logo/kitobzor-logo.png"
                alt=""
                width={36}
                height={36}
                priority
              />
            </span>
            <span className="kz-header__logo-text">kitobzor</span>
          </Link>

          {/* Right cluster: theme · language · profile. All three stay
              visible on every breakpoint — settings shouldn't disappear
              on mobile. They simply tighten up below 576px. */}
          <div className="kz-header__right">
            <ThemeToggle />
            <LanguageSwitcher />

            <div className="kz-header__profile" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((p) => !p)}
                className={`kz-header__avatar ${isLoggedIn ? "kz-header__avatar--auth" : ""}`}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label={tHeader("account")}
              >
                <Icon
                  className={isLoggedIn ? "ph-fill ph-user" : "ph ph-user"}
                  aria-hidden="true"
                />
                {isLoggedIn && likedBooksCount > 0 && (
                  <span className="kz-header__profile-dot" aria-hidden="true" />
                )}
              </button>

              {profileOpen && (
                <div className="kz-header__menu" role="menu">
                  {isLoggedIn ? (
                    <>
                      <Link href="/account" className="kz-header__menu-item" role="menuitem">
                        <Icon className="ph ph-user" />
                        <span>{tHeader("profile")}</span>
                      </Link>
                      <Link href="/wishlist" className="kz-header__menu-item" role="menuitem">
                        <Icon className="ph ph-heart" />
                        <span>{tHeader("wishlist")}</span>
                        {likedBooksCount > 0 && (
                          <span className="kz-header__menu-count">
                            {likedBooksCount > 99 ? "99+" : likedBooksCount}
                          </span>
                        )}
                      </Link>
                      <button
                        type="button"
                        onClick={handleSellerClick}
                        className="kz-header__menu-item"
                        role="menuitem"
                      >
                        <Icon className="ph ph-storefront" />
                        <span>{tHeader("becomeSeller")}</span>
                      </button>
                      <div className="kz-header__menu-divider" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="kz-header__menu-item kz-header__menu-item--danger"
                        role="menuitem"
                      >
                        <Icon className="ph ph-sign-out" />
                        <span>{tHeader("logout")}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="kz-header__menu-item" role="menuitem">
                        <Icon className="ph ph-sign-in" />
                        <span>{tHeader("login")}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleSellerClick}
                        className="kz-header__menu-item"
                        role="menuitem"
                      >
                        <Icon className="ph ph-storefront" />
                        <span>{tHeader("becomeSeller")}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Slide-in drawer (Telegram side menu) ──────────────── */}
      {menuActive && <div className="kz-drawer-backdrop" onClick={() => setMenuActive(false)} />}
      <aside
        className={`kz-drawer ${menuActive ? "kz-drawer--open" : ""}`}
        aria-hidden={!menuActive}
      >
        <div className="kz-drawer__head">
          <Link
            href="/"
            onClick={() => setMenuActive(false)}
            className="kz-drawer__logo"
            aria-label="Kitobzor"
          >
            <span className="kz-drawer__logo-mark">
              <Image src="/assets/images/logo/kitobzor-logo.png" alt="" width={32} height={32} />
            </span>
            <span>kitobzor</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuActive(false)}
            className="kz-header__icon-btn"
            aria-label="Close"
          >
            <Icon className="ph ph-x" />
          </button>
        </div>

        <nav className="kz-drawer__nav" aria-label="Main menu">
          {isLoggedIn ? (
            <>
              <Link
                href="/account"
                onClick={() => setMenuActive(false)}
                className="kz-drawer__link"
              >
                <Icon className="ph ph-user-circle" />
                <span>{tHeader("profile")}</span>
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMenuActive(false)}
                className="kz-drawer__link"
              >
                <Icon className="ph ph-heart" />
                <span>{tHeader("wishlist")}</span>
                {likedBooksCount > 0 && (
                  <span className="kz-header__menu-count">
                    {likedBooksCount > 99 ? "99+" : likedBooksCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuActive(false)} className="kz-drawer__link">
              <Icon className="ph ph-sign-in" />
              <span>{tHeader("login")}</span>
            </Link>
          )}
          <button type="button" onClick={handleSellerClick} className="kz-drawer__link">
            <Icon className="ph ph-storefront" />
            <span>{tHeader("becomeSeller")}</span>
          </button>

          <div className="kz-drawer__divider" />

          <Link href="/about-us" onClick={() => setMenuActive(false)} className="kz-drawer__link">
            <Icon className="ph ph-info" />
            <span>{tHeader("aboutUs")}</span>
          </Link>
          <Link href="/contact" onClick={() => setMenuActive(false)} className="kz-drawer__link">
            <Icon className="ph ph-chat-circle-text" />
            <span>{tHeader("contact")}</span>
          </Link>
          <Link href="/faq" onClick={() => setMenuActive(false)} className="kz-drawer__link">
            <Icon className="ph ph-question" />
            <span>{tHeader("faq")}</span>
          </Link>
          <Link href="/policies" onClick={() => setMenuActive(false)} className="kz-drawer__link">
            <Icon className="ph ph-shield-check" />
            <span>{tHeader("privacy")}</span>
          </Link>

          <div className="kz-drawer__divider" />

          {/* Settings group: theme + language inline like Telegram's
              "Settings" expanded section. Mobile gets them here since the
              header hides them <576px. */}
          <div className="kz-drawer__section-label">{tHeader("settings")}</div>
          <div className="kz-drawer__row">
            <div className="kz-drawer__row-label">
              <Icon className="ph ph-paint-brush" />
              <span>{tHeader("appearance")}</span>
            </div>
            <ThemeToggle />
          </div>
          <div className="kz-drawer__row">
            <div className="kz-drawer__row-label">
              <Icon className="ph ph-globe" />
              <span>{tHeader("language")}</span>
            </div>
            <LanguageSwitcher />
          </div>

          {isLoggedIn && (
            <>
              <div className="kz-drawer__divider" />
              <button
                type="button"
                onClick={handleLogout}
                className="kz-drawer__link kz-drawer__link--danger"
              >
                <Icon className="ph ph-sign-out" />
                <span>{tHeader("logout")}</span>
              </button>
            </>
          )}
        </nav>
      </aside>

      <style jsx>{`
        .kz-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--surface-card, #fff);
          border-bottom: 1px solid transparent;
          transition:
            box-shadow 0.18s ease,
            border-color 0.18s ease;
        }
        .kz-header--scrolled {
          border-bottom-color: var(--border-subtle, #e5e7eb);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }
        .kz-header__inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 8px;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        @media (min-width: 576px) {
          .kz-header__inner {
            padding: 0 12px;
            gap: 8px;
            height: 60px;
          }
        }
        @media (min-width: 992px) {
          .kz-header__inner {
            padding: 0 24px;
            gap: 14px;
            height: 64px;
          }
        }

        /* :global so the rules survive next-intl Link not forwarding the
           styled-jsx scope class. */
        :global(.kz-header__logo),
        :global(.kz-header__logo):hover,
        :global(.kz-header__logo):focus,
        :global(.kz-header__logo):visited {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex: 0 1 auto;
          min-width: 0;
          text-decoration: none;
          color: var(--text-primary, #111827);
        }
        :global(.kz-header__logo-mark) {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #e7f1ea;
          flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }
        :global(.kz-header__logo-mark img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        :global(.kz-header__logo-text) {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text-primary, #111827);
        }
        /* Hide wordmark on the tightest phones so the right cluster
           always fits. The logo mark itself stays. */
        @media (max-width: 419px) {
          :global(.kz-header__logo-text) {
            display: none;
          }
        }
        @media (min-width: 576px) {
          :global(.kz-header__logo-mark) {
            width: 36px;
            height: 36px;
          }
          :global(.kz-header__logo-text) {
            font-size: 18px;
          }
        }
        @media (min-width: 992px) {
          :global(.kz-header__logo) {
            gap: 10px;
          }
          :global(.kz-header__logo-mark) {
            width: 40px;
            height: 40px;
          }
          :global(.kz-header__logo-text) {
            font-size: 19px;
          }
        }

        .kz-header__right {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 0;
          flex-shrink: 0;
        }
        @media (min-width: 576px) {
          .kz-header__right {
            gap: 2px;
          }
        }
        @media (min-width: 992px) {
          .kz-header__right {
            gap: 6px;
          }
        }

        .kz-header__icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-primary, #111827);
          font-size: 20px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease;
          flex-shrink: 0;
        }
        @media (min-width: 576px) {
          .kz-header__icon-btn {
            width: 40px;
            height: 40px;
            font-size: 22px;
          }
        }
        .kz-header__icon-btn:hover {
          background: var(--surface-muted, #f3f4f6);
        }
        .kz-header__icon-btn:focus-visible {
          outline: 2px solid var(--main-600, hsl(148, 59%, 39%));
          outline-offset: 2px;
        }

        .kz-header__profile {
          position: relative;
        }
        .kz-header__avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1.5px solid var(--border-subtle, #e5e7eb);
          background: var(--surface-page, #fff);
          color: var(--text-secondary, #4b5563);
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-left: 2px;
          transition:
            background 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        @media (min-width: 576px) {
          .kz-header__avatar {
            width: 36px;
            height: 36px;
            font-size: 18px;
            margin-left: 4px;
          }
        }
        .kz-header__avatar:hover {
          background: var(--surface-muted, #f3f4f6);
          border-color: var(--text-secondary, #4b5563);
        }
        .kz-header__avatar:focus-visible {
          outline: 2px solid var(--main-600, hsl(148, 59%, 39%));
          outline-offset: 2px;
        }
        .kz-header__avatar--auth {
          background: linear-gradient(135deg, hsl(148, 59%, 45%) 0%, hsl(148, 59%, 32%) 100%);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
        }
        .kz-header__avatar--auth:hover {
          background: linear-gradient(135deg, hsl(148, 59%, 48%) 0%, hsl(148, 59%, 35%) 100%);
          color: #fff;
        }
        .kz-header__profile-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid var(--surface-page, #fff);
        }

        .kz-header__menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 220px;
          background: var(--surface-card, #fff);
          border: 1px solid var(--border-subtle, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          padding: 6px;
          z-index: 110;
        }
        :global(.kz-header__menu-item),
        :global(.kz-header__menu-item):hover,
        :global(.kz-header__menu-item):focus,
        :global(.kz-header__menu-item):visited {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--text-primary, #111827);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        :global(.kz-header__menu-item i) {
          font-size: 18px;
          color: var(--text-secondary, #4b5563);
          flex-shrink: 0;
        }
        :global(.kz-header__menu-item):hover {
          background: var(--surface-muted, #f3f4f6);
        }
        :global(.kz-header__menu-item--danger),
        :global(.kz-header__menu-item--danger):hover {
          color: #dc2626;
        }
        :global(.kz-header__menu-item--danger i) {
          color: #dc2626;
        }
        .kz-header__menu-divider {
          height: 1px;
          background: var(--border-subtle, #e5e7eb);
          margin: 6px 4px;
        }
        .kz-header__menu-count {
          margin-left: auto;
          min-width: 22px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          background: var(--main-600, hsl(148, 59%, 39%));
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        /* ─── Drawer ───────────────────────────────────────────── */
        .kz-drawer {
          position: fixed;
          top: 0;
          left: 0;
          height: 100dvh;
          width: min(86vw, 320px);
          background: var(--surface-card, #fff);
          z-index: 200;
          transform: translateX(-100%);
          transition: transform 0.22s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 6px 0 24px rgba(0, 0, 0, 0.12);
        }
        .kz-drawer--open {
          transform: translateX(0);
        }
        .kz-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          z-index: 199;
          backdrop-filter: blur(2px);
        }
        .kz-drawer__head {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle, #e5e7eb);
        }
        :global(.kz-drawer__logo),
        :global(.kz-drawer__logo):hover,
        :global(.kz-drawer__logo):visited {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-primary, #111827);
          font-weight: 800;
          font-size: 17px;
          letter-spacing: -0.02em;
        }
        :global(.kz-drawer__logo-mark) {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #e7f1ea;
        }
        :global(.kz-drawer__logo-mark img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .kz-drawer__nav {
          flex: 1;
          padding: 8px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        :global(.kz-drawer__link),
        :global(.kz-drawer__link):hover,
        :global(.kz-drawer__link):focus,
        :global(.kz-drawer__link):visited {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          color: var(--text-primary, #111827);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
        }
        :global(.kz-drawer__link i) {
          font-size: 22px;
          color: var(--text-secondary, #4b5563);
          flex-shrink: 0;
        }
        :global(.kz-drawer__link):hover {
          background: var(--surface-muted, #f3f4f6);
        }
        :global(.kz-drawer__link--danger),
        :global(.kz-drawer__link--danger):hover {
          color: #dc2626;
        }
        :global(.kz-drawer__link--danger i) {
          color: #dc2626;
        }
        .kz-drawer__divider {
          height: 1px;
          background: var(--border-subtle, #e5e7eb);
          margin: 8px 4px;
        }
        .kz-drawer__section-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #6b7280);
          padding: 8px 14px 4px;
        }
        .kz-drawer__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px;
          gap: 12px;
        }
        .kz-drawer__row-label {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }
        .kz-drawer__row-label :global(i) {
          font-size: 20px;
          color: var(--text-secondary, #4b5563);
        }
      `}</style>
    </>
  );
};

export default HeaderOne;
