"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import Icon from "@/components/Icon";

const AUTOPLAY_MS = 5500;

/**
 * Shop-level announcement banner carousel.
 *
 * Renders the `shop.banners` array (returned by the shop detail endpoint)
 * as a cinematic strip above the shop hero. Uses the same visual
 * language as the home BannerOne — full-bleed image, gradient overlay,
 * pip pagination — but a smaller height since shop pages already carry
 * a hero card directly below.
 *
 * Owner-only "Promote to story" CTA fires the supplied `onPromoteToStory`
 * callback with the banner row; the parent decides whether to open the
 * StoryCreateModal (targeting the shop) or wire a future banner-typed
 * story target.
 *
 * No render when the shop has no banners — keeps the hero from getting
 * pushed down with empty space.
 */
const ShopBannerCarousel = ({ banners = [], isOwner = false, onPromoteToStory }) => {
  const t = useTranslations("Banner");
  const items = useMemo(
    () => (Array.isArray(banners) ? banners.filter((b) => b?.picture) : []),
    [banners],
  );
  const total = items.length;

  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (total <= 1 || paused) return undefined;
    const id = window.setTimeout(() => {
      setActiveIdx((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [activeIdx, total, paused]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || total <= 1) return undefined;
    let startX = 0;
    let active = false;
    const onStart = (e) => {
      startX = e.touches[0].clientX;
      active = true;
    };
    const onEnd = (e) => {
      if (!active) return;
      active = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) < 40) return;
      setActiveIdx((i) => (((i + (dx < 0 ? 1 : -1)) % total) + total) % total);
    };
    node.addEventListener("touchstart", onStart, { passive: true });
    node.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchend", onEnd);
    };
  }, [total]);

  const goTo = useCallback(
    (idx) => {
      if (!total) return;
      setActiveIdx(((idx % total) + total) % total);
    },
    [total],
  );

  if (!total) return null;

  return (
    <section
      className="kz-shop-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="kz-shop-banner__head">
        <h2 className="kz-shop-banner__heading">
          <Icon className="ph-fill ph-megaphone" aria-hidden="true" />
          {t("shopBannersTitle")}
        </h2>
      </div>

      <div
        ref={containerRef}
        className="kz-shop-banner__stage"
        role="region"
        aria-roledescription="carousel"
      >
        {items.map((banner, index) => {
          const src = resolveMediaUrl(banner.picture);
          const isActive = index === activeIdx;
          return (
            <article
              key={banner.id ?? index}
              className={`kz-shop-banner__slide ${isActive ? "is-active" : ""}`}
              aria-hidden={!isActive}
            >
              <Image
                src={src}
                alt={banner.title || ""}
                fill
                sizes="(max-width: 992px) 100vw, 880px"
                className="kz-shop-banner__img"
                priority={index === 0}
              />
              <div className="kz-shop-banner__overlay" aria-hidden="true" />
              <div className="kz-shop-banner__content">
                {banner.title && <h3 className="kz-shop-banner__title">{banner.title}</h3>}
                {banner.description && <p className="kz-shop-banner__desc">{banner.description}</p>}
              </div>
              {isOwner && onPromoteToStory && (
                <button
                  type="button"
                  className="kz-shop-banner__story-cta"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPromoteToStory(banner);
                  }}
                  aria-label={t("promoteStory")}
                  title={t("promoteStory")}
                >
                  <span className="kz-shop-banner__story-ring">
                    <Icon className="ph-fill ph-plus" aria-hidden="true" />
                  </span>
                  <span className="kz-shop-banner__story-label">{t("promoteStory")}</span>
                </button>
              )}
            </article>
          );
        })}

        {total > 1 && (
          <div className="kz-shop-banner__pips" role="tablist">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIdx}
                className={`kz-shop-banner__pip ${i === activeIdx ? "is-active" : ""}`}
                onClick={() => goTo(i)}
              >
                <span
                  className="kz-shop-banner__pip-fill"
                  key={`${i}-${activeIdx}-${paused}`}
                  style={{
                    animationDuration: `${AUTOPLAY_MS}ms`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .kz-shop-banner {
          margin-bottom: 16px;
        }
        .kz-shop-banner__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 0 4px;
        }
        .kz-shop-banner__heading {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary, #64748b);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .kz-shop-banner__heading :global(i) {
          font-size: 16px;
          color: var(--main-600, hsl(148, 59%, 39%));
        }

        .kz-shop-banner__stage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 360px;
          min-height: 180px;
          overflow: hidden;
          border-radius: 16px;
          background: var(--surface-muted, #f1f5f9);
          box-shadow:
            0 12px 32px rgba(15, 23, 42, 0.12),
            0 2px 6px rgba(15, 23, 42, 0.05);
        }
        @media (min-width: 768px) {
          .kz-shop-banner__stage {
            aspect-ratio: 21 / 9;
          }
        }

        .kz-shop-banner__slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          transition:
            opacity 0.5s ease,
            visibility 0s linear 0.5s;
        }
        .kz-shop-banner__slide.is-active {
          opacity: 1;
          visibility: visible;
          transition:
            opacity 0.5s ease,
            visibility 0s linear 0s;
        }

        .kz-shop-banner__img {
          object-fit: cover;
          transform: scale(1.02);
          transition: transform 6s ease-out;
        }
        .kz-shop-banner__slide.is-active .kz-shop-banner__img {
          transform: scale(1.08);
        }

        .kz-shop-banner__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.08) 45%,
            rgba(0, 0, 0, 0.6) 88%,
            rgba(0, 0, 0, 0.78) 100%
          );
        }

        .kz-shop-banner__content {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 14px 16px 20px;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }
        @media (min-width: 768px) {
          .kz-shop-banner__content {
            padding: 20px 24px 28px;
          }
        }
        .kz-shop-banner__title {
          margin: 0;
          font-size: clamp(16px, 3.4vw, 24px);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #fff;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
        }
        .kz-shop-banner__desc {
          margin: 0;
          font-size: clamp(12px, 1.8vw, 14px);
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.4;
          max-width: 720px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Owner-only story-promote CTA — Instagram story-ring vibe. */
        .kz-shop-banner__story-cta {
          position: absolute;
          top: 12px;
          right: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 6px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(6px);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          z-index: 3;
          transition:
            background 0.15s ease,
            transform 0.15s ease;
        }
        .kz-shop-banner__story-cta:hover {
          background: rgba(0, 0, 0, 0.6);
          transform: translateY(-1px);
        }
        .kz-shop-banner__story-ring {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fcaf45 0%, #e1306c 50%, #833ab4 100%);
          color: #fff;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.95);
        }
        @media (max-width: 575.98px) {
          .kz-shop-banner__story-cta {
            padding: 4px;
            border-radius: 50%;
            gap: 0;
          }
          .kz-shop-banner__story-label {
            display: none;
          }
        }

        .kz-shop-banner__pips {
          position: absolute;
          top: 12px;
          left: 12px;
          display: inline-flex;
          gap: 6px;
          z-index: 3;
        }
        .kz-shop-banner__pip {
          position: relative;
          width: 22px;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.45);
          border: none;
          padding: 0;
          overflow: hidden;
          cursor: pointer;
        }
        .kz-shop-banner__pip.is-active {
          width: 36px;
          background: rgba(255, 255, 255, 0.35);
        }
        .kz-shop-banner__pip-fill {
          position: absolute;
          inset: 0;
          background: #fff;
          width: 0%;
          opacity: 0;
        }
        .kz-shop-banner__pip.is-active .kz-shop-banner__pip-fill {
          opacity: 1;
          animation-name: kzShopPip;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes kzShopPip {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .kz-shop-banner__img,
          .kz-shop-banner__slide,
          .kz-shop-banner__pip-fill {
            transition: none !important;
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ShopBannerCarousel;
