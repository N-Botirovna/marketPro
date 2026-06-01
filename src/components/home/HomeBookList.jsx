"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Stack, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { getBooks } from "@/services/books";
import BookRowGrid from "@/components/shared/BookRowGrid";
import Icon from "@/components/Icon";

/**
 * Telegram chat-row inspired home section. Lists up to `limit` books filtered
 * by `type` and (optionally) `ownerType=user|shop`. Rendered conditionally —
 * the section hides itself when there are zero results so the home feed stays
 * tight on data-light deployments.
 *
 * Row visuals live in `BookChatRow` (shared with CommunityBooksPage and
 * ShopDetailPage) so a tweak to row design touches one file.
 */
const HomeBookList = ({ type, ownerType, titleKey, viewAllHref, limit = 5, initialBooks }) => {
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
    const params = { is_active: true, limit };
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
        {/* Telegram-style channel header: title left, pill "see all" right,
            generous gap so long titles never crash into the link. Title
            ellipses on overflow instead of wrapping under the link. */}
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1.5, minHeight: 32 }}>
          <Typography
            component="h2"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: { xs: 16, md: 18 },
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.25,
            }}
          >
            {t(titleKey)}
          </Typography>
          <Link
            href={viewAllHref}
            aria-label={`${t(titleKey)} — ${t("seeAll")}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--main-600, hsl(148, 59%, 39%))",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 999,
              background: "transparent",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {t("seeAll")}
            <Icon className="ph ph-caret-right" aria-hidden="true" style={{ fontSize: 14 }} />
          </Link>
        </Stack>

        <BookRowGrid books={books} loading={loading} skeletonCount={limit} showTypeBadge={!type} />
      </Box>
    </Box>
  );
};

export default HomeBookList;
