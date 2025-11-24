"use client";

import React from "react";

const ProductDetailsGallery = ({ mainImage, book }) => {
  return (
    <div className="product-details__left">
      <div className="product-details__thumb-slider border border-gray-100 rounded-16">
        <div className="product-details__thumb flex-center h-100">
          <img
            src={mainImage}
            alt={book?.name}
            style={{ maxHeight: "400px", width: "auto" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsGallery;

