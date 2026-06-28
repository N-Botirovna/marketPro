"use client";
import React from "react";
import { useTranslations } from "next-intl";

/**
 * Slim legal/copyright strip rendered directly under <FooterOne />. Token-driven
 * styled-jsx (migrated off the Bootstrap `bg-color-one` utility) so it shares
 * the footer's surface and reads as one cohesive block.
 */
const BottomFooter = () => {
  const tBF = useTranslations("BottomFooter");
  return (
    <div className="kz-bottom-footer">
      <p className="kz-bottom-footer__text">{tBF("copyright")}</p>

      <style jsx>{`
        .kz-bottom-footer {
          background: var(--surface-card);
          border-top: 1px solid var(--border-subtle);
        }
        .kz-bottom-footer__text {
          max-width: var(--container-max, 1240px);
          margin: 0 auto;
          padding: 16px 20px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }
        @media (min-width: 768px) {
          .kz-bottom-footer__text {
            padding: 18px 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default BottomFooter;
