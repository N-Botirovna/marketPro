import React from "react";
import { Box, Stack } from "@mui/material";

/**
 * Loading placeholder matching the `BookChatRow` card. Mirrors the live card's
 * chrome AND its line count (title, author, price, location) + top alignment,
 * so the cell doesn't jump or resize when real data swaps in. Shimmer comes
 * from the shared `.kz-skel` class.
 */
const BookRowSkeleton = () => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{
      height: "100%",
      alignItems: "flex-start",
      px: { xs: 1.5, md: 1.75 },
      py: 1.5,
      borderRadius: 2.5,
      bgcolor: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
    }}
    aria-hidden="true"
  >
    <Box
      className="kz-skel"
      sx={{ width: { xs: 56, md: 64 }, height: { xs: 56, md: 64 }, borderRadius: 2, flexShrink: 0 }}
    />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box className="kz-skel" sx={{ height: 13, width: "80%", mb: 0.75, borderRadius: 1 }} />
      <Box className="kz-skel" sx={{ height: 11, width: "45%", mb: 0.75, borderRadius: 1 }} />
      <Box className="kz-skel" sx={{ height: 12, width: "30%", mb: 0.75, borderRadius: 1 }} />
      <Box className="kz-skel" sx={{ height: 11, width: "55%", borderRadius: 1 }} />
    </Box>
  </Stack>
);

export default BookRowSkeleton;
