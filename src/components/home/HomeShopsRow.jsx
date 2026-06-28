"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box } from "@mui/material";
import { getHomePageShops } from "@/services/shops";
import ShopCard from "@/components/shop/ShopCard";
import ShopCardSkeleton from "@/components/shared/ShopCardSkeleton";
import SectionHeader from "@/components/shared/SectionHeader";

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
    <Box sx={{ bgcolor: "var(--surface-page)", py: { xs: 2.5, md: 4 } }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <SectionHeader title={t("title")} href="/shops" seeAllLabel={t("seeAll")} size="lg" />

        {/* Grid: 1 col on mobile (full-width rows), 2 col on tablet,
            3 col on desktop. Each cell hosts one `ShopCard`. */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 1.25, md: 1.5 },
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ShopCardSkeleton key={`skel-${i}`} />)
            : shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
        </Box>
      </Box>
    </Box>
  );
};

export default HomeShopsRow;
