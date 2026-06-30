"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box } from "@mui/material";
import { getCollections } from "@/services/collections";
import CollectionRowGrid from "@/components/shared/CollectionRowGrid";
import SectionHeader from "@/components/shared/SectionHeader";

/**
 * Home "Collections / bundles" row — same channel-header + responsive grid as
 * HomeBookList, but for bundles. Self-fetches (collections are a small set)
 * and hides when empty so data-light deploys stay tight.
 */
const HomeCollectionsRow = ({ limit = 6 }) => {
  const t = useTranslations("CollectionCard");
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getCollections({ is_active: true, limit })
      .then((res) => {
        if (alive) setCollections(res.collections || []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [limit]);

  if (!loading && collections.length === 0) return null;

  return (
    <Box component="section" sx={{ bgcolor: "var(--surface-page)", py: { xs: 2.5, md: 4 } }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <SectionHeader title={t("homeTitle")} href="/collections" seeAllLabel={t("seeAll")} />
        <CollectionRowGrid collections={collections} loading={loading} skeletonCount={limit} />
      </Box>
    </Box>
  );
};

export default HomeCollectionsRow;
