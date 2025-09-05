"use client";
import React from "react";
import Link from "next/link";

const ShopCard = ({ shop, className = "" }) => {
  if (!shop) return null;

  const renderStars = (star) => {
    const rating = parseFloat(star) || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="d-flex align-items-center gap-4">
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="ph ph-star-fill text-warning"></i>
        ))}
        {hasHalfStar && (
          <i className="ph ph-star-half-fill text-warning"></i>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={i} className="ph ph-star text-gray-300"></i>
        ))}
        <span className="text-sm text-gray-500">({star})</span>
      </div>
    );
  };

  return (
    <div className={`shop-item ${className}`}>
      <div className="shop-item__inner position-relative">
        {/* Shop Image */}
        <div className="shop-item__thumb">
          <Link href={`/shop-details/${shop.id}`}>
            <img
              src={shop.picture || '/assets/images/thumbs/shop-placeholder.png'}
              alt={shop.name}
              className="w-100"
              style={{ height: '200px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = '/assets/images/thumbs/shop-placeholder.png';
              }}
            />
          </Link>
        </div>

        {/* Shop Info */}
        <div className="shop-item__content p-16">
          {/* Shop Name */}
          <h6 className="shop-item__title mb-8">
            <Link href={`/shop-details/${shop.id}`} className="text-gray-900 hover-text-main-600">
              {shop.name || 'Do\'kon nomi'}
            </Link>
          </h6>

          {/* Rating */}
          <div className="mb-12">
            {renderStars(shop.star)}
          </div>

          {/* Book Count */}
          {shop.book_count && (
            <div className="d-flex align-items-center mb-12">
              <i className="ph ph-book text-primary me-4"></i>
              <span className="text-sm text-gray-600">
                {shop.book_count} ta kitob
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="d-flex gap-8 flex-wrap">
            <Link 
              href={`/shop-details/${shop.id}`}
              className="btn btn-outline-main btn-sm flex-grow-1"
            >
              <i className="ph ph-eye me-4"></i>
              Ko'rish
            </Link>
            <Link 
              href={`/shop/${shop.id}/books`}
              className="btn btn-main btn-sm flex-grow-1"
            >
              <i className="ph ph-books me-4"></i>
              Kitoblar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
