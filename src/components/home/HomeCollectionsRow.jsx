"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Stack, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { getCollections } from "@/services/collections";
import CollectionRowGrid from "@/components/shared/CollectionRowGrid";
import Icon from "@/components/Icon";

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
    <Box component="section" sx={{ bgcolor: "var(--surface-page)", py: { xs: 2, md: 2.75 } }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1.5, minHeight: 32 }}>
          <Typography
            component="h2"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: { xs: 16, md: 18 },
              fontWeight: 700,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {t("homeTitle")}
          </Typography>
          <Link
            href="/collections"
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
            }}
          >
            {t("seeAll")}
            <Icon className="ph ph-caret-right" aria-hidden="true" style={{ fontSize: 14 }} />
          </Link>
        </Stack>
        <CollectionRowGrid collections={collections} loading={loading} skeletonCount={limit} />
      </Box>
    </Box>
  );
};

export default HomeCollectionsRow;
