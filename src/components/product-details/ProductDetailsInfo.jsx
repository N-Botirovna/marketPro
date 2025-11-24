"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";

const ProductDetailsInfo = ({ book, formatPrice }) => {
  if (!book) return null;

  const t = useTranslations("ProductDetailsOne");
  const locale = useLocale();
  const conditionLabel = book.is_used ? t("conditionUsed") : t("conditionNew");
  const conditionClasses = book.is_used
    ? "bg-warning-100 text-warning-700"
    : "bg-success-100 text-success-700";

  const coverTypeLabels = {
    hard: {
      uz: "Qattiq muqova",
      ru: "Твёрдый переплёт",
      en: "Hard cover",
    },
    soft: {
      uz: "Yumshoq muqova",
      ru: "Мягкий переплёт",
      en: "Soft cover",
    },
  };

  const detectLanguageKey = () => {
    const lang = (book.language || "").toLowerCase();
    if (["o'zbek", "uzbek", "uz"].some((key) => lang.includes(key))) return "uz";
    if (["rus", "russian", "ru"].some((key) => lang.includes(key))) return "ru";
    return "en";
  };

  const formatCoverType = (type) => {
    if (!type) return null;
    const langKey = detectLanguageKey();
    const labels = coverTypeLabels[type?.toLowerCase()];
    return labels ? labels[langKey] || labels.en : type;
  };

  const formatPages = (pages) => {
    if (!pages && pages !== 0) return null;
    return `${Number(pages).toLocaleString(locale)} ${t("pagesSuffix")}`;
  };

  const renderInfoCard = (label, value, icon) => {
    if (!value && value !== 0) return null;

    return (
      <div className="info-card rounded-16 bg-white shadow-sm px-18 py-16 h-100">
        <div className="d-flex align-items-center gap-12 mb-10">
          <span className="w-36 h-36 rounded-circle bg-main-50 text-main-600 flex-center">
            <i className={icon} />
          </span>
          <span className="text-xs text-gray-500 text-uppercase" style={{ letterSpacing: "0.06em" }}>
            {label}
          </span>
        </div>
        <span className="fw-semibold text-gray-900">{value}</span>
      </div>
    );
  };

  return (
    <div className="product-details__content h-100 d-flex flex-column">
      <div className="d-flex flex-wrap gap-12 align-items-start justify-content-between">
        <div className="flex-grow-1">
          <h4 className="mb-8 text-gray-900">{book.name}</h4>
          <div className="d-flex flex-wrap gap-12 text-sm text-gray-500">
            <span className="d-flex align-items-center gap-8">
              <i className="ph ph-eye" />
              {t("viewsCount", { count: book.view_count || 0 })}
            </span>
            {book.comment_count !== undefined && (
              <span className="d-flex align-items-center gap-8">
                <i className="ph ph-chats" />
                {t("commentsCount", { count: book.comment_count || 0 })}
              </span>
            )}
          </div>
        </div>
        <span className={`badge fw-semibold px-12 py-6 rounded-pill ${conditionClasses}`}>
          {conditionLabel}
        </span>
      </div>

      <div className="mt-24 p-16 bg-gray-50 rounded-16">
        <div className="d-flex flex-wrap gap-16">
          <div>
            <span className="text-xs text-gray-500 d-block">{t("priceLabel")}</span>
            <div className="d-flex align-items-center gap-12">
              <h4 className="mb-0">
                {formatPrice(book.discount_price || book.price)}
              </h4>
              {book.discount_price && (
                <span className="text-md text-gray-500 text-decoration-line-through">
                  {formatPrice(book.price)}
                </span>
              )}
            </div>
          </div>
          {book.percentage && (
            <span className="badge bg-danger-50 text-danger-600 align-self-start">
              -{book.percentage}%
            </span>
          )}
        </div>
      </div>

      <div className="mt-28 d-grid gap-14">
        <div>
          {renderInfoCard(t("infoAuthor"), book.author || t("unknownValue"), "ph ph-user")}
        </div>
        <div
          className="d-grid gap-14"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {renderInfoCard(t("infoLanguage"), book.language || t("unknownValue"), "ph ph-globe")}
          {renderInfoCard(t("infoScript"), book.script_type || t("unknownValue"), "ph ph-text-aa")}
          {renderInfoCard(
            t("infoCover"),
            formatCoverType(book.cover_type) || t("unknownValue"),
            "ph ph-book"
          )}
        </div>
        <div
          className="d-grid gap-14"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
        >
          {renderInfoCard(
            t("infoPublicationYear"),
            book.publication_year || t("unknownValue"),
            "ph ph-calendar"
          )}
          {renderInfoCard(
            t("infoPages"),
            formatPages(book.pages) || t("unknownValue"),
            "ph ph-files"
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsInfo;

