"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLike } from "@/hooks/useLike";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/utils/formatPrice";
import { openShareSheet } from "@/lib/shareSheet";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { bookOwnerLocation } from "@/utils/location";
import Icon from "@/components/Icon";
import { useToast } from "./Toast";

const BookCard = ({
  book,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  currentUserId = null,
  showEditForOwn = true,
  onLikeUpdate,
  isArchiving = false,
  isRestoring = false,
}) => {
  // Hooks MUST run on every render in the same order — putting
  // `if (!book) return null` above them would change the call order
  // between mounts and produce React's "rules of hooks" crash. Call all
  // hooks first, then short-circuit the render below.
  const locale = useLocale();
  const tBookCard = useTranslations("BookCard");
  const tCommon = useTranslations("Common");
  const tButtons = useTranslations("Buttons");
  const tWishList = useTranslations("WishList");
  const tProduct = useTranslations("ProductDetailsOne");
  const tType = useTranslations("BookTypeChips");
  const tShare = useTranslations("Share");
  // tShare keys consumed: shareBook (aria/title on the share button below).
  const { isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const {
    liked: isLiked,
    count: likeCount,
    liking,
    toggle,
    sync,
  } = useLike(book?.id, book?.is_liked, book?.like_count);
  const [bookIdRef, setBookIdRef] = useState(book?.id);

  useEffect(() => {
    if (book?.id && book.id !== bookIdRef) {
      setBookIdRef(book.id);
      sync(book.id, book.is_liked, book.like_count);
    }
  }, [book?.id, book?.is_liked, book?.like_count, bookIdRef, sync]);

  if (!book) return null;

  // Helper function to get localized field value
  const getLocalizedField = (fieldPrefix) => {
    const localizedKey = `${fieldPrefix}_${locale}`;
    const fallbackKey = `${fieldPrefix}_uz`;
    return book[localizedKey] || book[fallbackKey] || book[fieldPrefix] || "";
  };

  const sellerName =
    book.shop?.name ||
    (() => {
      const parts = [book.posted_by?.first_name, book.posted_by?.last_name].filter(Boolean);
      return parts.length ? parts.join(" ") : tProduct("unknown");
    })();
  const isOwnBook = currentUserId && book.posted_by?.id === currentUserId;
  const showEditButton = showEditForOwn && isOwnBook && onEdit;
  const ownerLocation = bookOwnerLocation(book);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const bookName = getLocalizedField("name") || tBookCard("noName");
    openShareSheet({
      title: bookName,
      text: `${bookName} — Kitobzor`,
      url: `/${locale}/book-details/${book.id}`,
    });
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast({
        type: "info",
        title: tCommon("info") || "Ma'lumot",
        message: "Like qilish uchun tizimga kiring",
        duration: 3000,
      });
      return;
    }

    try {
      const result = await toggle(book.id);
      if (result && onLikeUpdate) onLikeUpdate(book.id, result.isLiked, result.count);
    } catch {
      showToast({
        type: "error",
        title: tCommon("error"),
        message: "Like qilishda xatolik yuz berdi",
        duration: 3000,
      });
    }
  };

  return (
    <div className="book-card product-card h-100 p-8 p-sm-12 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
      <div className="book-card__actions">
        <button
          type="button"
          onClick={handleShare}
          className="book-card__action-btn is-share"
          aria-label={tShare("shareBook")}
          title={tShare("shareBook")}
        >
          <Icon className="ph ph-share-network" aria-hidden="true" />
        </button>
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLike}
            className={`book-card__action-btn ${isLiked ? "is-liked" : ""}`}
            disabled={liking}
            aria-label={isLiked ? tProduct("removeLike") : tProduct("addLike")}
            title={isLiked ? tProduct("removeLike") : tProduct("addLike")}
          >
            <Icon className={`${isLiked ? "ph-fill" : "ph"} ph-heart`} aria-hidden="true" />
          </button>
        )}
        {showEditButton && (
          <button
            type="button"
            className="book-card__action-btn is-edit"
            onClick={() => onEdit(book)}
            aria-label={tButtons("edit")}
            title={tButtons("edit")}
          >
            <Icon className="ph-fill ph-pencil-simple" aria-hidden="true" />
          </button>
        )}
        {showEditForOwn && onArchive && book?.is_active !== false && (
          <button
            type="button"
            className="book-card__action-btn is-archive"
            onClick={() => onArchive(book)}
            aria-label={tProduct("archiveButton")}
            title={tProduct("archiveButton")}
            disabled={isArchiving}
          >
            {isArchiving ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              <Icon className="ph-fill ph-archive" aria-hidden="true" />
            )}
          </button>
        )}
        {showEditForOwn && onRestore && book?.is_active === false && (
          <button
            type="button"
            className="book-card__action-btn is-restore"
            onClick={() => onRestore(book)}
            aria-label={tProduct("restoreButton")}
            title={tProduct("restoreButton")}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
              <Icon className="ph-fill ph-arrow-counter-clockwise" aria-hidden="true" />
            )}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="book-card__action-btn is-delete"
            onClick={() => onDelete(book)}
            aria-label={tWishList("delete")}
            title={tWishList("delete")}
          >
            <Icon className="ph-fill ph-trash" aria-hidden="true" />
          </button>
        )}
      </div>
      {book.percentage && (
        <span className="product-card__badge bg-danger-600 px-8 py-4 text-sm text-white">
          -{book.percentage}%
        </span>
      )}

      <Link href={`/book-details/${book.id}`} className="book-card__thumb flex-center">
        <img
          src={resolveMediaUrl(book.picture, "/assets/images/thumbs/product-img7.png")}
          alt={book.name}
          loading="lazy"
        />
      </Link>

      <div className="book-card__content mt-12">
        <h6 className="book-card__title mb-8">
          <Link href={`/book-details/${book.id}`} className="link text-line-2">
            {getLocalizedField("name") || tBookCard("noName")}
          </Link>
        </h6>

        <div className="book-card__meta-row mb-8">
          <Icon className="ph-fill ph-user book-card__meta-icon" aria-hidden="true" />
          <span className="book-card__meta-text">
            {getLocalizedField("author") || tCommon("unknownAuthor")}
          </span>
        </div>

        {book.publication_year && (
          <div className="book-card__meta-row mb-8">
            <Icon className="ph-fill ph-calendar-blank book-card__meta-icon" aria-hidden="true" />
            <span className="book-card__meta-text">{book.publication_year}</span>
          </div>
        )}

        <div className="book-card__price mb-8">
          {book.type === "gift" ? (
            <span className="book-card__price-current text-success">{tType("gift")}</span>
          ) : book.type === "exchange" ? (
            <span className="book-card__price-current text-warning">{tType("exchange")}</span>
          ) : book.price ? (
            <>
              <span className="book-card__price-current">
                {formatPrice(book.discount_price || book.price, locale)}
              </span>
              {book.discount_price && (
                <span className="book-card__price-old">{formatPrice(book.price, locale)}</span>
              )}
            </>
          ) : null}
        </div>

        <div className="book-card__counters">
          <span className="book-card__counter">
            <Icon className="ph ph-eye" aria-hidden="true" />
            {book.view_count || 0}
          </span>
          {likeCount > 0 && (
            <span className="book-card__counter">
              <Icon className="ph ph-heart" aria-hidden="true" />
              {likeCount}
            </span>
          )}
        </div>

        <div className="book-card__meta-row mt-8 justify-content-between">
          <span className="d-inline-flex align-items-center gap-4" style={{ minWidth: 0 }}>
            <Icon className="ph-fill ph-storefront book-card__meta-icon" aria-hidden="true" />
            <span className="book-card__meta-text book-card__seller">
              {`${tCommon("seller")}: ${sellerName}`}
            </span>
          </span>
          {ownerLocation && (
            <span
              className="d-inline-flex align-items-center gap-4 flex-shrink-0"
              style={{ maxWidth: "58%" }}
              title={ownerLocation}
            >
              <Icon className="ph-fill ph-map-pin book-card__meta-icon" aria-hidden="true" />
              <span className="book-card__meta-text">{ownerLocation}</span>
            </span>
          )}
        </div>

        <Link
          href={`/book-details/${book.id}`}
          className="book-card__cta btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white rounded-pill flex-align gap-8 mt-16 w-100 justify-content-center"
        >
          {tBookCard("viewDetails")} <Icon className="ph ph-arrow-right" aria-hidden="true" />
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default BookCard;
