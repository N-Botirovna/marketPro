"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const BookCard = ({ book, className = "" }) => {
  if (!book) return null;

  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'gift': return 'Sovg\'a';
      case 'exchange': return 'Almashtirish';
      case 'seller': return 'Sotish';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'gift': return 'bg-success';
      case 'exchange': return 'bg-warning';
      case 'seller': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const getOwnerTypeLabel = (ownerType) => {
    switch (ownerType) {
      case 'user': return 'Foydalanuvchi';
      case 'shop': return 'Do\'kon';
      default: return ownerType;
    }
  };

  return (
    <div className={`product-item ${className}`}>
      <div className="product-item__inner position-relative">
        {/* Type Badge */}
        <div className={`position-absolute top-0 start-0 m-12 badge ${getTypeColor(book.type)} text-white`}>
          {getTypeLabel(book.type)}
        </div>

        {/* Used Badge */}
        {book.is_used && (
          <div className="position-absolute top-0 end-0 m-12 badge bg-dark text-white">
            Ishlatilgan
          </div>
        )}

        {/* Book Image */}
        <div className="product-item__thumb">
          <Link href={`/book-details/${book.id}`}>
            <img
              src={book.picture || '/assets/images/thumbs/book-placeholder.png'}
              alt={book.name}
              className="w-100"
              style={{ height: '250px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = '/assets/images/thumbs/book-placeholder.png';
              }}
            />
          </Link>
        </div>

        {/* Book Info */}
        <div className="product-item__content p-16">
          {/* Book Name */}
          <h6 className="product-item__title mb-8">
            <Link href={`/book-details/${book.id}`} className="text-gray-900 hover-text-main-600">
              {book.name || 'Kitob nomi'}
            </Link>
          </h6>

          {/* Author */}
          <p className="text-gray-600 text-sm mb-8">
            <i className="ph ph-user me-8"></i>
            {book.author || 'Noma\'lum muallif'}
          </p>

          {/* Owner Info */}
          <div className="d-flex align-items-center mb-12">
            {book.posted_by?.picture && (
              <img
                src={book.posted_by.picture}
                alt={book.posted_by.first_name}
                className="rounded-circle me-8"
                style={{ width: '24px', height: '24px' }}
              />
            )}
            <span className="text-sm text-gray-600">
              {book.posted_by?.first_name} {book.posted_by?.last_name}
            </span>
            <span className="text-xs text-gray-500 ms-8">
              ({getOwnerTypeLabel(book.owner_type)})
            </span>
          </div>

          {/* Shop Info */}
          {book.shop && (
            <div className="d-flex align-items-center mb-12">
              {book.shop.picture && (
                <img
                  src={book.shop.picture}
                  alt={book.shop.name}
                  className="rounded-circle me-8"
                  style={{ width: '20px', height: '20px' }}
                />
              )}
              <span className="text-sm text-gray-600">
                {book.shop.name}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="product-item__price d-flex align-items-center justify-content-between">
            <div>
              {book.discount_price ? (
                <div>
                  <span className="text-main-600 fw-bold text-lg">
                    {formatPrice(book.discount_price)} so'm
                  </span>
                  <span className="text-decoration-line-through text-gray-500 ms-8">
                    {formatPrice(book.price)} so'm
                  </span>
                  {book.percentage && (
                    <span className="badge bg-danger ms-8">
                      -{book.percentage}%
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-main-600 fw-bold text-lg">
                  {formatPrice(book.price)} so'm
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="d-flex align-items-center justify-content-between mt-12">
            <div className="d-flex align-items-center gap-16">
              {book.like_count && (
                <span className="text-sm text-gray-500">
                  <i className="ph ph-heart me-4"></i>
                  {book.like_count}
                </span>
              )}
              {book.view_count && (
                <span className="text-sm text-gray-500">
                  <i className="ph ph-eye me-4"></i>
                  {book.view_count}
                </span>
              )}
              {book.comment_count && (
                <span className="text-sm text-gray-500">
                  <i className="ph ph-chat-circle me-4"></i>
                  {book.comment_count}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(book.created_at).toLocaleDateString('uz-UZ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
