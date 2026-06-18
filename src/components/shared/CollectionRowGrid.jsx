"use client";

import React from "react";
import { Box } from "@mui/material";
import CollectionRow from "@/components/shared/CollectionRow";
import BookRowSkeleton from "@/components/shared/BookRowSkeleton";

/**
 * Same responsive grid as BookRowGrid (xs 1 / sm 2 / lg 3) so bundles and
 * single books break at identical points across feeds.
 */
const GRID_SX = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
  },
  gap: { xs: 1.25, md: 1.5 },
};

const CollectionRowGrid = ({
  collections = [],
  loading = false,
  skeletonCount = 3,
  emptyState = null,
}) => {
  if (loading) {
    return (
      <Box sx={GRID_SX}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <BookRowSkeleton key={`coll-skel-${i}`} />
        ))}
      </Box>
    );
  }
  if (!collections.length) return emptyState;
  return (
    <Box sx={GRID_SX}>
      {collections.map((c) => (
        <CollectionRow key={c.id} collection={c} />
      ))}
    </Box>
  );
};

export default CollectionRowGrid;
