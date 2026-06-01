import React from "react";
import { Box, Stack } from "@mui/material";

/**
 * Loading placeholder matching `BookChatRow` (thumb + two text lines) so the
 * Telegram-style listings (home, community, shop detail) keep a stable row
 * height while data loads. Shimmer comes from the shared `.kz-skel` class.
 */
const BookRowSkeleton = () => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{ alignItems: "center", px: { xs: 1.5, md: 2 }, py: 1.25 }}
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
