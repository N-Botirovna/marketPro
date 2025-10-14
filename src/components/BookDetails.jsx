"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getBookById } from "@/services/books";
import { useAuth } from "@/hooks/useAuth";
import BookCreateModal from "./BookCreateModal";

const BookDetails = ({ bookId }) => {
  const { isAuthenticated, token } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await getBookById(bookId);
      setBook(response.book);
    } catch (err) {
      console.error("Kitob tafsilotlari yuklashda xatolik:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat("uz-UZ").format(price);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "gift":
        return "Sovg'a";
      case "exchange":
        return "Almashtirish";
      case "seller":
        return "Sotish";
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
        return "Foydalanuvchi";
      case "shop":
        return "Do'kon";
      default:
        return ownerType;
    }
  };

  const getCoverTypeLabel = (coverType) => {
    switch (coverType) {
      case "hard":
        return "Qattiq muqova";
      case "soft":
        return "Yumshoq muqova";
      default:
        return coverType;
    }
  };

  const getScriptTypeLabel = (scriptType) => {
    switch (scriptType) {
      case "latin":
        return "Lotin";
      case "cyrillic":
        return "Kirill";
      case "arabic":
        return "Arab";
      default:
        return scriptType;
    }
  };

  const isOwnBook = () => {
    if (!isAuthenticated || !book?.posted_by?.id) return false;
    // You would need to get current user ID from auth context
    // For now, we'll show edit button if user is authenticated
    // In a real app, you'd compare with current user ID
    return true;
  };

  if (loading) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
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
            <p className="text-danger">
              Kitob tafsilotlari yuklashda xatolik yuz berdi
            </p>
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
            <p className="text-muted">Kitob topilmadi</p>
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
            {/* Book Images */}
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
              {/* Type Badge */}
              <div className="mb-16">
                <span className={`badge ${getTypeColor(book.type)} text-white`}>
                  {getTypeLabel(book.type)}
                </span>
                {book.is_used && (
                  <span className="badge bg-dark text-white ms-8">
                    Yangidek
                  </span>
                )}
              </div>

              {/* Book Name */}
              <h1 className="product-details__title text-3xl fw-bold mb-16">
                {book.name || "Kitob nomi"}
              </h1>

              {/* Author */}
              <div className="mb-16">
                <span className="text-gray-600 me-8">
                  <i className="ph ph-user me-4"></i>
                  Muallif:
                </span>
                <span className="fw-medium">
                  {book.author || "Noma'lum muallif"}
                </span>
              </div>

              {/* Language */}
              {book.language && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-globe me-4"></i>
                    Til:
                  </span>
                  <span className="fw-medium">{book.language}</span>
                </div>
              )}

              {/* Script Type */}
              {book.script_type && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-text-aa me-4"></i>
                    Yozuv turi:
                  </span>
                  <span className="fw-medium">
                    {getScriptTypeLabel(book.script_type)}
                  </span>
                </div>
              )}

              {/* Cover Type */}
              {book.cover_type && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-book me-4"></i>
                    Muqova:
                  </span>
                  <span className="fw-medium">
                    {getCoverTypeLabel(book.cover_type)}
                  </span>
                </div>
              )}

              {/* Publication Year */}
              {book.publication_year && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-calendar me-4"></i>
                    Nashr yili:
                  </span>
                  <span className="fw-medium">{book.publication_year}</span>
                </div>
              )}

              {/* Pages */}
              {book.pages && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-file-text me-4"></i>
                    Sahifalar:
                  </span>
                  <span className="fw-medium">{book.pages} sahifa</span>
                </div>
              )}

              {/* ISBN */}
              {book.isbn && (
                <div className="mb-16">
                  <span className="text-gray-600 me-8">
                    <i className="ph ph-barcode me-4"></i>
                    ISBN:
                  </span>
                  <span className="fw-medium">{book.isbn}</span>
                </div>
              )}

              {/* Owner Info */}
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
                      {book.posted_by?.first_name} {book.posted_by?.last_name}
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
                      <small className="text-gray-500">Do'kon</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="product-details__price mb-24">
                {book.discount_price ? (
                  <div>
                    <span className="text-main-600 fw-bold text-2xl">
                      {formatPrice(book.discount_price)} so'm
                    </span>
                    <span className="text-decoration-line-through text-gray-500 ms-16">
                      {formatPrice(book.price)} so'm
                    </span>
                    {book.percentage && (
                      <span className="badge bg-danger ms-16">
                        -{book.percentage}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-main-600 fw-bold text-2xl">
                    {formatPrice(book.price)} so'm
                  </span>
                )}
              </div>

              {/* Seller Information */}
              <div className="mb-24 p-16 bg-gray-50 rounded-12">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <i className="ph ph-storefront text-main-600 me-8"></i>
                    <span className="text-gray-600 me-8">Sotuvchi:</span>
                    <span className="fw-medium">
                      {book.shop?.name || `${book.posted_by?.first_name || 'Noma\'lum'} ${book.posted_by?.last_name || ''}`.trim()}
                    </span>
                  </div>
                  {isOwnBook() && (
                    <button 
                      className="btn btn-sm btn-outline-main"
                      onClick={() => setShowEditModal(true)}
                    >
                      <i className="ph ph-pencil me-4"></i>
                      Tahrirlash
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
                    {new Date(book.created_at).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex gap-16 flex-wrap">
                <button className="btn btn-main px-32 py-16">
                  <i className="ph ph-shopping-cart me-8"></i>
                  Savatga qo'shish
                </button>
                <button className="btn btn-outline-main px-32 py-16">
                  <i className="ph ph-heart me-8"></i>
                  Sevimlilar
                </button>
                <button className="btn btn-outline-secondary px-32 py-16">
                  <i className="ph ph-share-network me-8"></i>
                  Ulashish
                </button>
              </div>

              {/* Contact Seller */}
              <div className="mt-32 p-24 bg-gray-50 rounded-16">
                <h6 className="mb-16">Sotuvchi bilan bog'lanish</h6>
                <div className="d-flex gap-12 flex-wrap">
                  <button className="btn btn-outline-primary px-24 py-12">
                    <i className="ph ph-phone me-8"></i>
                    Telefon
                  </button>
                  <button className="btn btn-outline-success px-24 py-12">
                    <i className="ph ph-messenger-logo me-8"></i>
                    Xabar
                  </button>
                  <button className="btn btn-outline-info px-24 py-12">
                    <i className="ph ph-telegram-logo me-8"></i>
                    Telegram
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="row mt-80">
            <div className="col-12">
              <div className="border border-gray-100 rounded-16 p-32">
                <h5 className="mb-24">Kitob haqida</h5>
                <p className="text-gray-700 line-height-1-6">
                  {book.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="row mt-40">
          <div className="col-12">
            <div className="border border-gray-100 rounded-16 p-32">
              <h5 className="mb-24">Qo'shimcha ma'lumotlar</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-16">
                    <strong>Kitob turi:</strong> {getTypeLabel(book.type)}
                  </div>
                  <div className="mb-16">
                    <strong>Holati:</strong>{" "}
                    {book.is_used ? "Yangidek" : "Yangi"}
                  </div>
                  <div className="mb-16">
                    <strong>Egasi:</strong> {getOwnerTypeLabel(book.owner_type)}
                  </div>
                  {book.language && (
                    <div className="mb-16">
                      <strong>Til:</strong> {book.language}
                    </div>
                  )}
                  {book.script_type && (
                    <div className="mb-16">
                      <strong>Yozuv turi:</strong>{" "}
                      {getScriptTypeLabel(book.script_type)}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  {book.cover_type && (
                    <div className="mb-16">
                      <strong>Muqova:</strong>{" "}
                      {getCoverTypeLabel(book.cover_type)}
                    </div>
                  )}
                  {book.publication_year && (
                    <div className="mb-16">
                      <strong>Nashr yili:</strong> {book.publication_year}
                    </div>
                  )}
                  {book.pages && (
                    <div className="mb-16">
                      <strong>Sahifalar:</strong> {book.pages} sahifa
                    </div>
                  )}
                  {book.isbn && (
                    <div className="mb-16">
                      <strong>ISBN:</strong> {book.isbn}
                    </div>
                  )}
                  <div className="mb-16">
                    <strong>Yaratilgan sana:</strong>{" "}
                    {new Date(book.created_at).toLocaleDateString("uz-UZ")}
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
                  <span>Siz bu kitobni yangilashingiz mumkin</span>
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
    </section>
  );
};

export default BookDetails;
