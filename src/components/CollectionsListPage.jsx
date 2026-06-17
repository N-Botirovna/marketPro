"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Typography } from "@mui/material";
import { getCollections } from "@/services/collections";
import CollectionRowGrid from "@/components/shared/CollectionRowGrid";

export default function CollectionsListPage() {
  const t = useTranslations("CollectionCard");
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getCollections({ is_active: true, limit: 30 })
      .then((res) => alive && setCollections(res.collections || []))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Box
      component="section"
      sx={{ bgcolor: "var(--surface-page)", py: { xs: 2.5, md: 4 }, minHeight: "60vh" }}
    >
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 800, mb: 2 }}>
          {t("homeTitle")}
        </Typography>
        <CollectionRowGrid
          collections={collections}
          loading={loading}
          skeletonCount={6}
          emptyState={
            <Typography sx={{ color: "var(--text-muted)", py: 4, textAlign: "center" }}>
              {t("none")}
            </Typography>
          }
        />
      </Box>
    </Box>
  );
}
