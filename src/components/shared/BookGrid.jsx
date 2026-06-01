"use client";

import React from "react";
import BookCard from "@/components/BookCard";
import BookCardSkeleton from "@/components/shared/BookCardSkeleton";

/**
 * The single source of truth for the rich book-*card* grid (profile, archive,
 * wishlist, public profile). Owns ONE responsive column rule so every grid in
 * the app breaks identically:
 *
 *   xs/sm → 2 columns (col-6)   ← fixes the "giant card on mobile" bug, where
 *   md/lg → 3 columns (col-md-4)   single-column grids stretched the 3:4 cover
 *   xl/xxl → 4 columns (col-xl-3)  to full viewport width.
 *
 * Telegram-style compact listings use `BookChatRow` instead — this grid is for
 * the contexts where the full card (cover, price, like/edit/archive) matters.
 *
 * `loading` swaps in `BookCardSkeleton`s at the same breakpoints so the layout
 * never reflows. `renderCard` lets a caller pass per-book props (e.g. an
 * `isArchiving` flag); otherwise each book renders a default `BookCard`.
 */
const COL_CLASS = "col-6 col-md-4 col-xl-3";

const BookGrid = ({
  books = [],
  loading = false,
  skeletonCount = 8,
  emptyState = null,
  renderCard,
  cardProps,
}) => {
  if (loading) {
    return (
      <div className="row g-3 g-md-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={`book-skel-${i}`} className={COL_CLASS}>
            <BookCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!books.length) return emptyState;

  return (
    <div className="row g-3 g-md-4">
      {books.map((book) => (
        <div key={book.id} className={COL_CLASS}>
          {renderCard ? renderCard(book) : <BookCard book={book} {...cardProps} />}
        </div>
      ))}
    </div>
  );
};

export default BookGrid;
