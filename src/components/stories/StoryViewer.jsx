"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, Box, IconButton, Typography, Button } from "@mui/material";
import { useRouter } from "@/i18n/navigation";
import { getStoryHref } from "@/services/stories";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import Icon from "@/components/Icon";

const STORY_DURATION_MS = 5000;
const PROGRESS_TICK_MS = 50;

/**
 * Telegram-style fullscreen story viewer.
 *
 * Props:
 *   open: boolean
 *   stories: Story[]               array shape from /services/stories.js
 *   startIndex: number             which story to open first
 *   onClose: () => void
 *
 * Controls:
 *   - Tap left half of screen      → previous story
 *   - Tap right half of screen     → next story (auto-advance also)
 *   - Press & hold anywhere        → pause progress (release to resume)
 *   - Top-right ×                  → close
 *   - Keyboard ←/→/Space/Esc       → prev / next / pause / close
 *   - Swipe down >100px            → close (touch)
 *
 * The viewer is intentionally a thin presentation layer; engagement
 * (views, reactions, replies) lives in separate hooks/endpoints when those
 * features land. Group-by-owner can be added by re-shaping `stories` before
 * passing it in — the viewer treats the array as ordered.
 */
const StoryViewer = ({ open, stories = [], startIndex = 0, onClose }) => {
  const t = useTranslations("StoryViewer");
  const router = useRouter();
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0); // 0..100 for current story
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Reset to the requested index whenever the viewer opens.
  useEffect(() => {
    if (open) {
      setIndex(startIndex);
      setProgress(0);
      setPaused(false);
    }
  }, [open, startIndex]);

  const current = stories[index];
  const total = stories.length;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i >= total - 1) {
        // Last story finished — close the viewer.
        if (typeof onClose === "function") onClose();
        return i;
      }
      return i + 1;
    });
    setProgress(0);
  }, [onClose, total]);

  // Auto-advance ticker. Each tick adds a fixed slice of progress; when it
  // crosses 100, we move to the next story (or close on the last).
  useEffect(() => {
    if (!open || paused || !current) return undefined;
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + (PROGRESS_TICK_MS / STORY_DURATION_MS) * 100;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          // Defer the index change to the next microtask so React's state
          // update queue stays consistent with the visible progress bar.
          Promise.resolve().then(goNext);
          return 100;
        }
        return next;
      });
    }, PROGRESS_TICK_MS);
    return () => clearInterval(intervalRef.current);
  }, [open, paused, current, goNext]);

  // Keyboard controls.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext, onClose]);

  const handleTapZone = (zone) => () => {
    if (zone === "left") goPrev();
    else if (zone === "right") goNext();
  };

  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches?.[0]?.clientY ?? null;
  };
  const handleTouchEnd = (e) => {
    const start = touchStartYRef.current;
    if (start == null) return;
    const end = e.changedTouches?.[0]?.clientY ?? start;
    if (end - start > 100) {
      onClose?.();
    }
    touchStartYRef.current = null;
  };

  const handleCtaClick = () => {
    const href = getStoryHref(current);
    if (href) {
      onClose?.();
      router.push(href);
    }
  };

  const targetTitle = current?.target?.title || "—";
  const targetSubtitle = current?.target?.subtitle || null;
  const targetPicture = resolveMediaUrl(current?.target?.picture);
  const ctaLabel = useMemo(() => {
    const kind = current?.target?.kind;
    if (kind === "shop") return t("openShop");
    if (kind === "book_comment") return t("openComment");
    return t("openBook");
  }, [current, t]);

  if (!current) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: "#000",
          color: "#fff",
          overflow: "hidden",
        },
      }}
    >
      <Box
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#000",
        }}
      >
        {/* Visual frame — narrow column on desktop, full width on mobile */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: { xs: "100%", md: 440 },
            height: "100%",
            maxHeight: { xs: "100%", md: "92vh" },
            bgcolor: "#111",
            overflow: "hidden",
            borderRadius: { xs: 0, md: 3 },
          }}
        >
          {/* Background image */}
          {targetPicture ? (
            // eslint-disable-next-line @next/next/no-img-element -- fullscreen story media
            <img
              src={targetPicture}
              alt={targetTitle}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.95,
              }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.4)",
                fontSize: 96,
              }}
            >
              <Icon
                className={
                  current.target.kind === "shop"
                    ? "ph-fill ph-storefront"
                    : current.target.kind === "book_comment"
                      ? "ph-fill ph-chat-circle"
                      : "ph-fill ph-book-open"
                }
                aria-hidden="true"
              />
            </Box>
          )}

          {/* Vignette so progress bars and captions stay legible on any image */}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.65) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* Progress bars */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              display: "flex",
              gap: 0.5,
              zIndex: 3,
            }}
          >
            {stories.map((_, i) => {
              const filled = i < index ? 100 : i === index ? progress : 0;
              return (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.25)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${filled}%`,
                      height: "100%",
                      bgcolor: "#fff",
                      transition: i === index ? "none" : "width 0.15s ease",
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          {/* Close button */}
          <IconButton
            onClick={onClose}
            aria-label={t("close")}
            sx={{
              position: "absolute",
              top: 24,
              right: 12,
              zIndex: 4,
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.35)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.55)" },
              width: 36,
              height: 36,
            }}
          >
            <Icon className="ph ph-x" style={{ fontSize: 18 }} aria-hidden="true" />
          </IconButton>

          {/* Pause indicator (visible while held) */}
          {paused && (
            <Box
              sx={{
                position: "absolute",
                top: 28,
                left: 16,
                zIndex: 4,
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                fontWeight: 600,
                bgcolor: "rgba(0,0,0,0.3)",
                px: 1.25,
                py: 0.25,
                borderRadius: 5,
              }}
            >
              {t("paused")}
            </Box>
          )}

          {/* Tap zones — left/right (under the chrome) */}
          <Box
            onClick={handleTapZone("left")}
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
            onMouseLeave={() => setPaused(false)}
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "35%",
              cursor: "pointer",
              zIndex: 2,
            }}
            aria-label={t("prev")}
          />
          <Box
            onClick={handleTapZone("right")}
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
            onMouseLeave={() => setPaused(false)}
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: "65%",
              cursor: "pointer",
              zIndex: 2,
            }}
            aria-label={t("next")}
          />

          {/* Caption + CTA at bottom */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              p: { xs: 2, md: 3 },
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            <Typography
              component="div"
              sx={{
                fontSize: { xs: 18, md: 20 },
                fontWeight: 700,
                color: "#fff",
                textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                lineHeight: 1.25,
                mb: targetSubtitle ? 0.5 : 1.5,
                pointerEvents: "auto",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {targetTitle}
            </Typography>
            {targetSubtitle && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                  mb: 1.5,
                  pointerEvents: "auto",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {targetSubtitle}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={handleCtaClick}
              endIcon={
                <Icon className="ph ph-arrow-right" style={{ fontSize: 16 }} aria-hidden="true" />
              }
              sx={{
                pointerEvents: "auto",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,0.95)",
                color: "#0f172a",
                "&:hover": { bgcolor: "#fff" },
                px: 3,
              }}
            >
              {ctaLabel}
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default StoryViewer;
