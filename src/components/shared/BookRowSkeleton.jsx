import React from "react";
import { Box, Stack } from "@mui/material";

/**
 * Loading placeholder matching the `BookChatRow` card (same chrome: thumb +
 * two text lines inside a bordered card) so the feed/browse grids keep a
 * stable cell height while data loads. Shimmer comes from the shared
 * `.kz-skel` class.
 */
const BookRowSkeleton = () => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{
      height: "100%",
      alignItems: "center",
      px: { xs: 1.5, md: 1.75 },
      py: 1.25,
      borderRadius: 2.5,
      bgcolor: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
    }}
    aria-hidden="true"
  >
    <Box
      className="kz-skel"
      sx={{ width: { xs: 52, md: 60 }, height: { xs: 52, md: 60 }, borderRadius: 2, flexShrink: 0 }}
    />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box className="kz-skel" sx={{ height: 13, width: "55%", mb: 0.75, borderRadius: 1 }} />
      <Box className="kz-skel" sx={{ height: 11, width: "38%", borderRadius: 1 }} />
    </Box>
  </Stack>
);

export default BookRowSkeleton;
