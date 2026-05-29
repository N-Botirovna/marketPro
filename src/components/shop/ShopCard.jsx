"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Box, Stack, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from "@/utils/mediaUrl";

/**
 * Shared shop list card — used by HomeShopsRow and ShopsListPage so both
 * surfaces stay visually consistent.
 *
 * Intentionally minimal: only the five fields the catalogue actually
 * relies on (picture, name, address, working hours, book count). Star,
 * phone, type, post-service chips live on the shop detail page now —
 * cluttering the list rows hurt scanability.
 */
const ShopCard = ({ shop }) => {
  const t = useTranslations("ShopCard");

  const region = shop?.region?.name || shop?.region_name || null;
  const district = shop?.district?.name || shop?.district_name || null;
  const address = [region, district].filter(Boolean).join(" · ");
  const picture = resolveMediaUrl(shop?.picture);
  const hours = shop?.working_hours;
  const bookCount = typeof shop?.book_count === "number" ? shop.book_count : null;

  return (
    <Link
      href={`/shops/${shop.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
      aria-label={shop.name}
    >
      <Stack
        direction="row"
        spacing={1.75}
        sx={{
          alignItems: "center",
          p: { xs: 1.5, md: 1.75 },
          borderRadius: 3,
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
        {/* Picture (square, rounded). Square — not a circle — lets shop
            logos with non-symmetric crops render without being cut off. */}
        <Box
          sx={{
            width: { xs: 64, md: 72 },
            height: { xs: 64, md: 72 },
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "var(--surface-muted)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {picture ? (
            // eslint-disable-next-line @next/next/no-img-element -- fixed-size list thumbnail
            <img
              src={picture}
              alt={shop.name || ""}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <i
              className="ph-fill ph-storefront"
              style={{ fontSize: 30, color: "var(--text-muted)" }}
              aria-hidden="true"
            />
          )}
        </Box>

        {/* Right column — 4 lines, all single-line truncated so a long
            shop name or region doesn't break the row height. */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 14.5, md: 15.5 },
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {shop.name}
          </Typography>

          {address && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", mt: 0.35, color: "var(--text-secondary)", minWidth: 0 }}
            >
              <i
                className="ph ph-map-pin"
                style={{ fontSize: 12, flexShrink: 0 }}
                aria-hidden="true"
              />
              <Typography
                component="span"
                sx={{
                  fontSize: 12.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {address}
              </Typography>
            </Stack>
          )}

          {hours && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", mt: 0.25, color: "var(--text-secondary)" }}
            >
              <i
                className="ph ph-clock"
                style={{ fontSize: 12, flexShrink: 0 }}
                aria-hidden="true"
              />
              <Typography
                component="span"
                sx={{
                  fontSize: 12.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {hours}
              </Typography>
            </Stack>
          )}

          {bookCount !== null && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", mt: 0.25, color: "var(--text-muted)" }}
            >
              <i
                className="ph ph-books"
                style={{ fontSize: 12, flexShrink: 0 }}
                aria-hidden="true"
              />
              <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>
                {bookCount} {t("bookSuffix")}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Link>
  );
};

export default ShopCard;
