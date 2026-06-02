"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLikedBooks } from "@/services/books";
import { useAuth } from "@/hooks/useAuth";
import Icon from "@/components/Icon";
import { useToast } from "./Toast";
import BookCard from "./BookCard";
import BookGrid from "./shared/BookGrid";

const SKELETON_CARDS = 6;

/**
 * Wishlist surface — responsive card grid.
 *
 * The previous version was a 4-column table that horizontally scrolled
 * on phones and looked stale on desktop. This rewrite uses the same
 * BookCard the home/community grids use, so:
 *
 *   - One source of truth for thumbnail aspect, like-toggle, share, price.
 *   - The heart icon in the card already toggles the like — tapping it
 *     "removes" the book from the wishlist (we drop it from state when
 *     the toggle returns isLiked=false). No extra "remove" column needed.
 *   - Layout matches the rest of the app at every breakpoint
 *     (col-12 → col-sm-6 → col-lg-4 → col-xl-3).
 *
 * Empty / unauth / loading states each get a dedicated panel that
 * leads the user back into the funnel (browse books, sign in) instead
 * of dead-ending on a centered icon.
 */
const WishListSection = () => {
  const { isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const tCommon = useTranslations("Common");
  const t = useTranslations("WishList");

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // `useToast` returns a brand-new `showToast` reference every render and
  // `next-intl` translators are also recreated per render. Listing them as
  // effect deps would re-fire the fetch on every state update → setLoading
  // bounces → the page flickers between skeleton and loaded views.
  // Park them on a ref so the effect only reacts to `isAuthenticated`.
  const toastRef = useRef(showToast);
  const tRef = useRef(tCommon);
  toastRef.current = showToast;
  tRef.current = tCommon;

  useEffect(() => {
    if (!isAuthenticated) {
      setBooks([]);
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    getLikedBooks()
      .then((response) => {
        if (!alive) return;
        setBooks(response.books || []);
      })
      .catch(() => {
        if (!alive) return;
        toastRef.current?.({
          type: "error",
          title: tRef.current?.("error"),
          duration: 3000,
        });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  // BookCard fires this when the heart is toggled. Unliking → the book is
  // no longer a wishlist member, so drop it locally and emit the global
  // event so the header counter syncs.
  const handleLikeUpdate = (bookId, isLiked) => {
    if (isLiked === false) {
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bookUnliked"));
      }
      showToast({
        type: "success",
        title: t("removedToast"),
        duration: 2200,
      });
    }
  };

  // ── Unauthenticated gate ──────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <section className="kz-wish">
        <div className="kz-wish__inner">
          <EmptyPanel
            icon="ph-fill ph-lock-key"
            title={t("loginGateTitle")}
            body={t("loginGateBody")}
            ctaLabel={t("login")}
            ctaHref="/login"
          />
        </div>
        <WishStyles />
      </section>
    );
  }

  // ── Empty (signed-in, fetch finished, no liked books) ─────────────
  if (!loading && books.length === 0) {
    return (
      <section className="kz-wish">
        <div className="kz-wish__inner">
          <EmptyPanel
            icon="ph-fill ph-heart-break"
            title={t("empty")}
            body={t("emptyHint")}
            ctaLabel={t("browseBooks")}
            ctaHref="/community/all"
          />
        </div>
        <WishStyles />
        <ToastContainer />
      </section>
    );
  }

  // ── Loading + populated grid ──────────────────────────────────────
  // `BookGrid` swaps skeletons for cards at the same breakpoints, so the
  // header is rendered once and the grid never reflows on data arrival.
  return (
    <section className="kz-wish">
      <div className="kz-wish__inner">
        <header className="kz-wish__head">
          <div className="kz-wish__head-text">
            <h1 className="kz-wish__title">
              <Icon className="ph-fill ph-heart" aria-hidden="true" />
              {t("heroTitle")}
            </h1>
            <p className="kz-wish__subtitle">{t("heroSubtitle")}</p>
          </div>
          {!loading && (
            <div className="kz-wish__head-meta">
              <span className="kz-wish__count">
                {t(books.length === 1 ? "countOne" : "countMany", { count: books.length })}
              </span>
              <Link href="/community/all" className="kz-wish__browse">
                <Icon className="ph ph-magnifying-glass" aria-hidden="true" />
                <span>{t("browseMore")}</span>
              </Link>
            </div>
          )}
        </header>

        <BookGrid
          books={books}
          loading={loading}
          skeletonCount={SKELETON_CARDS}
          renderCard={(book) => <BookCard book={book} onLikeUpdate={handleLikeUpdate} />}
        />
      </div>
      <ToastContainer />
      <WishStyles />
    </section>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────

const EmptyPanel = ({ icon, title, body, ctaLabel, ctaHref }) => (
  <div className="kz-wish__empty">
    <span className="kz-wish__empty-icon" aria-hidden="true">
      <Icon className={icon} />
    </span>
    <h2 className="kz-wish__empty-title">{title}</h2>
    <p className="kz-wish__empty-body">{body}</p>
    <Link href={ctaHref} className="kz-wish__empty-cta">
      {ctaLabel}
      <Icon className="ph-bold ph-arrow-right" aria-hidden="true" />
    </Link>
  </div>
);

const WishStyles = () => (
  // eslint-disable-next-line no-restricted-syntax -- static internal CSS, no user input
  <style
    dangerouslySetInnerHTML={{
      __html: `
    .kz-wish {
      padding: 20px 0 56px;
      background: var(--surface-page, #fff);
      min-height: 60vh;
    }
    @media (min-width: 768px) {
      .kz-wish { padding: 32px 0 72px; }
    }
    .kz-wish__inner {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 12px;
    }
    @media (min-width: 992px) {
      .kz-wish__inner { padding: 0 24px; }
    }

    .kz-wish__head {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 18px;
      padding: 18px 18px 16px;
      border-radius: 16px;
      background: linear-gradient(135deg,
        hsl(148, 38%, 96%) 0%,
        hsl(168, 38%, 95%) 50%,
        hsl(20, 100%, 97%) 100%);
      border: 1px solid var(--border-subtle, #e5e7eb);
    }
    @media (min-width: 768px) {
      .kz-wish__head {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 22px 26px;
        margin-bottom: 26px;
      }
    }
    .kz-wish__head-text { min-width: 0; }
    .kz-wish__title {
      margin: 0 0 6px;
      font-size: clamp(20px, 4vw, 28px);
      font-weight: 800;
      letter-spacing: -0.01em;
      color: var(--text-primary, #0f172a);
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .kz-wish__title i {
      color: #ef4444;
      font-size: 22px;
    }
    .kz-wish__subtitle {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      line-height: 1.5;
      max-width: 540px;
    }
    @media (min-width: 768px) {
      .kz-wish__subtitle { font-size: 14px; }
    }

    .kz-wish__head-meta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .kz-wish__count {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 999px;
      background: var(--surface-card, #fff);
      color: var(--text-primary, #0f172a);
      font-size: 12px;
      font-weight: 700;
      border: 1px solid var(--border-subtle, #e5e7eb);
    }
    .kz-wish__browse {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      background: var(--main-600, hsl(148, 59%, 39%));
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.15s ease, transform 0.1s ease;
    }
    .kz-wish__browse:hover {
      background: var(--main-700, hsl(148, 59%, 32%));
      color: #fff;
    }
    .kz-wish__browse:active { transform: scale(0.97); }
    .kz-wish__browse i { font-size: 14px; line-height: 1; }

    /* ─── Empty / login-gate panel ──────────────────────────────── */
    .kz-wish__empty {
      max-width: 460px;
      margin: 24px auto 32px;
      padding: 32px 22px;
      border-radius: 18px;
      background: var(--surface-card, #fff);
      border: 1px solid var(--border-subtle, #e5e7eb);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
      text-align: center;
    }
    @media (min-width: 768px) {
      .kz-wish__empty {
        margin: 48px auto 64px;
        padding: 48px 32px;
      }
    }
    .kz-wish__empty-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg,
        rgba(239, 68, 68, 0.14) 0%,
        rgba(250, 100, 0, 0.14) 100%);
      color: #ef4444;
      font-size: 34px;
      margin-bottom: 18px;
    }
    .kz-wish__empty-title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
    }
    @media (min-width: 768px) {
      .kz-wish__empty-title { font-size: 20px; }
    }
    .kz-wish__empty-body {
      margin: 0 0 22px;
      font-size: 14px;
      line-height: 1.55;
      color: var(--text-secondary, #64748b);
    }
    .kz-wish__empty-cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      border-radius: 999px;
      background: linear-gradient(135deg,
        hsl(148, 70%, 45%) 0%,
        hsl(168, 65%, 38%) 100%);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 10px 22px rgba(34, 197, 94, 0.32);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .kz-wish__empty-cta:hover {
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 14px 26px rgba(34, 197, 94, 0.4);
    }
    .kz-wish__empty-cta i { font-size: 15px; }
  `,
    }}
  />
);

export default WishListSection;
