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
 *   │ [thumb 64]  Title (bold)              │
 *   │             Author                    │
 *   │             Price  [badge]            │
 *   │             📍 Location               │
 *   └──────────────────────────────────────┘
 *
 * Everything lives in ONE content column to the right of the thumb, so the
 * title always gets the full remaining width at any container size. (A former
 * fixed-width trailing column for badge+location starved the title to 0px in
 * narrow grids — shop detail, book-detail "more from seller" — hiding it.)
 *
 * It is a *self-contained card* (border + shadow + hover lift, mirroring
 * ShopCard) so it can sit in a responsive grid — `BookRowGrid` lays these out
 * 1-up on mobile (reads like a Telegram row) and 2–3-up on wider screens so the
 * desktop layout stops wasting horizontal space. `height: 100%` keeps every
 * card in a grid row the same height.
 *
 * Reused by `HomeBookList`, `CommunityBooksPage`, `ShopDetailPage` and
 * `MoreFromSellerSection`. The type is shown exactly one way — the colored
 * chip — in every mixed listing (`showTypeBadge`); single-type sections pass
 * `showTypeBadge=false` because their header already states the type.
 */
const BookChatRow = ({ book, showTypeBadge = true }) => {
  const tType = useTranslations("BookTypeChips");
  const locale = useLocale();

  const typeKey = (book.type || "").toLowerCase();
  const badge = bookTypeVisual(typeKey);

  // Monetary types (sell/rent) show the price on its own line under the author,
  // so a long author name can never push it out of view.
  const isMonetary = typeKey === "seller" || typeKey === "rent";
  const price = book.discount_price || book.price;
  const priceLabel = isMonetary && price ? formatPrice(price, locale) : null;
  const location = bookOwnerLocation(book);

  // The type is shown ONE way everywhere — the colored chip — for a consistent
  // visual language across the home feed, shop detail, community and the
  // book-detail "more from seller" list (there is no muted-text variant). The
  // chip is rendered in mixed listings (showTypeBadge), EXCEPT for a plain
  // "sell" book that already shows a price — there "Sotiladigan" just echoes
  // the price (redundant noise). Rent keeps its chip so "Ijaraga + price" stays
  // distinguishable from an outright sale. Single-type sections pass
  // showTypeBadge=false: their header already states the type, so no chip.
  const showTypeChip = showTypeBadge && badge && !(typeKey === "seller" && priceLabel);

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
          alignItems: "flex-start",
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
        {/* Single content column. Everything (title, author, price, type
            badge, location) lives here so the title always gets the full
            remaining width minus the thumb — at ANY container width. The
            previous fixed-width trailing column (badge + location pinned
            right) starved this column to 0px in narrow grids (shop detail,
            book-detail "more from seller"), hiding the title entirely. */}
        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text-primary)",
              // Two lines so realistic titles show in full without a
              // single-line chop; matches the roomy home feed.
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {book.name || "—"}
          </Typography>

          {book.author && (
            // One line (ellipsis): author names rarely need two, and the
            // extra reserved line made cards feel bulky ("qalin").
            <Typography noWrap sx={{ fontSize: 12, color: "var(--text-muted)" }}>
              {book.author}
            </Typography>
          )}

          {(priceLabel || showTypeChip) && (
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: "center", flexWrap: "wrap", mt: 0.25 }}
            >
              {priceLabel && (
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--main-600, hsl(148, 59%, 39%))",
                  }}
                >
                  {priceLabel}
                </Typography>
              )}
              {showTypeChip && (
                <Chip
                  size="small"
                  label={tType(bookTypeI18nKey(typeKey))}
                  sx={{
                    height: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: badge.bg,
                    color: badge.color,
                    border: "none",
                  }}
                />
              )}
            </Stack>
          )}

          {location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0, mt: 0.25 }}>
              <Icon
                className="ph-fill ph-map-pin"
                style={{
                  fontSize: 13,
                  color: "var(--main-600, hsl(148, 59%, 39%))",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <Typography noWrap sx={{ fontSize: 11, lineHeight: 1.4, color: "var(--text-muted)" }}>
                {location}
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Link>
  );
};

export default BookChatRow;
