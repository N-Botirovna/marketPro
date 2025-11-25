"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getBookById, likeBook } from "@/services/books";
import { useAuth } from "@/hooks/useAuth";
import BookCreateModal from "./BookCreateModal";
import Spin from "./Spin";
import { useToast } from "./Toast";

const BookDetails = ({ bookId }) => {
  const locale = useLocale();
  const tBook = useTranslations("BookDetails");
  const tCommon = useTranslations("Common");
  const tCategories = useTranslations("Categories");
  const tButtons = useTranslations("Buttons");
  const tProduct = useTranslations("ProductDetailsOne");
  const { isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Local storage'dan like holatini olish
  const getStoredLikeState = (bookId) => {
    if (typeof window === 'undefined') return null;
    try {
      const likedMap = localStorage.getItem('liked_books_map');
      if (likedMap) {
        const map = JSON.parse(likedMap);
        return map[bookId] || null;
      }
      return null;
    } catch {
      return null;
    }
  };
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const fetchingRef = useRef(false);
  const lastBookIdRef = useRef(null);

  // Helper function to get localized field value
  const getLocalizedField = (fieldPrefix) => {
    if (!book) return '';
    const localizedKey = `${fieldPrefix}_${locale}`;
    const fallbackKey = `${fieldPrefix}_uz`;
    return book[localizedKey] || book[fallbackKey] || book[fieldPrefix] || '';
  };

  useEffect(() => {
    if (!bookId) return;
    
    // Agar bir xil bookId uchun so'rov allaqachon ketayotgan bo'lsa, qayta yuborma
    if (fetchingRef.current && lastBookIdRef.current === bookId) {
      console.log('🚫 BookDetails: Duplicate request blocked for bookId:', bookId);
      return;
    }

    // Agar bookId o'zgarmagan bo'lsa va ma'lumot allaqachon yuklangan bo'lsa, qayta yuborma
    if (lastBookIdRef.current === bookId && book) {
      console.log('🚫 BookDetails: Request skipped, data already loaded for bookId:', bookId);
      return;
    }

    console.log('📥 BookDetails: Starting fetch for bookId:', bookId);
    fetchingRef.current = true;
    lastBookIdRef.current = bookId;
    let isMounted = true;
    const abortController = new AbortController();

    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        console.log('🌐 BookDetails: Calling getBookById for:', bookId);
        const response = await getBookById(bookId);
        
        if (!isMounted || abortController.signal.aborted) {
          console.log('🚫 BookDetails: Request aborted for bookId:', bookId);
          fetchingRef.current = false;
          return;
        }
        
        console.log('✅ BookDetails: Received response for bookId:', bookId);
        const bookData = response.book;
        setBook(bookData);
        
        // Local storage'dan yoki API'dan like holatini olish
        const stored = getStoredLikeState(bookData?.id);
        setIsLiked(stored?.isLiked ?? (bookData?.is_liked === true));
        setLikeCount(stored?.likeCount ?? (bookData?.like_count || 0));
        setError(null);
      } catch (err) {
        if (!isMounted || abortController.signal.aborted) {
          fetchingRef.current = false;
          return;
        }
        console.error('❌ BookDetails: Error for bookId:', bookId, err);
        setError(err.message || tBook("loadError"));
      } finally {
        fetchingRef.current = false;
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchBookDetails();

    return () => {
      console.log('🧹 BookDetails: Cleanup for bookId:', bookId);
      isMounted = false;
      abortController.abort();
      // Cleanup faqat bookId o'zgarganda
      if (lastBookIdRef.current !== bookId) {
        fetchingRef.current = false;
      }
    };
  }, [bookId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: tCommon("info") || "Ma'lumot",
        message: "Like qilish uchun tizimga kiring",
        duration: 3000
      });
      return;
    }

    if (liking || !book) return;

    const previousLiked = isLiked;
    const previousCount = likeCount;
    const newLiked = !previousLiked;
    const newCount = newLiked ? previousCount + 1 : Math.max(0, previousCount - 1);
    
    setIsLiked(newLiked);
    setLikeCount(newCount);
    setBook(prev => ({
      ...prev,
      is_liked: newLiked,
      like_count: newCount
    }));

    try {
      setLiking(true);
      const response = await likeBook(book.id);
      
      if (response.success) {
        setIsLiked(response.is_liked);
        const finalCount = response.is_liked ? newCount : Math.max(0, newCount);
        setLikeCount(finalCount);
        setBook(prev => ({
          ...prev,
          is_liked: response.is_liked,
          like_count: finalCount
        }));
        
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
        
        window.dispatchEvent(new Event(response.is_liked ? 'bookLiked' : 'bookUnliked'));
      }
    } catch (error) {
      console.error("Like error:", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      setBook(prev => ({
        ...prev,
        is_liked: previousLiked,
        like_count: previousCount
      }));
      
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

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0";
    return new Intl.NumberFormat(locale).format(price);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getTypeLabel = (type) => {
    switch (type) {
      case "gift":
        return tBook("gift");
      case "exchange":
        return tBook("exchange");
      case "seller":
        return tBook("sell");
      default:
        return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "gift":
        return "bg-success";
      case "exchange":
        return "bg-warning";
      case "seller":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  const getOwnerTypeLabel = (ownerType) => {
    switch (ownerType) {
      case "user":
        return tBook("user");
      case "shop":
        return tBook("shop");
      default:
        return ownerType;
    }
  };

  const getCoverTypeLabel = (coverType) => {
    switch (coverType) {
      case "hard":
        return tBook("hardCover");
      case "soft":
        return tBook("softCover");
      default:
        return coverType;
    }
  };

  const getScriptTypeLabel = (scriptType) => {
    switch (scriptType) {
      case "latin":
        return tBook("latin");
      case "cyrillic":
        return tBook("cyrillic");
      case "arabic":
        return tBook("arabic");
      default:
        return scriptType;
    }
  };

  const getConditionLabel = (isUsed) =>
    isUsed ? tCategories("likeNew") : tCategories("new");

  const isOwnBook = () => {
    if (!isAuthenticated || !book?.posted_by?.id) return false;
    return true;
  };

  if (loading) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <Spin text={tBook("loading") || ""} />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-danger">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-muted">{tBook("notFound")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="row gy-5">
          <div className="col-lg-6">
            <div className="product-details__thumb">
              <div className="product-details__thumb-main">
                <img
                  src={
                    book.picture || "/assets/images/thumbs/book-placeholder.png"
                  }
                  alt={book.name}
                  className="w-100 rounded-16"
                  style={{ height: "500px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "/assets/images/thumbs/book-placeholder.png";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="product-details__content">
              <div className="mb-16">
                <span className={`badge ${getTypeColor(book.type)} text-white`}>
                  {getTypeLabel(book.type)}
                </span>
                {book.is_used && (
                  <span className="badge bg-dark text-white ms-8">
                    {tCategories("likeNew")}
                  </span>
                )}
              </div>

              <h1 className="product-details__title text-3xl fw-bold mb-16">
                {getLocalizedField("name") || tBook("bookName")}
              </h1>

              <div className="mb-16">
                <span className="text-gray-600 me-8">
                  <i className="ph ph-user me-4"></i>
                  {tBook("author")}
                </span>
                <span className="fw-medium">
                  {getLocalizedField("author") || tBook("unknownAuthor")}
                </span>
              </div>

              {book.language && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-globe me-4"></i>
                    {tBook("language")}
                  </span>
                  <span className="fw-medium">{book.language}</span>
                </div>
              )}

              {book.script_type && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-text-aa me-4"></i>
                    {tBook("scriptType")}
                  </span>
                  <span className="fw-medium">
                    {getScriptTypeLabel(book.script_type)}
                  </span>
                </div>
              )}

              {book.cover_type && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-book me-4"></i>
                    {tBook("cover")}
                  </span>
                  <span className="fw-medium">
                    {getCoverTypeLabel(book.cover_type)}
                  </span>
                </div>
              )}

              {book.publication_year && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-calendar me-4"></i>
                    {tBook("publicationYear")}
                  </span>
                  <span className="fw-medium">{book.publication_year}</span>
                </div>
              )}

              {book.pages && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-file-text me-4"></i>
                    {tBook("pages")}
                  </span>
                  <span className="fw-medium">
                    {book.pages} {tBook("pagesUnit")}
                  </span>
                </div>
              )}

              {book.isbn && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-barcode me-4"></i>
                    {tBook("isbn")}
                  </span>
                  <span className="fw-medium">{book.isbn}</span>
                </div>
              )}

              <div className="mb-16">
                <div className="d-flex align-items-center">
                  {book.posted_by?.picture && (
                    <img
                      src={book.posted_by.picture}
                      alt={book.posted_by.first_name}
                      className="rounded-circle me-12"
                      style={{ width: "40px", height: "40px" }}
                    />
                  )}
                  <div>
                    <div className="fw-medium">
                      {(() => {
                        const parts = [
                          book.posted_by?.first_name,
                          book.posted_by?.last_name,
                        ].filter(Boolean);
                        return parts.length ? parts.join(" ") : tProduct("unknown");
                      })()}
                    </div>
                    <small className="text-gray-500">
                      {getOwnerTypeLabel(book.owner_type)}
                    </small>
                  </div>
                </div>
              </div>

              {/* Shop Info */}
              {book.shop && (
                <div className="mb-16">
                  <div className="d-flex align-items-center">
                    {book.shop.picture && (
                      <img
                        src={book.shop.picture}
                        alt={book.shop.name}
                        className="rounded-circle me-12"
                        style={{ width: "32px", height: "32px" }}
                      />
                    )}
                    <div>
                      <div className="fw-medium">{book.shop.name}</div>
                      <small className="text-gray-500">{tBook("shop")}</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="product-details__price mb-24">
                {book.discount_price ? (
                  <div>
                    <span className="text-main-600 fw-bold text-2xl">
                      {formatPrice(book.discount_price)} {tCommon("currency")}
                    </span>
                    <span className="text-decoration-line-through text-gray-500 ms-16">
                      {formatPrice(book.price)} {tCommon("currency")}
                    </span>
                    {book.percentage && (
                      <span className="badge bg-danger ms-16">
                        -{book.percentage}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-main-600 fw-bold text-2xl">
                    {formatPrice(book.price)} {tCommon("currency")}
                  </span>
                )}
              </div>

              {/* Seller Information */}
              <div className="mb-24 p-16 bg-gray-50 rounded-12">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <i className="ph ph-storefront text-main-600 me-8"></i>
                    <span className="text-gray-600 me-8">{tBook("seller")}</span>
                    <span className="fw-medium">
                      {book.shop?.name ||
                        `${book.posted_by?.first_name || tProduct("unknown")} ${
                          book.posted_by?.last_name || ""
                        }`.trim()}
                    </span>
                  </div>
                  {isOwnBook() && (
                    <button
                      className="btn btn-sm btn-outline-main"
                      onClick={() => setShowEditModal(true)}
                    >
                      <i className="ph ph-pencil me-4"></i>
                      {tButtons("edit")}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="d-flex align-items-center gap-24 mb-24">
                {book.like_count && (
                  <div className="d-flex align-items-center">
                    <i className="ph ph-heart text-danger me-4"></i>
                    <span>{book.like_count}</span>
                  </div>
                )}
                {book.view_count && (
                  <div className="d-flex align-items-center">
                    <i className="ph ph-eye text-primary me-4"></i>
                    <span>{book.view_count}</span>
                  </div>
                )}
                {book.comment_count && (
                  <div className="d-flex align-items-center">
                    <i className="ph ph-chat-circle text-info me-4"></i>
                    <span>{book.comment_count}</span>
                  </div>
                )}
                <div className="d-flex align-items-center">
                  <i className="ph ph-calendar text-gray-500 me-4"></i>
                  <span className="text-gray-500">
                    {formatDate(book.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex gap-16 flex-wrap">
                <button className="btn btn-main px-32 py-16">
                  <i className="ph ph-shopping-cart me-8"></i>
                  {tBook("addToCart")}
                </button>
                <button 
                  onClick={handleLike}
                  disabled={liking || !isAuthenticated}
                  className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'} px-32 py-16 d-flex align-items-center gap-8`}
                >
                  <i className={`${isLiked ? 'ph-fill' : 'ph'} ph-heart text-lg`}></i>
                  <span>{isLiked ? "Liked" : tBook("favorites")}</span>
                  {likeCount > 0 && (
                    <span className={`badge ${isLiked ? 'bg-white text-danger-600' : 'bg-danger-600 text-white'}`}>
                      {likeCount}
                    </span>
                  )}
                </button>
                <button className="btn btn-outline-secondary px-32 py-16">
                  <i className="ph ph-share-network me-8"></i>
                  {tBook("share")}
                </button>
              </div>

              {/* Contact Seller */}
              <div className="mt-32 p-24 bg-gray-50 rounded-16">
                <h6 className="mb-16">{tBook("contactSeller")}</h6>
                <div className="d-flex gap-12 flex-wrap">
                  <button className="btn btn-outline-primary px-24 py-12">
                    <i className="ph ph-phone me-8"></i>
                    {tBook("phone")}
                  </button>
                  <button className="btn btn-outline-success px-24 py-12">
                    <i className="ph ph-messenger-logo me-8"></i>
                    {tBook("message")}
                  </button>
                  <button className="btn btn-outline-info px-24 py-12">
                    <i className="ph ph-telegram-logo me-8"></i>
                    {tBook("telegram")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {(getLocalizedField("description") || book.description) && (
          <div className="row mt-80">
            <div className="col-12">
              <div className="border border-gray-100 rounded-16 p-32">
                <h5 className="mb-24">{tBook("aboutBook")}</h5>
                <p className="text-gray-700 line-height-1-6">
                  {getLocalizedField("description") || book.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="row mt-40">
          <div className="col-12">
            <div className="border border-gray-100 rounded-16 p-32">
              <h5 className="mb-24">{tBook("additionalInfo")}</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-16">
                    <strong>{tBook("bookType")}</strong> {getTypeLabel(book.type)}
                  </div>
                  <div className="mb-16">
                    <strong>{tBook("condition")}</strong> {getConditionLabel(book.is_used)}
                  </div>
                  <div className="mb-16">
                    <strong>{tBook("owner")}</strong> {getOwnerTypeLabel(book.owner_type)}
                  </div>
                  {book.language && (
                    <div className="mb-16">
                      <strong>{tBook("language")}</strong> {book.language}
                    </div>
                  )}
                  {book.script_type && (
                    <div className="mb-16">
                      <strong>{tBook("scriptType")}</strong> {getScriptTypeLabel(book.script_type)}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  {book.cover_type && (
                    <div className="mb-16">
                      <strong>{tBook("cover")}</strong> {getCoverTypeLabel(book.cover_type)}
                    </div>
                  )}
                  {book.publication_year && (
                    <div className="mb-16">
                      <strong>{tBook("publicationYear")}</strong> {book.publication_year}
                    </div>
                  )}
                  {book.pages && (
                    <div className="mb-16">
                      <strong>{tBook("pages")}</strong> {book.pages} {tBook("pagesUnit")}
                    </div>
                  )}
                  {book.isbn && (
                    <div className="mb-16">
                      <strong>{tBook("isbn")}</strong> {book.isbn}
                    </div>
                  )}
                  <div className="mb-16">
                    <strong>{tBook("createdDate")}</strong> {formatDate(book.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Permission */}
        {book.can_update && (
          <div className="row mt-40">
            <div className="col-12">
              <div className="alert alert-info border border-info rounded-16 p-24">
                <div className="d-flex align-items-center">
                  <i className="ph ph-info text-info me-12"></i>
                  <span>{tBook("canUpdate")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Book Modal */}
        <BookCreateModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedBook) => {
            setBook(updatedBook);
            setShowEditModal(false);
          }}
          editBook={book}
        />
      </div>
      <ToastContainer />
    </section>
  );
};

export default BookDetails;
