"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Box, Stack, Typography, Chip } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/utils/formatPrice";
import { resolveMediaUrl } from "@/utils/mediaUrl";

// Keyed on the backend BookType enum value as returned by the API
// (BookType.SELLER = "seller"). `sell` is the URL/i18n alias only; the
// raw response carries `"seller"`, so the badge map must match that.
const TYPE_BADGE = {
  seller: { color: "#0d9488", bg: "rgba(13, 148, 136, 0.12)" },
  gift: { color: "#15803d", bg: "rgba(34, 197, 94, 0.14)" },
  exchange: { color: "#b45309", bg: "rgba(245, 158, 11, 0.14)" },
  rent: { color: "#4338ca", bg: "rgba(99, 102, 241, 0.14)" },
};

// BookTypeChips i18n keys still use "sell" (user-facing slug); translate
// before lookup so the chip text stays in the chosen locale.
const I18N_TYPE_KEY = { seller: "sell" };
function typeI18nKey(t) {
  return I18N_TYPE_KEY[t] || t;
}

/**
 * Telegram-inspired compact row used in book listings:
 *
 *   [thumb 60]  Title (bold)              [type badge]
 *               Author · Price
 *
 * Reused by `HomeBookList`, `CommunityBooksPage`, and `ShopDetailPage`.
 * When `showTypeBadge` is true the trailing badge is rendered; pass false
 * in single-type listings where the badge would be redundant.
 */
const BookChatRow = ({ book, showTypeBadge = true }) => {
  const tType = useTranslations("BookTypeChips");
  const locale = useLocale();

  const typeKey = (book.type || "").toLowerCase();
  const badge = TYPE_BADGE[typeKey];

  const priceNode = (() => {
    if (typeKey === "gift") return tType("gift");
    if (typeKey === "exchange") return tType("exchange");
    const price = book.discount_price || book.price;
    return price ? formatPrice(price, locale) : null;
  })();

  return (
    <Link
      href={`/book-details/${book.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          px: { xs: 1.5, md: 2 },
          py: 1.25,
          "&:hover": { bgcolor: "var(--surface-muted)" },
          transition: "background-color 0.15s ease",
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
            <i
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
            label={tType(typeI18nKey(typeKey))}
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
