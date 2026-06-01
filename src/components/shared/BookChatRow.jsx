"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Box, Stack, Typography, Chip } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/utils/formatPrice";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { bookTypeVisual, bookTypeI18nKey } from "@/utils/bookType";
import Icon from "@/components/Icon";

/**
 * Compact horizontal book card used in the feed/browse listings:
 *
 *   ┌────────────────────────────────────┐
 *   │ [thumb 60]  Title (bold)   [badge]  │
 *   │             Author · Price          │
 *   └────────────────────────────────────┘
 *
 * It is a *self-contained card* (border + shadow + hover lift, mirroring
 * ShopCard) so it can sit in a responsive grid — `BookRowGrid` lays these out
 * 1-up on mobile (reads like a Telegram row) and 2–3-up on wider screens so the
 * desktop layout stops wasting horizontal space. `height: 100%` keeps every
 * card in a grid row the same height.
 *
 * Reused by `HomeBookList`, `CommunityBooksPage`, and `ShopDetailPage`.
 * When `showTypeBadge` is true the trailing badge is rendered; pass false in
 * single-type listings where the badge would be redundant.
 */
const BookChatRow = ({ book, showTypeBadge = true }) => {
  const tType = useTranslations("BookTypeChips");
  const locale = useLocale();

  const typeKey = (book.type || "").toLowerCase();
  const badge = bookTypeVisual(typeKey);

  const priceNode = (() => {
    if (typeKey === "gift") return tType("gift");
    if (typeKey === "exchange") return tType("exchange");
    const price = book.discount_price || book.price;
    return price ? formatPrice(price, locale) : null;
  })();

  return (
    <Link
      href={`/book-details/${book.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          height: "100%",
          alignItems: "center",
          px: { xs: 1.5, md: 1.75 },
          py: 1.25,
          borderRadius: 2.5,
          bgcolor: "var(--surface-card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
          transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "var(--shadow-elevated)",
            borderColor: "var(--main-600, hsl(148, 59%, 39%))",
          },
        }}
      >
        <Box
          sx={{
            width: { xs: 52, md: 60 },
            height: { xs: 52, md: 60 },
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "var(--surface-muted)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {book.picture ? (
            // eslint-disable-next-line @next/next/no-img-element -- fixed-size thumb, lazy loaded
            <img
              src={resolveMediaUrl(book.picture)}
              alt={book.name || ""}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <Icon
              className="ph ph-book"
              style={{ fontSize: 22, color: "var(--text-muted)" }}
              aria-hidden="true"
            />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {book.name || "—"}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: "var(--text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {[book.author, priceNode].filter(Boolean).join(" · ") || "—"}
          </Typography>
        </Box>
        {showTypeBadge && badge && (
          <Chip
            size="small"
            label={tType(bookTypeI18nKey(typeKey))}
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: badge.bg,
              color: badge.color,
              border: "none",
              flexShrink: 0,
            }}
          />
        )}
      </Stack>
    </Link>
  );
};

export default BookChatRow;
