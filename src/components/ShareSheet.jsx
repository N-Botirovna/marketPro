"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildAbsoluteUrl } from "@/lib/share";
import Icon from "@/components/Icon";
import { useToast } from "./Toast";

/**
 * Telegram/Instagram-style share sheet.
 *
 * Renders a bottom sheet on mobile and a centred dialog on desktop. Lists
 * concrete targets (Telegram, WhatsApp, SMS, Facebook, X, email) with
 * deep-link URLs so taps land directly in the chosen app instead of just
 * copying the URL. Native Web Share API is exposed as a "More apps…" row
 * on devices that support it (Android Chrome, iOS Safari).
 *
 * Instagram has no public sharing URL — there's no `instagram://` share
 * intent for arbitrary URLs. We instead copy the link and toast a hint
 * so the user can paste it in a story / DM. Same pattern Instagram itself
 * uses when an external site asks to share to it.
 *
 * The sheet mounts via the `share-sheet:open` event bus (see
 * `src/lib/shareSheet.js`), so callers don't need a context provider.
 */
const ShareSheet = ({ open, payload, onClose }) => {
  const t = useTranslations("Share");
  const { showToast, ToastContainer } = useToast();
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  // ESC + body scroll lock
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("body-no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("body-no-scroll");
    };
  }, [open, onClose]);

  const { absoluteUrl, encodedUrl, encodedText, encodedTitle } = useMemo(() => {
    const u = buildAbsoluteUrl(payload?.url || "");
    const text = payload?.text || payload?.title || "";
    return {
      absoluteUrl: u,
      encodedUrl: encodeURIComponent(u),
      encodedText: encodeURIComponent(text),
      encodedTitle: encodeURIComponent(payload?.title || ""),
    };
  }, [payload?.url, payload?.text, payload?.title]);

  const openAndClose = useCallback(
    (href) => {
      if (typeof window !== "undefined") {
        // _blank so we don't navigate away from the site mid-browse.
        window.open(href, "_blank", "noopener,noreferrer");
      }
      onClose?.();
    },
    [onClose],
  );

  const handleNativeShare = useCallback(async () => {
    if (!hasNativeShare || !payload) return;
    try {
      await navigator.share({
        title: payload.title || "",
        text: payload.text || payload.title || "",
        url: absoluteUrl,
      });
      onClose?.();
    } catch (err) {
      if (err && err.name !== "AbortError") {
        showToast({
          type: "error",
          title: t("shareError"),
          duration: 2200,
        });
      }
    }
  }, [hasNativeShare, payload, absoluteUrl, onClose, showToast, t]);

  const handleCopy = useCallback(
    async ({ instagram = false } = {}) => {
      let ok = false;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(absoluteUrl);
          ok = true;
        }
      } catch {
        /* clipboard blocked — fall through */
      }
      if (ok) {
        showToast({
          type: "success",
          title: instagram ? t("instagramHint") : t("linkCopied"),
          duration: instagram ? 4000 : 2200,
        });
      } else {
        showToast({
          type: "info",
          title: t("copyFailed", { url: absoluteUrl }),
          duration: 4500,
        });
      }
      onClose?.();
    },
    [absoluteUrl, showToast, t, onClose],
  );

  if (!open || !payload) {
    return <ToastContainer />;
  }

  // Telegram & WhatsApp accept URL + text via their share endpoints. SMS
  // and email use protocol handlers the OS dispatches to the default app.
  const targets = [
    {
      key: "telegram",
      label: t("targetTelegram"),
      icon: "ph-fill ph-telegram-logo",
      color: "#229ED9",
      bg: "rgba(34, 158, 217, 0.12)",
      onClick: () => openAndClose(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`),
    },
    {
      key: "whatsapp",
      label: t("targetWhatsapp"),
      icon: "ph-fill ph-whatsapp-logo",
      color: "#25D366",
      bg: "rgba(37, 211, 102, 0.12)",
      onClick: () => openAndClose(`https://wa.me/?text=${encodedText}%20${encodedUrl}`),
    },
    {
      key: "instagram",
      label: t("targetInstagram"),
      icon: "ph-fill ph-instagram-logo",
      color: "#E1306C",
      bg: "rgba(225, 48, 108, 0.12)",
      onClick: () => handleCopy({ instagram: true }),
    },
    {
      key: "sms",
      label: t("targetSms"),
      icon: "ph-fill ph-chat-circle-text",
      color: "#16a34a",
      bg: "rgba(22, 163, 74, 0.12)",
      onClick: () => {
        if (typeof window !== "undefined") {
          window.location.href = `sms:?&body=${encodedText}%20${encodedUrl}`;
        }
        onClose?.();
      },
    },
    {
      key: "facebook",
      label: t("targetFacebook"),
      icon: "ph-fill ph-facebook-logo",
      color: "#1877F2",
      bg: "rgba(24, 119, 242, 0.12)",
      onClick: () => openAndClose(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      key: "twitter",
      label: t("targetTwitter"),
      icon: "ph-fill ph-x-logo",
      color: "#0f172a",
      bg: "rgba(15, 23, 42, 0.08)",
      onClick: () =>
        openAndClose(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`),
    },
    {
      key: "email",
      label: t("targetEmail"),
      icon: "ph-fill ph-envelope-simple",
      color: "#7c3aed",
      bg: "rgba(124, 58, 237, 0.12)",
      onClick: () => {
        if (typeof window !== "undefined") {
          window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`;
        }
        onClose?.();
      },
    },
    {
      key: "copy",
      label: t("targetCopy"),
      icon: "ph-fill ph-link",
      color: "var(--main-700, hsl(148, 59%, 31%))",
      bg: "var(--main-50, hsl(148, 59%, 95%))",
      onClick: () => handleCopy(),
    },
  ];

  return (
    <>
      <div className="kz-share-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="kz-share-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kz-share-title"
      >
        <div className="kz-share-sheet__handle" aria-hidden="true" />
        <div className="kz-share-sheet__head">
          <h3 id="kz-share-title" className="kz-share-sheet__title">
            {t("sheetTitle")}
          </h3>
          <button
            type="button"
            className="kz-share-sheet__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon className="ph ph-x" />
          </button>
        </div>

        {payload?.title && (
          <div className="kz-share-sheet__preview">
            <div className="kz-share-sheet__preview-title">{payload.title}</div>
            <div className="kz-share-sheet__preview-url">{absoluteUrl}</div>
          </div>
        )}

        <div className="kz-share-sheet__grid">
          {targets.map((target) => (
            <button
              key={target.key}
              type="button"
              className="kz-share-sheet__target"
              onClick={target.onClick}
            >
              <span
                className="kz-share-sheet__target-icon"
                style={{ backgroundColor: target.bg, color: target.color }}
              >
                <Icon className={target.icon} aria-hidden="true" />
              </span>
              <span className="kz-share-sheet__target-label">{target.label}</span>
            </button>
          ))}
        </div>

        {hasNativeShare && (
          <button type="button" className="kz-share-sheet__native" onClick={handleNativeShare}>
            <Icon className="ph ph-share-network" aria-hidden="true" />
            <span>{t("targetNative")}</span>
          </button>
        )}
      </div>
      <ToastContainer />

      <style jsx>{`
        .kz-share-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(2px);
          z-index: 1200;
          animation: kzShareFade 0.18s ease;
        }
        .kz-share-sheet {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1201;
          background: var(--surface-card, #fff);
          color: var(--text-primary, #111827);
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          padding: 12px 16px calc(20px + env(safe-area-inset-bottom, 0));
          box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.18);
          animation: kzShareUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 88vh;
          overflow-y: auto;
        }
        @media (min-width: 768px) {
          .kz-share-sheet {
            left: 50%;
            right: auto;
            bottom: 50%;
            transform: translate(-50%, 50%);
            width: min(440px, calc(100vw - 32px));
            border-radius: 18px;
            animation: kzShareDialog 0.18s ease;
            padding: 16px 20px 22px;
          }
        }

        .kz-share-sheet__handle {
          width: 36px;
          height: 4px;
          border-radius: 999px;
          background: var(--border-subtle, #e5e7eb);
          margin: 0 auto 12px;
        }
        @media (min-width: 768px) {
          .kz-share-sheet__handle {
            display: none;
          }
        }

        .kz-share-sheet__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .kz-share-sheet__title {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
        }
        .kz-share-sheet__close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: var(--surface-muted, #f3f4f6);
          color: var(--text-primary, #111827);
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .kz-share-sheet__preview {
          background: var(--surface-muted, #f8fafc);
          border: 1px solid var(--border-subtle, #e5e7eb);
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 14px;
          min-width: 0;
        }
        .kz-share-sheet__preview-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .kz-share-sheet__preview-url {
          font-size: 11px;
          color: var(--text-secondary, #64748b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .kz-share-sheet__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px 8px;
          margin-bottom: 10px;
        }
        @media (min-width: 480px) {
          .kz-share-sheet__grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        @media (min-width: 768px) {
          .kz-share-sheet__grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 14px 10px;
          }
        }

        .kz-share-sheet__target {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 8px 4px;
          border: none;
          background: transparent;
          color: var(--text-primary, #111827);
          cursor: pointer;
          border-radius: 12px;
          transition:
            background 0.15s ease,
            transform 0.1s ease;
        }
        .kz-share-sheet__target:hover {
          background: var(--surface-muted, #f3f4f6);
        }
        .kz-share-sheet__target:active {
          transform: scale(0.96);
        }
        .kz-share-sheet__target-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }
        .kz-share-sheet__target-icon :global(i) {
          line-height: 1;
        }
        .kz-share-sheet__target-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary, #111827);
          text-align: center;
          line-height: 1.2;
          word-break: break-word;
        }

        .kz-share-sheet__native {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          margin-top: 6px;
          padding: 12px 16px;
          border: 1px solid var(--border-subtle, #e5e7eb);
          border-radius: 12px;
          background: var(--surface-card, #fff);
          color: var(--text-primary, #111827);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .kz-share-sheet__native:hover {
          background: var(--surface-muted, #f3f4f6);
        }
        .kz-share-sheet__native :global(i) {
          font-size: 18px;
        }

        @keyframes kzShareFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes kzShareUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes kzShareDialog {
          from {
            opacity: 0;
            transform: translate(-50%, 60%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 50%) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .kz-share-sheet,
          .kz-share-backdrop {
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

export default ShareSheet;
