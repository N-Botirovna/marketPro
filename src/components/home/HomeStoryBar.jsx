"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { getStories } from "@/services/stories";
import StoryViewer from "@/components/stories/StoryViewer";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import Icon from "@/components/Icon";

/**
 * Telegram-style story bar.
 *
 * Renders active stories (shop-owner promos for now; the backend `policy.py`
 * decides who may post). Each circle navigates to whatever the underlying
 * `target.kind` points at — book detail, shop detail, comment's book, …
 *
 * The component degrades silently to an empty render when there are no
 * stories; we deliberately do NOT fall back to "latest books" any more, so
 * the bar is a true Telegram-style promo channel rather than a sneaky list.
 */

const StoryCircle = ({ story, onClick }) => {
  const target = story.target || {};
  const title = target.title || "—";
  const picture = resolveMediaUrl(target.picture);
  const kind = target.kind;

  const kindIcon = (() => {
    if (kind === "shop") return "ph-fill ph-storefront";
    if (kind === "book_comment") return "ph-fill ph-chat-circle";
    return "ph-fill ph-book-open";
  })();

  return (
    <ButtonBase
      onClick={onClick}
      aria-label={title}
      sx={{
        borderRadius: 10,
        textAlign: "center",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <Stack spacing={0.75} sx={{ alignItems: "center", width: 80, flexShrink: 0 }}>
        <Box
          sx={{
            width: { xs: 64, md: 80 },
            height: { xs: 64, md: 80 },
            borderRadius: "50%",
            padding: "3px",
            background: "linear-gradient(135deg, hsl(148, 59%, 49%), hsl(148, 59%, 31%))",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid var(--surface-card)",
              bgcolor: "var(--surface-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {picture ? (
              // eslint-disable-next-line @next/next/no-img-element -- fixed-size circle thumb
              <img
                src={picture}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Icon
                className={kindIcon}
                style={{ fontSize: 24, color: "var(--text-muted)" }}
                aria-hidden="true"
              />
            )}
          </Box>
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: 11,
            color: "var(--text-secondary)",
            maxWidth: 80,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {title}
        </Typography>
      </Stack>
    </ButtonBase>
  );
};

const HomeStoryBar = ({ initialStories }) => {
  const t = useTranslations("HomeStoryBar");
  // Server-rendered home seeds this with the latest stories so the first
  // paint already shows the circles; an empty array (`length === 0`) also
  // counts as "the server checked and there's nothing", so we skip the
  // client fallback in that case too.
  const hasInitial = Array.isArray(initialStories);
  const [stories, setStories] = useState(hasInitial ? initialStories : []);
  const [loading, setLoading] = useState(!hasInitial);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStart, setViewerStart] = useState(0);

  useEffect(() => {
    if (hasInitial) return undefined;
    let alive = true;
    getStories({ limit: 24 })
      .then((res) => {
        if (alive) setStories(res.stories || []);
      })
      .catch(() => {
        /* non-critical — empty render is fine */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [hasInitial]);

  const handleOpenAt = (idx) => () => {
    setViewerStart(idx);
    setViewerOpen(true);
  };

  if (!loading && stories.length === 0) return null;

  return (
    <Box
      sx={{
        bgcolor: "var(--surface-page)",
        pt: { xs: 1, md: 2 },
        pb: { xs: 1.5, md: 2 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1240,
          mx: "auto",
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 14, md: 15 },
            fontWeight: 600,
            color: "var(--text-secondary)",
            mb: 1,
            letterSpacing: 0.2,
            textTransform: "uppercase",
          }}
        >
          {t("title")}
        </Typography>
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
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Box
                  key={`skel-${i}`}
                  sx={{
                    width: { xs: 64, md: 80 },
                    height: { xs: 64, md: 80 },
                    borderRadius: "50%",
                    bgcolor: "var(--surface-muted)",
                    flexShrink: 0,
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
              ))
            : stories.map((story, idx) => (
                <StoryCircle key={story.id} story={story} onClick={handleOpenAt(idx)} />
              ))}
        </Stack>
      </Box>

      <StoryViewer
        open={viewerOpen}
        stories={stories}
        startIndex={viewerStart}
        onClose={() => setViewerOpen(false)}
      />
    </Box>
  );
};

export default HomeStoryBar;
