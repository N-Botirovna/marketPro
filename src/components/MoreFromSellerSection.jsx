"use client";

import React, { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import BookRowGrid from "@/components/shared/BookRowGrid";
import { getSellerBooks } from "@/services/books";

/**
 * "More from this seller" — the bottom block on a book detail page. One call to
 * `getSellerBooks(bookId)` resolves whether the seller is a user or a shop and
 * returns up to 5 OTHER active books, the total count, and a seller descriptor.
 * The "see all" link points at the seller's full catalog (shop detail / public
 * user profile). The whole section self-hides when the seller has no other
 * books, so it never renders an empty shell.
 */
export default function MoreFromSellerSection({ bookId }) {
  const t = useTranslations("BookDetails");
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState(null);
  const [count, setCount] = useState(0);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    if (!bookId) return undefined;
    let alive = true;
    setLoading(true);
    getSellerBooks(bookId, 5)
      .then((res) => {
        if (!alive) return;
        setSeller(res.seller);
        setCount(res.count);
        setBooks(res.books);
      })
      .catch(() => {
        if (alive) setBooks([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [bookId]);

  // Resolved with no other books → hide the section entirely (no empty box).
  if (!loading && books.length === 0) return null;

  const seeAllHref =
    seller?.kind === "shop"
      ? `/shops/${seller.id}`
      : seller?.kind === "user"
        ? `/user/${seller.id}`
        : null;

  const heading =
    seller?.kind === "shop" ? t("moreFromShop", { name: seller?.name || "" }) : t("moreFromUser");

  return (
    <Box component="section" sx={{ mt: { xs: 4, md: 5 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2, gap: 1, flexWrap: "wrap" }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 17, md: 20 },
            fontWeight: 700,
            color: "var(--text-primary)",
            m: 0,
          }}
        >
          {heading}
        </Typography>

        {seeAllHref && count > 0 && (
          <Link
            href={seeAllHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--main-600, #2e7d32)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {t("seeAll")}
            {count > books.length ? ` (${count})` : ""}
            <Icon className="ph ph-arrow-right" aria-hidden="true" />
          </Link>
        )}
      </Stack>

      <BookRowGrid books={books} loading={loading} skeletonCount={3} />
    </Box>
  );
}
