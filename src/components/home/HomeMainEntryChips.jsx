import React from "react";
import { getTranslations } from "next-intl/server";
import { Box, Stack, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";

const EntryCard = ({ href, icon, title, caption }) => (
  <Link href={href} style={{ textDecoration: "none", color: "inherit", flex: 1, minWidth: 0 }}>
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        bgcolor: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "var(--shadow-elevated)",
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "var(--main-600, hsl(148, 59%, 39%))",
          color: "#fff",
          fontSize: 22,
        }}
      >
        <i className={icon} aria-hidden="true" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: 14, md: 15 },
            fontWeight: 700,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {caption}
        </Typography>
      </Box>
      <i
        className="ph ph-caret-right"
        style={{ fontSize: 16, color: "var(--text-muted)", flexShrink: 0 }}
        aria-hidden="true"
      />
    </Stack>
  </Link>
);

// Async server component — the parent (home page.jsx) is already server
// async, so awaiting the locale translations here adds zero round-trips.
const HomeMainEntryChips = async () => {
  const t = await getTranslations("HomeMainEntryChips");

  return (
    <Box sx={{ bgcolor: "var(--surface-page)", py: { xs: 2, md: 2.5 } }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <EntryCard
            href="/shops"
            icon="ph-fill ph-storefront"
            title={t("shops")}
            caption={t("shopsCaption")}
          />
          <EntryCard
            href="/community/all"
            icon="ph-fill ph-users-three"
            title={t("community")}
            caption={t("communityCaption")}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default HomeMainEntryChips;
