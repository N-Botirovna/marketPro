import React from "react";

/**
 * Loading placeholder that mirrors `BookCard`'s footprint exactly — same
 * `.book-card` shell, same 3:4 thumb, same stack of meta lines + CTA — so the
 * grid doesn't reflow when real cards swap in. Shimmer comes from `.kz-skel`.
 */
const BookCardSkeleton = () => (
  <div className="book-card h-100 p-8 p-sm-12 border border-gray-100 rounded-16" aria-hidden="true">
    <div className="kz-skel" style={{ width: "100%", aspectRatio: "3 / 4", borderRadius: 12 }} />
    <div className="mt-12 d-flex flex-column" style={{ gap: 8 }}>
      <div className="kz-skel" style={{ height: 14, width: "85%" }} />
      <div className="kz-skel" style={{ height: 12, width: "55%" }} />
      <div className="kz-skel" style={{ height: 16, width: "40%" }} />
      <div className="kz-skel mt-8" style={{ height: 38, width: "100%", borderRadius: 999 }} />
    </div>
  </div>
);

export default BookCardSkeleton;
