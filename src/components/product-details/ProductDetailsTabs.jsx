"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import BookComments from "../BookComments";

const ProductDetailsTabs = ({ book, id }) => {
  if (!book) return null;

  const t = useTranslations("ProductDetailsOne");
  const locale = useLocale();
  const commentsLabel =
    book?.comment_count > 0
      ? `${t("commentsTab")} (${book.comment_count})`
      : t("commentsTab");

  return (
    <div className="pt-80">
      <div className="product-dContent border rounded-24">
        <div className="product-dContent__header border-bottom border-gray-100 flex-between flex-wrap gap-16">
          <ul className="nav common-tab nav-pills mb-3" id="pills-tab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="pills-description-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-description"
                type="button"
                role="tab"
                aria-controls="pills-description"
                aria-selected="true"
              >
                {t("descriptionTab")}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="pills-specs-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-specs"
                type="button"
                role="tab"
                aria-controls="pills-specs"
                aria-selected="false"
              >
                {t("specsTab")}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="pills-comments-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-comments"
                type="button"
                role="tab"
                aria-controls="pills-comments"
                aria-selected="false"
              >
                {commentsLabel}
              </button>
            </li>
          </ul>
        </div>
        <div className="product-dContent__box">
          <div className="tab-content" id="pills-tabContent">
            <div
              className="tab-pane fade show active"
              id="pills-description"
              role="tabpanel"
              aria-labelledby="pills-description-tab"
              tabIndex={0}
            >
              <div
                className="mb-40"
                dangerouslySetInnerHTML={{
                  __html: book.description || `<p>${t("noDescription")}</p>`,
                }}
              ></div>
            </div>
            <div
              className="tab-pane fade"
              id="pills-specs"
              role="tabpanel"
              aria-labelledby="pills-specs-tab"
              tabIndex={0}
            >
              <div className="mb-40">
                <h6 className="mb-24">{t("bookSpecsHeading")}</h6>
                <ul className="mt-32">
                  <li className="text-gray-400 mb-14 flex-align gap-14">
                    <span className="text-heading fw-medium">
                      {t("languageLabel")}{" "}
                      <span className="text-gray-500">{book.language || t("unknownValue")}</span>
                    </span>
                  </li>
                  <li className="text-gray-400 mb-14 flex-align gap-14">
                    <span className="text-heading fw-medium">
                      {t("coverLabel")}{" "}
                      <span className="text-gray-500">{book.cover_type || t("unknownValue")}</span>
                    </span>
                  </li>
                  <li className="text-gray-400 mb-14 flex-align gap-14">
                    <span className="text-heading fw-medium">
                      {t("publicationYearLabel")}{" "}
                      <span className="text-gray-500">
                        {book.publication_year || t("unknownValue")}
                      </span>
                    </span>
                  </li>
                  <li className="text-gray-400 mb-14 flex-align gap-14">
                    <span className="text-heading fw-medium">
                      {t("pagesLabel")}{" "}
                      <span className="text-gray-500">
                        {book.pages
                          ? `${Number(book.pages).toLocaleString(locale)} ${t("pagesSuffix")}`
                          : t("unknownValue")}
                      </span>
                    </span>
                  </li>
                  <li className="text-gray-400 mb-14 flex-align gap-14">
                    <span className="text-heading fw-medium">
                      {t("isbnLabel")}{" "}
                      <span className="text-gray-500">{book.isbn || t("unknownValue")}</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="pills-comments"
              role="tabpanel"
              aria-labelledby="pills-comments-tab"
              tabIndex={0}
            >
              <div className="mb-40">
                <BookComments bookId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsTabs;

