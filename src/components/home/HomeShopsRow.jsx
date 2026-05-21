"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Stack, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { getHomePageShops } from "@/services/shops";

const ShopCard = ({ shop }) => (
  <Link
    href={`/shops/${shop.id}`}
    style={{ textDecoration: "none", color: "inherit", width: "100%" }}
    aria-label={shop.name}
  >
    {/* Card lets its grid cell control width (`width: 100%`) so the row
        stretches to fill the container — the cells expand symmetrically
        from the center as the viewport grows. */}
    <Stack
      alignItems="center"
      spacing={1}
      sx={{
        width: "100%",
        p: { xs: 1.25, md: 1.5 },
        borderRadius: 3,
        bgcolor: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "var(--shadow-elevated)",
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 64, md: 80 },
          height: { xs: 64, md: 80 },
          borderRadius: "50%",
          overflow: "hidden",
          bgcolor: "var(--surface-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {shop.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.picture}
            alt={shop.name || ""}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <i
            className="ph-fill ph-storefront"
            style={{ fontSize: 28, color: "var(--text-muted)" }}
            aria-hidden="true"
          />
        )}
      </Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-primary)",
          textAlign: "center",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {shop.name}
      </Typography>
      {(shop.star || shop.region?.name) && (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ fontSize: 11, color: "var(--text-muted)" }}
        >
          {shop.star && Number(shop.star) > 0 && (
            <>
              <i
                className="ph-fill ph-star"
                style={{ fontSize: 11, color: "#f59e0b" }}
                aria-hidden="true"
              />
              <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>
                {Number(shop.star).toFixed(1)}
              </span>
              {shop.region?.name && <span>·</span>}
            </>
          )}
          {shop.region?.name && (
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 64,
              }}
            >
              {shop.region.name}
            </span>
          )}
        </Stack>
      )}
      {typeof shop.book_count === "number" && (
        <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11 }}>
          {shop.book_count}
        </Typography>
      )}
    </Stack>
  </Link>
);

const HomeShopsRow = ({ initialShops }) => {
  const t = useTranslations("HomeShopsRow");
  // Mirror HomeBookList: trust server-supplied data when present, skip
  // the client fetch entirely. Saves a round-trip on the home page.
  const hasInitial = Array.isArray(initialShops);
  const [shops, setShops] = useState(hasInitial ? initialShops : []);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    if (hasInitial) return undefined;
    let alive = true;
    getHomePageShops(10)
      .then((res) => {
        if (alive) setShops(res.shops || []);
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
  }, [hasInitial]);

  if (!loading && shops.length === 0) return null;

  return (
    <Box sx={{ bgcolor: "var(--surface-page)", py: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* Telegram-style channel header: same spacing/pill treatment as
            HomeBookList so the home feed reads as one consistent surface. */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5, minHeight: 32 }}>
          <Typography
            component="h2"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: { xs: 17, md: 20 },
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.25,
            }}
          >
            {t("title")}
          </Typography>
          <Link
            href="/shops"
            aria-label={`${t("title")} — ${t("seeAll")}`}
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
            <i className="ph ph-caret-right" aria-hidden="true" style={{ fontSize: 14 }} />
          </Link>
        </Stack>

        {/* Responsive grid — centred, expands left/right as the viewport
            grows. With limit=10 server-side, the layout hits the natural
            2×5 cadence on lg screens and falls back gracefully:
              xs: 2×5  ·  sm: 3×4  ·  md: 4×3  ·  lg+: 5×2. */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: { xs: 1.25, md: 1.5 },
          }}
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <Box
                  key={`skel-${i}`}
                  sx={{
                    height: 150,
                    bgcolor: "var(--surface-muted)",
                    borderRadius: 3,
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
              ))
            : shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
        </Box>
      </Box>
    </Box>
  );
};

export default HomeShopsRow;
