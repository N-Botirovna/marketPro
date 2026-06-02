import React from "react";
import { Box, Stack } from "@mui/material";

/**
 * Loading placeholder matching `ShopCard` (square thumb + three text lines).
 * Used by HomeShopsRow, ShopsListPage and the legacy vendor surfaces so every
 * shop list shows the same skeleton. Shimmer comes from the shared `.kz-skel`.
 */
const ShopCardSkeleton = () => (
  <Stack
    direction="row"
    spacing={1.75}
    sx={{
      alignItems: "center",
      p: { xs: 1.5, md: 1.75 },
      borderRadius: 3,
      bgcolor: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
    }}
    aria-hidden="true"
  >
    <Box
      className="kz-skel"
      sx={{ width: { xs: 64, md: 72 }, height: { xs: 64, md: 72 }, borderRadius: 2, flexShrink: 0 }}
    />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box className="kz-skel" sx={{ height: 15, width: "55%", mb: 0.75, borderRadius: 1 }} />
      <Box className="kz-skel" sx={{ height: 12, width: "70%", mb: 0.5, borderRadius: 1 }} />
      <Box className="kz-skel" sx={{ height: 12, width: "45%", borderRadius: 1 }} />
    </Box>
  </Stack>
);

export default ShopCardSkeleton;
