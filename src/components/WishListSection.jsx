"use client";
import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getLikedBooks, likeBook } from "@/services/books";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "./Toast";
import { useTranslations, useLocale } from "next-intl";
import Spin from "./Spin";

const WishListSection = () => {
  const { isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const locale = useLocale();
  const tCommon = useTranslations("Common");
  const tWishList = useTranslations("WishList");
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedBooks();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchLikedBooks = async () => {
    try {
      setLoading(true);
      const response = await getLikedBooks();
      setBooks(response.books || []);
    } catch (error) {
      console.error("Liked books xatolik:", error);
      showToast({
        type: 'error',
        title: tCommon("error") || "Xatolik",
        message: "Ma'lumotlarni yuklashda xatolik",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    if (removing[bookId]) return;

    try {
      setRemoving(prev => ({ ...prev, [bookId]: true }));
      
      // Unlike qilish uchun /like API'ga so'rov yuborish
      const response = await likeBook(bookId);
      
      if (response.success) {
        // Ro'yxatdan o'chirish
        setBooks(prev => prev.filter(book => book.id !== bookId));
        
        // localStorage'dan o'chirish
        if (typeof window !== 'undefined') {
          const likedMap = localStorage.getItem('liked_books_map');
          const map = likedMap ? JSON.parse(likedMap) : {};
          delete map[bookId];
          localStorage.setItem('liked_books_map', JSON.stringify(map));
        }
        
        // Header'ni yangilash
        window.dispatchEvent(new Event('bookUnliked'));
        
        showToast({
          type: 'success',
          title: tCommon("success") || "Muvaffaqiyatli",
          message: "Wishlist'dan olib tashlandi",
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Remove error:", error);
      showToast({
        type: 'error',
        title: tCommon("error") || "Xatolik",
        message: "Kitobni olib tashlashda xatolik",
        duration: 3000
      });
    } finally {
      setRemoving(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const getLocalizedField = (book, fieldPrefix) => {
    if (!book) return '';
    const localizedKey = `${fieldPrefix}_${locale}`;
    const fallbackKey = `${fieldPrefix}_uz`;
    return book[localizedKey] || book[fallbackKey] || book[fieldPrefix] || '';
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "0";
    return `${new Intl.NumberFormat(locale).format(price)} ${tCommon("currency") || "so'm"}`;
  };

  if (!isAuthenticated) {
    return (
      <section className="cart py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <i className="ph ph-heart text-gray-300 text-5xl mb-16"></i>
            <h5 className="text-gray-500 mb-8">Tizimga kiring</h5>
            <p className="text-gray-400 text-sm mb-24">
              Wishlist'ni ko'rish uchun tizimga kiring
            </p>
            <Link href="/login" className="btn btn-main">
              Kirish
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="cart py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <Spin text="Yuklanmoqda..." />
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return (
      <section className="cart py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <i className="ph ph-heart text-gray-300 text-5xl mb-16"></i>
            <h5 className="text-gray-500 mb-8">Wishlist bo'sh</h5>
            <p className="text-gray-400 text-sm mb-24">
              Hozircha like qilingan kitoblar yo'q
            </p>
            <Link href="/vendor-two" className="btn btn-main">
              Kitoblar sahifasiga o'tish
            </Link>
          </div>
          <ToastContainer />
        </div>
      </section>
    );
  }

  return (
    <section className="cart py-80">
      <div className="container container-lg">
        <div className="row gy-4">
          <div className="col-lg-12">
            <div className="cart-table border border-gray-100 rounded-8">
              <div className="overflow-x-auto scroll-sm scroll-sm-horizontal">
                <table className="table rounded-8 overflow-hidden">
                  <thead>
                    <tr className="border-bottom border-neutral-100">
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32 border-end border-neutral-100">
                        {tWishList("delete") || "O'chirish"}
                      </th>
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32 border-end border-neutral-100">
                        {tWishList("productName") || "Kitob nomi"}
                      </th>
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32 border-end border-neutral-100">
                        {tWishList("unitPrice") || "Narxi"}
                      </th>
  
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32" />
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id}>
                        <td className="px-40 py-32 border-end border-neutral-100">
                          <button
                            type="button"
                            onClick={() => handleRemove(book.id)}
                            disabled={removing[book.id]}
                            className="remove-tr-btn flex-align gap-12 hover-text-danger-600"
                          >
                            <i className="ph ph-x-circle text-2xl d-flex" />
                            {removing[book.id] ? "Kutilmoqda..." : (tWishList("remove") || "O'chirish")}
                          </button>
                        </td>
                        <td className="px-40 py-32 border-end border-neutral-100">
                          <div className="table-product d-flex align-items-center gap-24">
                            <Link
                              href={`/product-details?id=${book.id}`}
                              className="table-product__thumb border border-gray-100 rounded-8 flex-center"
                              style={{ width: "100px", height: "120px", overflow: "hidden" }}
                            >
                              <img
                                src={book.picture || "assets/images/thumbs/product-two-img1.png"}
                                alt={getLocalizedField(book, "name")}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain"
                                }}
                              />
                            </Link>
                            <div className="table-product__content text-start">
                              <h6 className="title text-lg fw-semibold mb-8">
                                <Link
                                  href={`/product-details?id=${book.id}`}
                                  className="link text-line-2"
                                  tabIndex={0}
                                >
                                  {getLocalizedField(book, "name") || "Noma'lum kitob"}
                                </Link>
                              </h6>
                              <div className="flex-align gap-16 mb-16">
                                <span className="text-neutral-600 text-sm">
                                  {book.like_count || 0} Like
                                </span>
                              </div>
                              <div className="flex-align gap-16">
                                <span className="text-sm text-gray-600">
                                  {getLocalizedField(book, "author") || "Muallif noma'lum"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-40 py-32 border-end border-neutral-100">
                          <span className="text-lg h6 mb-0 fw-semibold">
                            {formatPrice(book.discount_price || book.price)}
                          </span>
                          {book.discount_price && (
                            <span className="text-md text-gray-400 text-decoration-line-through d-block mt-4">
                              {formatPrice(book.price)}
                            </span>
                          )}
                        </td>
                        <td className="px-40 py-32">
                          <Link
                            href={`/product-details?id=${book.id}`}
                            className="product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
                            tabIndex={0}
                          >
                            {tWishList("viewDetails")}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default WishListSection;
