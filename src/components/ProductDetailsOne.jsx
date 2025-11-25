"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getBookById, patchBook, likeBook } from "@/services/books";
import Spin from "./Spin";
import BookCreateModal from "./BookCreateModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "./Toast";
import ProductDetailsGallery from "./product-details/ProductDetailsGallery";
import ProductDetailsInfo from "./product-details/ProductDetailsInfo";
import ProductDetailsSidebar from "./product-details/ProductDetailsSidebar";
import ProductDetailsTabs from "./product-details/ProductDetailsTabs";

const ProductDetailsOne = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const t = useTranslations("ProductDetailsOne");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [archiving, setArchiving] = useState(false);
  
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
  const lastIdRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Hardcoded future date for countdown
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 10);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!id) return;
    
    // Agar bir xil id uchun so'rov allaqachon ketayotgan bo'lsa, qayta yuborma
    if (fetchingRef.current && lastIdRef.current === id) {
      return;
    }

    // Agar id o'zgarmagan bo'lsa va ma'lumot allaqachon yuklangan bo'lsa, qayta yuborma
    if (lastIdRef.current === id && book) {
      return;
    }

    fetchingRef.current = true;
    lastIdRef.current = id;
    let isMounted = true;
    const abortController = new AbortController();

    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await getBookById(id);
        
        if (!isMounted || abortController.signal.aborted) {
          fetchingRef.current = false;
          return;
        }
        
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
        setError(t("fetchError"));
        console.error(err);
      } finally {
        fetchingRef.current = false;
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchBookDetails();

    return () => {
      isMounted = false;
      abortController.abort();
      // Cleanup faqat id o'zgarganda
      if (lastIdRef.current !== id) {
        fetchingRef.current = false;
      }
    };
  }, [id]);

  const handleLike = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: t("toastInfoTitle"),
        message: t("toastLoginMessage"),
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
        title: t("toastErrorTitle"),
        message: t("toastLikeErrorMessage"),
        duration: 3000
      });
    } finally {
      setLiking(false);
    }
  };

  // Dummy images for the slider as they are not in the API response
  const productImages = [
    book?.picture || "assets/images/thumbs/product-details-thumb1.png",
    "assets/images/thumbs/product-details-thumb2.png",
    "assets/images/thumbs/product-details-thumb3.png",
    "assets/images/thumbs/product-details-thumb2.png",
  ];

  const [mainImage, setMainImage] = useState(productImages[0]);
  useEffect(() => {
    setMainImage(
      book?.picture || "assets/images/thumbs/product-details-thumb1.png"
    );
  }, [book]);

  const [quantity, setQuantity] = useState(1);
  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () =>
    setQuantity(quantity > 1 ? quantity - 1 : quantity);

  const settingsThumbs = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    focusOnSelect: true,
  };

  if (loading)
    return (
      <div className="text-center py-80">
        <Spin text={t("loading")} />
      </div>
    );
  if (error)
    return <div className="text-center py-80 text-danger">{error}</div>;
  if (!book) return <div className="text-center py-80">{t("notFound")}</div>;

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "";
    return `${new Intl.NumberFormat(locale).format(price)} ${tCommon("currency")}`;
  };

  const sellerName =
    book.shop?.name ||
    `${book.posted_by?.first_name || "Noma'lum"} ${
      book.posted_by?.last_name || ""
    }`.trim();

  // Archive book function
  const handleArchive = async () => {
    if (!window.confirm(t("archiveConfirm"))) {
      return;
    }

    try {
      setArchiving(true);
      const formData = new FormData();
      formData.append("is_active", "false");

      const response = await patchBook(book.id, formData);
      if (response.success) {
        alert(t("archiveSuccess"));
        // Refresh book data
        const updatedResponse = await getBookById(id);
        setBook(updatedResponse.book);
      } else {
        alert(
          t("archiveUnknownError", {
            message: response.message || t("unknownError"),
          })
        );
      }
    } catch (err) {
      console.error("Archive error:", err);
      alert(t("archiveError"));
    } finally {
      setArchiving(false);
    }
  };

  return (
    <section className="product-details py-80">
      <div className="container container-lg">
        <div className="product-details__top border border-gray-100 rounded-24 p-24">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-9">
              <div className="row gy-4">
                <div className="col-xl-6">
                  <ProductDetailsGallery mainImage={mainImage} book={book} />
                </div>
                <div className="col-xl-6">
                  <ProductDetailsInfo book={book} formatPrice={formatPrice} />
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <ProductDetailsSidebar
                book={book}
                archiving={archiving}
                handleArchive={handleArchive}
                setShowEditModal={setShowEditModal}
                sellerName={sellerName}
              />
            </div>
          </div>
        </div>
        <ProductDetailsTabs book={book} id={id} />
      </div>

      {/* Edit Book Modal */}
      {book && (
        <BookCreateModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedBook) => {
            setBook(updatedBook);
            setShowEditModal(false);
            // Refresh page data
            if (id) {
              getBookById(id).then((response) => {
                setBook(response.book);
              });
            }
          }}
          editBook={book}
        />
      )}
      <ToastContainer />
    </section>
  );
};

export default ProductDetailsOne;
