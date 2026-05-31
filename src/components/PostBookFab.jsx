"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { isAuthenticated } from "@/services/auth";
import { openPostBookModal } from "@/lib/postBookModal";
import Icon from "@/components/Icon";

const HIDDEN_SUFFIXES = ["/login", "/auth/auto"];
const shouldHide = (pathname) => {
  if (!pathname) return false;
  return HIDDEN_SUFFIXES.some((s) => pathname.endsWith(s));
};

/**
 * "Post a book" floating action button.
 *
 *   - Open-book glyph reads as "publish content" more clearly than a
 *     closed book.
 *   - A pencil/sparkle badge replaces the bare "+" so the button reads as
 *     "create / write" rather than just "add".
 *   - Hover/idle wiggle keeps it feeling alive without being distracting.
 *   - Desktop hover reveals a chip label so first-time users learn the
 *     action without needing to tap to read the tooltip.
 */
const PostBookFab = () => {
  const t = useTranslations("Fab");
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  if (shouldHide(pathname)) return null;

  const handleClick = () => {
    if (isAuthenticated()) {
      openPostBookModal();
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <div
        className="post-book-fab__wrap"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className={`post-book-fab__label ${hovered ? "is-visible" : ""}`} aria-hidden="true">
          {t("postBookTooltip")}
        </span>
        <button
          type="button"
          onClick={handleClick}
          aria-label={t("postBookAria")}
          title={t("postBookTooltip")}
          className="post-book-fab"
        >
          <span className="post-book-fab__glyph" aria-hidden="true">
            <Icon className="ph-fill ph-book-open-text" />
          </span>
          <span className="post-book-fab__badge" aria-hidden="true">
            <Icon className="ph-bold ph-pencil-simple-line" />
          </span>
          <span className="post-book-fab__pulse" aria-hidden="true" />
        </button>
      </div>

      <style jsx>{`
        .post-book-fab__wrap {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 1100;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          /* Safe-area for iOS home-bar */
          margin-bottom: env(safe-area-inset-bottom, 0);
        }

        .post-book-fab__label {
          background: var(--surface-card, #fff);
          color: var(--text-primary, #111827);
          font-size: 13px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 999px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.14);
          border: 1px solid var(--border-subtle, #e5e7eb);
          opacity: 0;
          transform: translateX(8px);
          pointer-events: none;
          transition:
            opacity 0.18s ease,
            transform 0.18s ease;
          white-space: nowrap;
          display: none;
        }
        @media (min-width: 992px) {
          .post-book-fab__label {
            display: inline-flex;
          }
        }
        .post-book-fab__label.is-visible {
          opacity: 1;
          transform: translateX(0);
        }

        .post-book-fab {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          padding: 0;
          background: linear-gradient(
            135deg,
            hsl(148, 70%, 50%) 0%,
            hsl(168, 65%, 38%) 60%,
            hsl(188, 70%, 42%) 100%
          );
          color: #fff;
          cursor: pointer;
          box-shadow:
            0 12px 28px rgba(34, 197, 94, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
          animation: fabIdle 4.2s ease-in-out infinite;
        }
        .post-book-fab:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow:
            0 18px 34px rgba(34, 197, 94, 0.5),
            0 4px 10px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        .post-book-fab:active {
          transform: translateY(0) scale(0.96);
        }
        .post-book-fab:focus-visible {
          outline: 3px solid rgba(34, 197, 94, 0.55);
          outline-offset: 3px;
        }

        .post-book-fab__glyph {
          position: absolute;
          inset: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          line-height: 1;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.18));
        }

        /* Pencil/write badge — replaces the bare "+" so it reads
           "compose new" rather than "add item". */
        .post-book-fab__badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
          color: #fff;
          font-size: 13px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--surface-page, #fff);
          box-shadow: 0 3px 8px rgba(234, 88, 12, 0.55);
        }

        /* Soft ring pulse — same colour family as the gradient. */
        .post-book-fab__pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid hsla(148, 70%, 50%, 0.45);
          opacity: 0;
          pointer-events: none;
          animation: fabPulse 2.6s ease-out infinite;
        }

        @media (min-width: 768px) {
          .post-book-fab__wrap {
            right: 28px;
            bottom: 28px;
          }
          .post-book-fab {
            width: 64px;
            height: 64px;
          }
          .post-book-fab__glyph {
            font-size: 30px;
          }
        }

        @keyframes fabIdle {
          0%,
          88%,
          100% {
            transform: rotate(0deg);
          }
          92% {
            transform: rotate(-6deg);
          }
          96% {
            transform: rotate(6deg);
          }
        }
        @keyframes fabPulse {
          0% {
            opacity: 0.55;
            transform: scale(1);
          }
          80% {
            opacity: 0;
            transform: scale(1.55);
          }
          100% {
            opacity: 0;
            transform: scale(1.55);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .post-book-fab,
          .post-book-fab__pulse {
            animation: none;
          }
          .post-book-fab:hover,
          .post-book-fab:active {
            transition: none;
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default PostBookFab;
