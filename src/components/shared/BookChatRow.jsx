"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Box, Stack, Typography, Chip } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/utils/formatPrice";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { bookTypeVisual, bookTypeI18nKey } from "@/utils/bookType";
import { bookOwnerLocation } from "@/utils/location";
import Icon from "@/components/Icon";

/**
 * Compact horizontal book card used in the feed/browse listings:
 *
 *   ┌──────────────────────────────────────┐
 *   │ [thumb 64]  Title (bold)     [badge]  │
 *   │             Author                    │
 *   │             Price        📍 Location  │
 *   └──────────────────────────────────────┘
 *
 * The trailing column is vertically split: type badge pinned top-right,
 * the poster's "Region, District" pinned bottom-right (hidden when the
 * payload carries no location — e.g. shop books).
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

  // Monetary types (sell/rent) show the price on its OWN line under the author,
  // so a long author name can never push it out of view. Non-monetary types
  // (gift/exchange) carry no price — the trailing badge conveys the type; we
  // only fall back to a text label for them when the badge is hidden.
  const isMonetary = typeKey === "seller" || typeKey === "rent";
  const price = book.discount_price || book.price;
  const priceLabel = isMonetary && price ? formatPrice(price, locale) : null;
  const typeLabel = !isMonetary && badge ? tType(bookTypeI18nKey(typeKey)) : null;
  const location = bookOwnerLocation(book);
  const hasTrailing = Boolean((showTypeBadge && badge) || location);

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
          py: 1.5,
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
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
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
          {book.author && (
            <Typography
              sx={{
                fontSize: 12,
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {book.author}
            </Typography>
          )}
          {priceLabel ? (
            <Typography
              sx={{
                mt: 0.25,
                fontSize: 13,
                fontWeight: 700,
                color: "var(--main-600, hsl(148, 59%, 39%))",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {priceLabel}
            </Typography>
          ) : (
            !showTypeBadge &&
            typeLabel && (
              <Typography sx={{ mt: 0.25, fontSize: 12, color: "var(--text-muted)" }}>
                {typeLabel}
              </Typography>
            )
          )}
        </Box>
        {hasTrailing && (
          <Stack
            sx={{
              alignSelf: "stretch",
              alignItems: "flex-end",
              flexShrink: 0,
              gap: 0.75,
            }}
          >
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
                }}
              />
            )}
            {location && (
              <Box
                sx={{
                  mt: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  maxWidth: { xs: 124, md: 156 },
                  minWidth: 0,
                }}
              >
                <Icon
                  className="ph-fill ph-map-pin"
                  style={{
                    fontSize: 13,
                    color: "var(--main-600, hsl(148, 59%, 39%))",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <Typography
                  noWrap
                  sx={{ fontSize: 11, lineHeight: 1.4, color: "var(--text-muted)" }}
                >
                  {location}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    </Link>
  );
};

export default BookChatRow;
