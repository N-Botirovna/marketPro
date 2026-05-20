"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getBanners } from "@/services/banners";
import { resolveMediaUrl } from "@/utils/mediaUrl";

const FALLBACK_SRC = "/assets/images/logo/kitobzor-logo.png";
const AUTOPLAY_MS = 6500;

/**
 * Home announcement banner — cinematic carousel.
 *
 * The previous template-shipped layout (left-side wordmark / right-side
 * thumbnail) read like a stock e-commerce header and buried the actual
 * announcement. This rewrite goes full-bleed:
 *
 *   - 16/9 hero image covers the full card with object-fit cover.
 *   - Bottom-up gradient overlay keeps text legible against any image
 *     (light, dark, or busy).
 *   - Subtle Ken-Burns zoom (scale 1→1.05 over the slide duration)
 *     keeps a static image feeling alive — the same trick used by the
 *     Telegram channel preview hero and YouTube banner reels.
 *   - Progress pips at the bottom double as the autoplay timer; tapping
 *     a pip jumps to that slide and resets the timer.
 *   - Autoplay pauses on hover, focus and when the tab is hidden so
 *     users don't lose their place mid-read.
 *
 * react-slick was dropped — its jQuery roots fought every animation we
 * wanted to add and it's a 60 KB dep for one slider. Native flexbox +
 * translate is enough here.
 */
