"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Box, Stack, Typography, Chip } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/utils/formatPrice";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { bookOwnerLocation } from "@/utils/location";
import Icon from "@/components/Icon";

/**
 * Compact bundle card for feed/browse grids — the collection sibling of
 * BookChatRow, so books and bundles line up in the same responsive grid.
 *
 *   ┌────────────────────────────────────────┐
 *   │ [montage]  Title (2 lines)   [📚 N]     │
 *   │            Bundle price                  │
 *   │            ̶O̶r̶i̶g̶i̶n̶a̶l̶  -20%   📍 Loc      │
 *   └────────────────────────────────────────┘
 *
 * The thumbnail is a 2×2 montage of the first member covers with a "stack"
 * badge so a bundle reads as a bundle at a glance.
 */
const MONTAGE_CELL = { width: "50%", height: "50%", position: "absolute", overflow: "hidden" };
const CELL_POS = [
  { top: 0, left: 0 },
  { top: 0, right: 0 },
  { bottom: 0, left: 0 },
  { bottom: 0, right: 0 },
];

const CollectionRow = ({ collection }) => {
  const t = useTranslations("CollectionCard");
  const locale = useLocale();

  const covers = (
    collection.covers && collection.covers.length
      ? collection.covers
      : (collection.books || []).map((b) => b.picture).filter(Boolean)
  ).slice(0, 4);
  const count = collection.book_count ?? (collection.books || []).length;
  const bundle = collection.bundle_price;
  const original = collection.original_total;
  const pct = collection.discount_percent;
  const location = bookOwnerLocation(collection);

  return (
    <Link
      href={`/collection/${collection.id}`}
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
        {/* Montage thumbnail */}
        <Box
          sx={{
            position: "relative",
            width: { xs: 60, md: 68 },
            height: { xs: 60, md: 68 },
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "var(--surface-muted)",
            flexShrink: 0,
          }}
        >
          {covers.length ? (
            covers.map((src, i) => (
              <Box key={i} sx={{ ...MONTAGE_CELL, ...CELL_POS[i] }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny montage tile */}
                <img
                  src={resolveMediaUrl(src)}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </Box>
            ))
          ) : (
            <Icon
              className="ph ph-stack"
              style={{
                fontSize: 24,
                color: "var(--text-muted)",
                position: "absolute",
                inset: 0,
                margin: "auto",
              }}
              aria-hidden="true"
            />
          )}
          <Box
            sx={{
              position: "absolute",
              bottom: 2,
              left: 2,
              width: 18,
              height: 18,
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon className="ph-fill ph-stack" style={{ fontSize: 11 }} aria-hidden="true" />
          </Box>
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text-primary)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {collection.title || t("untitled")}
          </Typography>
          {bundle != null && bundle !== "" && (
            <Typography
              sx={{
                mt: 0.25,
                fontSize: 13.5,
                fontWeight: 700,
                color: "var(--main-600, hsl(148, 59%, 39%))",
              }}
            >
              {formatPrice(bundle, locale)}
            </Typography>
          )}
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", mt: 0.25, flexWrap: "wrap" }}
          >
            {pct ? (
              <>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(original, locale)}
                </Typography>
                <Chip
                  size="small"
                  label={t("discount", { percent: pct })}
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor: "var(--main-50, #e6f4ea)",
                    color: "var(--main-600, #2e7d32)",
                  }}
                />
              </>
            ) : null}
          </Stack>
        </Box>

        {/* Trailing: book count + location */}
        <Stack sx={{ alignSelf: "stretch", alignItems: "flex-end", flexShrink: 0, gap: 0.75 }}>
          <Chip
            size="small"
            icon={<Icon className="ph-fill ph-books" style={{ fontSize: 12 }} />}
            label={t("itemCount", { count })}
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: "var(--surface-muted)",
              color: "var(--text-secondary)",
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
          {location && (
            <Box
              sx={{
                mt: "auto",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                maxWidth: { xs: 120, md: 150 },
                minWidth: 0,
              }}
            >
              <Icon
                className="ph-fill ph-map-pin"
                style={{
                  fontSize: 12,
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

export default CollectionRow;
