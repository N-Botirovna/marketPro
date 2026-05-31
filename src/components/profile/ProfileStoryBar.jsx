"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Box, Stack, Typography, ButtonBase } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import Icon from "@/components/Icon";

const StoryItem = ({ children, label, onClick, href, ariaLabel }) => {
  const content = (
    <Stack spacing={0.75} sx={{ alignItems: "center", width: 88, flexShrink: 0 }}>
      {/* Outer gradient ring — Telegram/Instagram-style. The inner white
          gap (2px) and the actual thumbnail circle are layered via box-
          shadow + a positioned child so the image can fill the available
          space without fighting a flex parent's `align-items: center`
          which previously collapsed the <img> height to 0 on some
          browsers. */}
      <Box
        sx={{
          position: "relative",
          width: { xs: 72, md: 88 },
          height: { xs: 72, md: 88 },
          borderRadius: "50%",
          padding: "3px",
          background: "linear-gradient(135deg, var(--main-500, #fa6400), var(--main-700, #d65300))",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "3px",
            borderRadius: "50%",
            overflow: "hidden",
            bgcolor: "var(--surface-card)",
            boxShadow: "inset 0 0 0 2px var(--surface-card)",
          }}
        >
          {children}
        </Box>
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontSize: 11,
          color: "text.secondary",
          maxWidth: 88,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel || label}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {content}
      </Link>
    );
  }

  return (
    <ButtonBase onClick={onClick} aria-label={ariaLabel || label} sx={{ borderRadius: 2 }}>
      {content}
    </ButtonBase>
  );
};

/**
 * Children render into a `position: absolute; inset: 0` slot inside the
 * StoryItem ring. Using absolute positioning guarantees the thumbnail
 * fills the circle even when the parent is a flex container — earlier
 * `width: 100%; height: 100%;` on the img collapsed to 0×0 in some
 * browsers because of how align-items: center sizes flex children.
 */
const AddCircle = () => (
  <Box
    sx={{
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "grey.100",
      color: "primary.main",
      fontSize: 28,
    }}
  >
    <Icon className="ph ph-plus" aria-hidden="true" />
  </Box>
);

const ThumbCircle = ({ src, alt, fallbackIcon }) => {
  // resolveMediaUrl returns "" when its input is empty — treat both
  // null/undefined and the empty string as "no image" so the fallback
  // icon actually renders instead of a broken <img>.
  const hasSrc = typeof src === "string" && src.trim() !== "";
  // If the API serves a stale/404 URL, flip to the declarative icon
  // fallback below instead of showing the browser's broken-image glyph.
  const [failed, setFailed] = React.useState(false);

  if (hasSrc && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- circle thumbnails, sizes fixed; <Image> with fill would need a wrapper per cell
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        color: "text.disabled",
        fontSize: 28,
      }}
    >
      <Icon className={fallbackIcon} aria-hidden="true" />
    </Box>
  );
};

const ProfileStoryBar = ({ books = [], shops = [], onAddBookClick }) => {
  const t = useTranslations("ProfileDashboard");

  const visibleBooks = books.slice(0, 10);

  return (
    <Box
      sx={{
        bgcolor: "var(--surface-card)",
        color: "var(--text-primary)",
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          pb: 1,
          mx: { xs: -2, md: -3 },
          px: { xs: 2, md: 3 },
          "& > *": { scrollSnapAlign: "start" },
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "grey.300",
            borderRadius: 2,
          },
        }}
      >
        <StoryItem onClick={onAddBookClick} label={t("storyAddNew")} ariaLabel={t("addBook")}>
          <AddCircle />
        </StoryItem>

        {visibleBooks.map((book) => (
          <StoryItem
            key={`book-${book.id}`}
            href={`/book-details/${book.id}`}
            label={book.name || book.title || t("storyBook")}
            ariaLabel={book.name || t("storyBook")}
          >
            <ThumbCircle
              src={resolveMediaUrl(book.picture || book.image)}
              alt={book.name || ""}
              fallbackIcon="ph ph-book-open"
            />
          </StoryItem>
        ))}

        {shops.map((shop) => (
          <StoryItem
            key={`shop-${shop.id}`}
            href={`/shops/${shop.id}`}
            label={shop.name || t("storyShop")}
            ariaLabel={shop.name || t("storyShop")}
          >
            <ThumbCircle
              src={resolveMediaUrl(shop.picture || shop.logo)}
              alt={shop.name || ""}
              fallbackIcon="ph ph-storefront"
            />
          </StoryItem>
        ))}

        {visibleBooks.length === 0 && shops.length === 0 && (
          <Box sx={{ pl: 1, alignSelf: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {t("storyEmpty")}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default ProfileStoryBar;
