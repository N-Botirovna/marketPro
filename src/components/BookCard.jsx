"use client";
import { Link } from "@/i18n/navigation";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { likeBook } from "@/services/books";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "./Toast";
import { formatPrice } from "@/utils/formatPrice";

const BookCard = ({
  book,
  onEdit,
  onDelete,
  onArchive,
  currentUserId = null,
  showEditForOwn = true,
  onLikeUpdate,
  isArchiving = false,
}) => {
  if (!book) return null;

  const locale = useLocale();
  const tBookCard = useTranslations("BookCard");
  const tCommon = useTranslations("Common");
  const tButtons = useTranslations("Buttons");
  const tWishList = useTranslations("WishList");
  const tProduct = useTranslations("ProductDetailsOne");
  const { isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();
  
  // Local storage'dan like holatini olish
  const getStoredLikeState = () => {
    if (typeof window === 'undefined') return null;
    try {
      const likedMap = localStorage.getItem('liked_books_map');
      if (likedMap) {
        const map = JSON.parse(likedMap);
        return map[book?.id] || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const storedState = getStoredLikeState();
  const [isLiked, setIsLiked] = useState(storedState?.isLiked ?? (book?.is_liked === true));
  const [likeCount, setLikeCount] = useState(storedState?.likeCount ?? (book?.like_count || 0));
  const [liking, setLiking] = useState(false);
  const [bookIdRef, setBookIdRef] = useState(book?.id);

  // Update state FAQAT yangi kitobga o'tganda (ID o'zgarganda)
  useEffect(() => {
    if (book?.id && book.id !== bookIdRef) {
      setBookIdRef(book.id);
      const stored = getStoredLikeState();
      setIsLiked(stored?.isLiked ?? (book.is_liked === true));
      setLikeCount(stored?.likeCount ?? (book.like_count || 0));
    }
  }, [book?.id, bookIdRef]);

  // Helper function to get localized field value
  const getLocalizedField = (fieldPrefix) => {
    const localizedKey = `${fieldPrefix}_${locale}`;
    const fallbackKey = `${fieldPrefix}_uz`;
    return book[localizedKey] || book[fallbackKey] || book[fieldPrefix] || '';
  };


  const sellerName =
    book.shop?.name ||
    (() => {
      const parts = [book.posted_by?.first_name, book.posted_by?.last_name].filter(Boolean);
      return parts.length ? parts.join(" ") : tProduct("unknown");
    })();
  const isOwnBook = currentUserId && book.posted_by?.id === currentUserId;
  const showEditButton = showEditForOwn && isOwnBook && onEdit;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: tCommon("info") || "Ma'lumot",
        message: "Like qilish uchun tizimga kiring",
        duration: 3000
      });
      return;
    }

    if (liking) return;

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;
    const newLiked = !previousLiked;
    const newCount = newLiked ? previousCount + 1 : Math.max(0, previousCount - 1);
    
    setIsLiked(newLiked);
    setLikeCount(newCount);

    try {
      setLiking(true);
      const response = await likeBook(book.id);
      
      if (response.success) {
        // Backend'dan kelgan is_liked bilan yangilash, count esa o'zimizda qoladi
        setIsLiked(response.is_liked);
        
        // Count'ni backend bermagani uchun o'zimiz boshqaramiz
        const finalCount = response.is_liked ? newCount : Math.max(0, newCount);
        setLikeCount(finalCount);
        
        // Local storage'ga saqlash
        if (typeof window !== 'undefined') {
          const likedMap = localStorage.getItem('liked_books_map');
          const map = likedMap ? JSON.parse(likedMap) : {};
          
          if (response.is_liked) {
            map[book.id] = {
              isLiked: true,
              likeCount: finalCount
            };
          } else {
            delete map[book.id];
          }
          
          localStorage.setItem('liked_books_map', JSON.stringify(map));
        }
        
        if (onLikeUpdate) {
          onLikeUpdate(book.id, response.is_liked, finalCount);
        }
        
        window.dispatchEvent(new Event(response.is_liked ? 'bookLiked' : 'bookUnliked'));
      }
    } catch (error) {
      console.error("❌ Like error:", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      
      showToast({
        type: 'error',
        title: tCommon("error"),
        message: "Like qilishda xatolik yuz berdi",
        duration: 3000
      });
    } finally {
      setLiking(false);
    }
  };

  return (
    <div className='product-card h-100 p-8 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2'>
      {/* Action Buttons - Top Right */}
      <div className="position-absolute top-0 end-0 p-8 d-flex gap-4 z-2">
        {/* Like Button */}
        {isAuthenticated && (
          <button
            onClick={handleLike}
            className={`btn btn-sm rounded-circle p-10 border-0 transition-1 ${
              isLiked 
                ? 'bg-danger-600 text-white hover-bg-danger-700' 
                : 'bg-white text-gray-600 hover-bg-danger-50 hover-text-danger-600 shadow-sm'
            }`}
            disabled={liking}
            title={isLiked ? "Like olib tashlash" : "Like qo'shish"}
            style={{ width: '36px', height: '36px' }}
          >
            <i className={`${isLiked ? 'ph-fill' : 'ph'} ph-heart text-md`} />
          </button>
        )}
        {/* Edit Button */}
        {showEditButton && (
          <button 
            className="btn btn-sm btn-outline-main rounded-circle p-8"
            onClick={() => onEdit(book)}
            title={tButtons("edit")}
          >
            <i className="ph ph-pencil text-xs"></i>
          </button>
        )}
        {/* Archive Button */}
        {showEditForOwn && onArchive && book?.is_active !== false && (
          <button
            className="btn btn-sm btn-outline-secondary rounded-circle p-8"
            onClick={() => onArchive(book)}
            title={tProduct("archiveButton")}
            disabled={isArchiving}
          >
            {isArchiving ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <i className="ph ph-archive text-xs"></i>
            )}
          </button>
        )}
        {/* Delete Button */}
        {onDelete && (
          <button 
            className="btn btn-sm btn-outline-danger rounded-circle p-8"
            onClick={() => onDelete(book)}
            title={tWishList("delete")}
          >
            <i className="ph ph-trash text-xs"></i>
          </button>
        )}
      </div>
      
      {book.percentage && (
        <span className='product-card__badge bg-danger-600 px-8 py-4 text-sm text-white'>
          -{book.percentage}%
        </span>
      )}
      
      <Link href={`/product-details?id=${book.id}`} className='product-card__thumb flex-center' style={{ height: '220px' }}>
        <img 
          src={book.picture || 'assets/images/thumbs/product-img7.png'} 
          alt={book.name}
          style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
        />
      </Link>

      <div className='product-card__content p-sm-2'>
        <h6 className='title text-lg fw-semibold mt-12 mb-8'>
          <Link href={`/product-details?id=${book.id}`} className='link text-line-2'>
            {getLocalizedField("name") || tBookCard("noName")}
          </Link>
        </h6>

        <div className='flex-align gap-4 mb-8'>
          <span className='text-main-600 text-md d-flex'>
            <i className='ph-fill ph-user' />
          </span>
          <span className='text-gray-500 text-xs'>
            {getLocalizedField("author") || tCommon("unknownAuthor")}
          </span>
        </div>
        
        <div className='flex-align gap-4 mb-8'>
          <span className='text-main-600 text-md d-flex'>
            <i className='ph-fill ph-book-open' />
          </span>
          <span className='text-gray-500 text-xs'>
            {book.publisher || tBookCard("unknownPublisher")}
          </span>
        </div>

        <div className='product-card__content mt-12'>
          <div className='product-card__price mb-8'>
            <span className='text-heading text-md fw-semibold'>
              {formatPrice(book.discount_price || book.price, locale)}
            </span>
            {book.discount_price && (
              <span className='text-gray-400 text-md fw-semibold text-decoration-line-through ms-8'>
                {formatPrice(book.price, locale)}
              </span>
            )}
          </div>
          
          <div className='flex-align gap-6'>
            <span className='text-xs fw-bold text-gray-600'>
              <i className='ph ph-eye me-4'></i>
              {book.view_count || 0}
            </span>
            {likeCount > 0 && (
              <span className='text-xs fw-bold text-gray-500 d-flex align-items-center gap-2'>
                <i className='ph ph-heart text-xs' />
                {likeCount}
              </span>
            )}
          </div>

          {/* Seller Information */}
          <div className='flex-align gap-4 mt-8'>
            <span className='text-main-600 text-sm d-flex'>
              <i className='ph-fill ph-storefront' />
            </span>
            <span className='text-gray-600 text-xs'>
              {`${tCommon("seller")}: ${sellerName}`}
            </span>
          </div>

          <Link
            href={`/product-details?id=${book.id}`}
            className='product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8 mt-16 w-100 justify-content-center'
          >
            {tBookCard("viewDetails")} <i className='ph ph-arrow-right' />
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default BookCard;
