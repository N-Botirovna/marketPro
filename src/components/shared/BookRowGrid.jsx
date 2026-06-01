"use client";

import React from "react";
import { Box } from "@mui/material";
import BookChatRow from "@/components/shared/BookChatRow";
import BookRowSkeleton from "@/components/shared/BookRowSkeleton";

/**
 * Single source of truth for the feed/browse listing layout — the compact
 * horizontal `BookChatRow` cards in a responsive grid:
 *
 *   xs  → 1 column  (reads like a Telegram row on phones)
 *   sm  → 2 columns
 *   lg+ → 3 columns  (fills desktop width instead of one full-width row with
 *                     a sea of empty space to its right)
 *
 * Mirrors `HomeShopsRow`'s grid so books and shops break at the same points.
 * `loading` swaps in `BookRowSkeleton`s at the same breakpoints; `emptyState`
 * renders when there are no books and not loading.
 */
const GRID_SX = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: { xs: 1.25, md: 1.5 },
};

const BookRowGrid = ({
  books = [],
  loading = false,
  skeletonCount = 6,
  showTypeBadge = true,
  emptyState = null,
}) => {
  if (loading) {
    return (
      <Box sx={GRID_SX}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <BookRowSkeleton key={`book-row-skel-${i}`} />
        ))}
      </Box>
    );
  }

  if (!books.length) return emptyState;

  return (
    <Box sx={GRID_SX}>
      {books.map((book) => (
        <BookChatRow key={book.id} book={book} showTypeBadge={showTypeBadge} />
      ))}
    </Box>
  );
};

export default BookRowGrid;
