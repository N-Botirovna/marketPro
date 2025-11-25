"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const ProductDetailsSidebar = ({
  book,
  archiving,
  handleArchive,
  setShowEditModal,
  sellerName,
}) => {
  if (!book) return null;

  const t = useTranslations("ProductDetailsOne");

  const renderAvatar = (src, fallbackIcon = "ph ph-storefront", altText = sellerName) => {
    return (
      <span className="w-44 h-44 bg-white rounded-circle flex-center overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={altText}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <i className={fallbackIcon} />
        )}
      </span>
    );
  };

  return (
    <div className="product-details__sidebar border border-gray-100 rounded-16 overflow-hidden">
      <div className="p-24">
        {book.can_update ? (
          <div>
            <div className="flex-align gap-8 mb-16">
              <span className="w-44 h-44 bg-main-50 rounded-circle flex-center text-2xl text-main-600">
                <i className="ph ph-book" />
              </span>
              <div>
                <h6 className="mb-0 text-gray-900">{t("yourBookTitle")}</h6>
                <span className="text-xs text-gray-600">{t("yourBookSubtitle")}</span>
              </div>
            </div>
            <div className="d-flex flex-column gap-8">
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-main rounded-pill w-100"
              >
                <i className="ph ph-pencil me-2" />
                {t("editButton")}
              </button>
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="btn btn-outline-secondary rounded-pill w-100"
              >
                {archiving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {t("archivingLabel")}
                  </>
                ) : (
                  <>
                    <i className="ph ph-archive me-2" />
                    {t("archiveButton")}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : book.shop?.id ? (
          <div className="flex-between bg-main-600 rounded-pill p-8">
            <div className="flex-align gap-8">
              {renderAvatar(book.shop.picture, "ph ph-storefront", book.shop.name)}
              <span className="text-white">{t("bySeller", { seller: sellerName })}</span>
            </div>
            <Link
              href={`/vendor-two-details?id=${book.shop.id}`}
              className="btn btn-white rounded-pill text-uppercase"
            >
              {t("shopButton")}
            </Link>
          </div>
        ) : book.posted_by?.id && book.owner_type === "user" ? (
          <div className="flex-between bg-main-600 rounded-pill p-10" style={{ gap: "12px" }}>
            <div className="flex-align gap-10">
              {renderAvatar(
                book.posted_by.picture,
                "ph ph-user",
                `${book.posted_by?.first_name || ""} ${book.posted_by?.last_name || ""}`.trim()
              )}
              <span className="text-white fw-medium" style={{ fontSize: "14px" }}>
                {book.posted_by?.first_name || t("defaultSeller")}
              </span>
            </div>
            <Link
              href={`/user/${book.posted_by.id}`}
              className="btn btn-white rounded-pill text-uppercase"
              style={{ fontSize: "13px", padding: "8px 16px", whiteSpace: "nowrap" }}
            >
              {t("profileButton")}
            </Link>
          </div>
        ) : (
          <div className="flex-between bg-main-600 rounded-pill p-8">
            <div className="flex-align gap-8">
              {renderAvatar(null)}
              <span className="text-white">{t("bySeller", { seller: sellerName })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsSidebar;

