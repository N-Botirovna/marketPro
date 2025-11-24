"use client";

import React, { useCallback, useState } from "react";
import BreadcrumbTwo from "./BreadcrumbTwo";
import ProductDetailsOne from "./ProductDetailsOne";

const ProductDetailsPageContent = () => {
  const [bookTitle, setBookTitle] = useState("");

  const handleBookLoaded = useCallback((book) => {
    setBookTitle(book?.title || "");
  }, []);

  const breadcrumbItems = [
    { label: "Products" },
  ];

  return (
    <>
      <BreadcrumbTwo
        title="Product Details"
        items={breadcrumbItems}
        currentLabel={bookTitle || "Loading..."}
      />
      <ProductDetailsOne onBookLoaded={handleBookLoaded} />
    </>
  );
};

export default ProductDetailsPageContent;

