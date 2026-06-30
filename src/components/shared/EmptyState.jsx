import React from "react";
import { Box, Typography } from "@mui/material";
import Icon from "@/components/Icon";

/**
 * Shared empty / error placeholder — one calm, consistent pattern across the
 * book detail, browse list, profile tabs and wishlist. A round muted icon
 * badge, a title, an optional description, and optional actions (children,
 * e.g. a CTA button) rendered in a centered row.
 *
 * Props:
 * - icon        Phosphor glyph class (default "ph ph-book-open")
 * - title       primary line (string|node)
 * - description optional secondary line
 * - dashed      dashed border frame (used for "no results" inside a grid)
 * - children    optional actions row (buttons/links)
 * - sx          extra styles merged onto the wrapper
 */
const EmptyState = ({
  icon = "ph ph-book-open",
  title,
  description,
  dashed = false,
  children,
  sx,
}) => (
  <Box
    sx={{
      py: { xs: 6, md: 8 },
      px: 2,
      textAlign: "center",
      border: dashed ? "1px dashed var(--border-subtle)" : "none",
      borderRadius: "var(--radius-lg, 16px)",
      ...sx,
    }}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        mx: "auto",
        mb: 2,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "var(--surface-muted)",
        color: "var(--text-muted)",
      }}
    >
      <Icon className={icon} style={{ fontSize: 30 }} aria-hidden="true" />
    </Box>
    {title ? (
      <Typography sx={{ fontWeight: 600, color: "var(--text-primary)", mb: description ? 0.5 : 0 }}>
        {title}
      </Typography>
    ) : null}
    {description ? (
      <Typography sx={{ fontSize: 14, color: "var(--text-muted)" }}>{description}</Typography>
    ) : null}
    {children ? (
      <Box sx={{ mt: 2.5, display: "flex", justifyContent: "center", gap: 1.5, flexWrap: "wrap" }}>
        {children}
      </Box>
    ) : null}
  </Box>
);

export default EmptyState;
