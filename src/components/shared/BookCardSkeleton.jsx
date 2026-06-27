import React from "react";

/**
 * Loading placeholder that mirrors `BookCard`'s footprint exactly — same
 * `.book-card` shell, same 3:4 thumb, same stack of meta lines + CTA — so the
 * grid doesn't reflow when real cards swap in. Shimmer comes from `.kz-skel`.
 */
const BookCardSkeleton = () => (
  <div className="book-card" aria-hidden="true">
    <div className="book-card__thumb">
      <div className="kz-skel" style={{ width: "100%", height: "100%" }} />
    </div>
    <div className="book-card__content">
      <div className="kz-skel" style={{ height: 14, width: "90%" }} />
      <div className="kz-skel" style={{ height: 14, width: "60%" }} />
      <div className="kz-skel" style={{ height: 12, width: "45%" }} />
      <div className="kz-skel" style={{ height: 18, width: "50%", marginTop: 2 }} />
      <div
        className="kz-skel"
        style={{ height: 36, width: "100%", borderRadius: 999, marginTop: "auto" }}
      />
    </div>
  </div>
);

export default BookCardSkeleton;
