"use client";

import React, { useState } from "react";
import { Box, Dialog, IconButton } from "@mui/material";
import { useTranslations } from "next-intl";
import Icon from "@/components/Icon";
import LocationMap from "@/components/shared/LocationMap";

/**
 * Compact, tap-to-expand shop location.
 *
 *   • Collapsed: a small NON-interactive map preview that never grabs the
 *     page's scroll/zoom gestures (the previous always-on interactive inline
 *     map made scrolling past it awkward).
 *   • Expanded: tapping opens a dialog with the full interactive map — drag +
 *     proper zoom buttons + wheel zoom — where zooming is actually comfortable.
 *
 * Leaflet touches `window`, so consumers MUST load this with
 * `dynamic(() => import(...), { ssr: false })`.
 */
const ShopLocationCard = ({ point }) => {
  const t = useTranslations("ShopLocation");
  const [open, setOpen] = useState(false);

  if (!point || typeof point.latitude !== "number" || typeof point.longitude !== "number") {
    return null;
  }

  const openDialog = () => setOpen(true);

  return (
    <>
      {/* Preview. The inner map has all gestures disabled; an overlay sits on
          top so the whole tile is one clickable target (and the map can't
          intercept the click). */}
      <Box
        role="button"
        tabIndex={0}
        aria-label={t("openMap")}
        onClick={openDialog}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDialog();
          }
        }}
        sx={{
          position: "relative",
          cursor: "pointer",
          borderRadius: 2,
          overflow: "hidden",
          "&:focus-visible": { outline: "2px solid var(--main-600, hsl(148,59%,39%))" },
        }}
      >
        <Box sx={{ pointerEvents: "none" }}>
          <LocationMap point={point} height={140} zoom={15} interactive={false} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            p: 1,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "var(--surface-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 999,
              px: 1.25,
              py: 0.5,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <Icon className="ph ph-arrows-out" style={{ fontSize: 14 }} aria-hidden="true" />
            {t("openMap")}
          </Box>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setOpen(false)}
            aria-label={t("close")}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1200,
              bgcolor: "var(--surface-card)",
              border: "1px solid var(--border-subtle)",
              "&:hover": { bgcolor: "var(--surface-muted)" },
            }}
          >
            <Icon className="ph ph-x" />
          </IconButton>
          <LocationMap point={point} height={{ xs: 380, md: 520 }} zoom={16} interactive />
        </Box>
      </Dialog>
    </>
  );
};

export default ShopLocationCard;
