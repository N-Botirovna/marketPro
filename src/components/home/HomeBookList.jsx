"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box } from "@mui/material";
import { getBooks } from "@/services/books";
import BookRowGrid from "@/components/shared/BookRowGrid";
import SectionHeader from "@/components/shared/SectionHeader";

/**
 * Telegram chat-row inspired home section. Lists up to `limit` books filtered
 * by `type` and (optionally) `ownerType=user|shop`. Rendered conditionally —
 * the section hides itself when there are zero results so the home feed stays
 * tight on data-light deployments.
 *
 * Row visuals live in `BookChatRow` (shared with CommunityBooksPage and
 * ShopDetailPage) so a tweak to row design touches one file.
 */
const HomeBookList = ({ type, ownerType, titleKey, viewAllHref, limit = 6, initialBooks }) => {
  const t = useTranslations("HomeBookList");
  // When the server passed pre-fetched books we trust them and skip the
  // client round-trip entirely. The fallback fetch only fires when this
  // component is mounted outside the server-rendered home (e.g. embedded
  // somewhere that doesn't pre-fetch).
  const hasInitial = Array.isArray(initialBooks);
  const [books, setBooks] = useState(hasInitial ? initialBooks : []);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    if (hasInitial) return undefined;
    let alive = true;
    // `standalone` hides books that live inside a collection — the bundle
    // shows once as a collection card (see HomeCollectionsRow) instead.
    const params = { is_active: true, standalone: true, limit };
    if (type) params.type = type;
    if (ownerType) params.owner_type = ownerType;

    getBooks(params)
      .then((res) => {
        if (alive) setBooks(res.books || []);
      })
      .catch(() => {
        /* non-critical */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [type, ownerType, limit, hasInitial]);

  if (!loading && books.length === 0) return null;

  return (
    <Box component="section" sx={{ bgcolor: "var(--surface-page)", py: { xs: 2, md: 2.75 } }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <SectionHeader title={t(titleKey)} href={viewAllHref} seeAllLabel={t("seeAll")} />

        <BookRowGrid books={books} loading={loading} skeletonCount={limit} showTypeBadge={!type} />
      </Box>
    </Box>
  );
};

export default HomeBookList;
