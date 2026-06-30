import React from "react";
import { Stack, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";

/**
 * Shared section header for the home feed and other list surfaces: a title on
 * the left, an optional "see all →" pill link on the right. Single source of
 * truth so every section shares one rhythm, sizing, and hover/focus treatment
 * (this markup was previously duplicated ~6× with inline JS hover handlers
 * mutating `style`). Hover + keyboard focus now live in CSS (`.kz-see-all` in
 * globals.scss), which is cheaper and gives a consistent micro-interaction.
 *
 * Props:
 * - title       section title (string)
 * - href        optional "see all" target (next-intl Link)
 * - seeAllLabel label for the see-all link (required when `href` is set)
 * - as          heading level/tag (default "h2")
 * - size        "md" (16/19px) default | "lg" (18/22px) for top-level rows
 */
const SectionHeader = ({ title, href, seeAllLabel, as = "h2", size = "md" }) => {
  const fontSize = size === "lg" ? { xs: 18, md: 22 } : { xs: 16, md: 19 };

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2, minHeight: 32 }}>
      <Typography
        component={as}
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      {href && seeAllLabel ? (
        <Link href={href} className="kz-see-all" aria-label={`${title} — ${seeAllLabel}`}>
          {seeAllLabel}
          <Icon className="ph ph-caret-right" aria-hidden="true" />
        </Link>
      ) : null}
    </Stack>
  );
};

export default SectionHeader;
