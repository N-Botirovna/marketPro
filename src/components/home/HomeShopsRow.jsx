"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Stack, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { getHomePageShops } from "@/services/shops";
import ShopCard from "@/components/shop/ShopCard";
import Icon from "@/components/Icon";

/**
 * Home-page shops row.
 *
 * Renders up to ~6 shops as a uniform grid of `ShopCard`s — the same card
 * the standalone /shops page uses so the visual contract stays consistent
 * across surfaces. Server-supplied `initialShops` skips the client fetch.
 */
const HomeShopsRow = ({ initialShops }) => {
  const t = useTranslations("HomeShopsRow");
  const hasInitial = Array.isArray(initialShops);
  const [shops, setShops] = useState(hasInitial ? initialShops : []);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    if (hasInitial) return undefined;
    let alive = true;
    getHomePageShops(6)
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
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1.5, minHeight: 32 }}>
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
            <Icon className="ph ph-caret-right" aria-hidden="true" style={{ fontSize: 14 }} />
          </Link>
        </Stack>

        {/* Grid: 1 col on mobile (full-width rows), 2 col on tablet,
            3 col on desktop. Each cell hosts one `ShopCard`. */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: { xs: 1.25, md: 1.5 },
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Box
                  key={`skel-${i}`}
                  sx={{
                    height: 96,
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