const BannerOne = () => {
  const t = useTranslations("Banner");

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getBanners({ limit: 10 });
        if (!alive) return;
        const list = res?.banners || [];
        setBanners(Array.isArray(list) ? list.filter((b) => b?.picture) : []);
      } catch {
        if (alive) setBanners([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Pause when the tab is in the background — autoplay while the user
  // can't see it just wastes battery and de-syncs the visible slide.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const slides = useMemo(() => banners, [banners]);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1 || paused) return undefined;
    const id = window.setTimeout(() => {
      setActiveIdx((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [activeIdx, total, paused]);

  const goTo = useCallback(
    (idx) => {
      if (!total) return;
      setActiveIdx(((idx % total) + total) % total);
    },
    [total],
  );

  // Touch swipe (no library) — track first touch, decide on touchend.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || total <= 1) return undefined;
    let startX = 0;
    let startY = 0;
    let active = false;
    const onStart = (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      active = true;
    };
    const onEnd = (e) => {
      if (!active) return;
      active = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      // Horizontal intent only — ignore vertical scrolls.
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
      goTo(activeIdx + (dx < 0 ? 1 : -1));
    };
    node.addEventListener("touchstart", onStart, { passive: true });
    node.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchend", onEnd);
    };
  }, [activeIdx, total, goTo]);

  if (loading) {
    return (
      <section className="kz-banner kz-banner--skeleton" aria-busy="true">
        <div className="kz-banner__inner">
          <div className="kz-banner__skel" aria-label={t("loading")} />
        </div>
      </section>
    );
  }

  if (!total) {
    return null;
  }

  return (
    <section
      className="kz-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="kz-banner__inner">
        <div
          className="kz-banner__stage"
          ref={containerRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured announcements"
        >
          {slides.map((banner, index) => {
            const src = resolveMediaUrl(banner.picture, FALLBACK_SRC);
            const isActive = index === activeIdx;
            return (
              <article
                key={banner.id ?? index}
                className={`kz-banner__slide ${isActive ? "is-active" : ""}`}
                aria-hidden={!isActive}
                aria-label={t("ariaSlide", { n: index + 1, total })}
              >
                <Image
                  src={src}
                  alt={banner.title || ""}
                  fill
                  sizes="(max-width: 992px) 100vw, 1200px"
                  className="kz-banner__img"
                  priority={index === 0}
                />
                <div className="kz-banner__overlay" aria-hidden="true" />
                <div className="kz-banner__content">
                  <span className="kz-banner__badge">
                    <i className="ph-fill ph-megaphone" aria-hidden="true" />
                    {t("promotedBadge")}
                  </span>
                  {banner.title && <h2 className="kz-banner__title">{banner.title}</h2>}
                </div>
              </article>
            );
          })}

          {/* Side arrows — hidden on touch screens (no hover affordance,
              swipe handles it). */}
          {total > 1 && (
            <>
              <button
                type="button"
                className="kz-banner__arrow kz-banner__arrow--prev"
                onClick={() => goTo(activeIdx - 1)}
                aria-label="Previous"
              >
                <i className="ph-bold ph-caret-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="kz-banner__arrow kz-banner__arrow--next"
                onClick={() => goTo(activeIdx + 1)}
                aria-label="Next"
              >
                <i className="ph-bold ph-caret-right" aria-hidden="true" />
              </button>
            </>
          )}

          {/* Progress pips. Active pip fills left-to-right matching the
              autoplay duration; jumping resets via key change. */}
          {total > 1 && (
            <div className="kz-banner__pips" role="tablist" aria-label="Slides">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIdx}
                  className={`kz-banner__pip ${i === activeIdx ? "is-active" : ""}`}
                  onClick={() => goTo(i)}
                >
                  <span
                    className="kz-banner__pip-fill"
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
      </div>

      <style jsx>{`
        .kz-banner {
          padding: 12px 0 8px;
        }
        @media (min-width: 992px) {
          .kz-banner {
            padding: 18px 0 12px;
          }
        }
        .kz-banner__inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 12px;
        }
        @media (min-width: 992px) {
          .kz-banner__inner {
            padding: 0 24px;
          }
        }

        .kz-banner__stage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 520px;
          min-height: 200px;
          overflow: hidden;
          border-radius: 18px;
          background: linear-gradient(135deg, hsl(148, 24%, 92%), hsl(168, 24%, 88%));
          box-shadow:
            0 24px 48px rgba(15, 23, 42, 0.18),
            0 4px 12px rgba(15, 23, 42, 0.06);
        }
        @media (min-width: 768px) {
          .kz-banner__stage {
            aspect-ratio: 21 / 9;
          }
        }
        @media (min-width: 1200px) {
          .kz-banner__stage {
            aspect-ratio: 24 / 9;
          }
        }

        .kz-banner__slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          transition:
            opacity 0.6s ease,
            visibility 0s linear 0.6s;
        }
        .kz-banner__slide.is-active {
          opacity: 1;
          visibility: visible;
          transition:
            opacity 0.6s ease,
            visibility 0s linear 0s;
        }

        .kz-banner__img {
          object-fit: cover;
          transform: scale(1.02);
          transition: transform 8s ease-out;
        }
        .kz-banner__slide.is-active .kz-banner__img {
          transform: scale(1.08);
        }

        .kz-banner__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.05) 40%,
            rgba(0, 0, 0, 0.55) 78%,
            rgba(0, 0, 0, 0.78) 100%
          );
        }

        .kz-banner__content {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 16px 18px 26px;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 2;
        }
        @media (min-width: 768px) {
          .kz-banner__content {
            padding: 24px 32px 34px;
            gap: 10px;
          }
        }
        @media (min-width: 1200px) {
          .kz-banner__content {
            padding: 32px 48px 44px;
            max-width: 70%;
          }
        }

        .kz-banner__badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, hsl(148, 70%, 50%) 0%, hsl(168, 65%, 38%) 100%);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          align-self: flex-start;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.45);
        }
        .kz-banner__badge :global(i) {
          font-size: 13px;
          line-height: 1;
        }

        .kz-banner__title {
          margin: 0;
          font-size: clamp(18px, 4.2vw, 36px);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
          color: #fff;
        }

        .kz-banner__arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.85);
          color: #0f172a;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          opacity: 0;
          transition:
            opacity 0.2s ease,
            background 0.15s ease,
            transform 0.15s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .kz-banner__stage:hover .kz-banner__arrow,
        .kz-banner__arrow:focus-visible {
          opacity: 1;
        }
        .kz-banner__arrow:hover {
          background: #fff;
          transform: translateY(-50%) scale(1.06);
        }
        .kz-banner__arrow--prev {
          left: 12px;
        }
        .kz-banner__arrow--next {
          right: 12px;
        }
        @media (hover: none) {
          .kz-banner__arrow {
            display: none;
          }
        }

        .kz-banner__pips {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(0, 0, 0, 0.28);
          border-radius: 999px;
          backdrop-filter: blur(6px);
          z-index: 3;
        }
        @media (min-width: 768px) {
          .kz-banner__pips {
            top: 16px;
            gap: 8px;
            padding: 7px 12px;
          }
        }
        .kz-banner__pip {
          position: relative;
          width: 24px;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.45);
          border: none;
          padding: 0;
          overflow: hidden;
          cursor: pointer;
          transition:
            background 0.15s ease,
            width 0.3s ease;
        }
        @media (min-width: 768px) {
          .kz-banner__pip {
            width: 32px;
            height: 5px;
          }
        }
        .kz-banner__pip.is-active {
          width: 44px;
          background: rgba(255, 255, 255, 0.4);
        }
        @media (min-width: 768px) {
          .kz-banner__pip.is-active {
            width: 56px;
          }
        }
        .kz-banner__pip-fill {
          position: absolute;
          inset: 0;
          background: #fff;
          width: 0%;
          opacity: 0;
        }
        .kz-banner__pip.is-active .kz-banner__pip-fill {
          opacity: 1;
          animation-name: kzBannerPip;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        @keyframes kzBannerPip {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .kz-banner__skel {
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 520px;
          min-height: 200px;
          border-radius: 18px;
          background: linear-gradient(
            90deg,
            var(--surface-muted, #f1f5f9) 0%,
            var(--surface-card, #fff) 50%,
            var(--surface-muted, #f1f5f9) 100%
          );
          background-size: 200% 100%;
          animation: kzBannerShimmer 1.4s ease-in-out infinite;
        }
        @keyframes kzBannerShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .kz-banner__img,
          .kz-banner__slide,
          .kz-banner__pip-fill {
            transition: none !important;
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default memo(BannerOne);
