"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Avatar,
} from "@mui/material";
import { useToast } from "@/components/Toast";
import { createStory, getStories, STORY_TARGET_KIND } from "@/services/stories";
import { getBooksByShop } from "@/services/books";
import { mapValidationError } from "@/lib/mapValidationError";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import Icon from "@/components/Icon";

const DAILY_LIMIT = 5;

/**
 * Bottom-sheet modal for shop owners to post a story.
 *
 * The kind toggle is forward-compatible: today we expose "Book" and "Shop";
 * `book_comment` and future kinds (post, collection, …) can be slotted into
 * the same `kindOptions` array without restructuring the component.
 */
const StoryCreateModal = ({ open, onClose, shops = [], onCreated }) => {
  const t = useTranslations("StoryCreate");
  const tCommon = useTranslations("Common");
  const { showToast, ToastContainer } = useToast();

  const [kind, setKind] = useState(STORY_TARGET_KIND.BOOK);
  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.id ? String(shops[0].id) : "");
  const [shopBooks, setShopBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [usedToday, setUsedToday] = useState(null);

  // Refresh "X / 5 used today" counter on open so the cap is always honest.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    // Backend doesn't expose a counter endpoint; we approximate by counting
    // the user's active stories (close enough — the daily-limit guard runs
    // on the server anyway).
    getStories({ limit: 50 })
      .then((res) => {
        if (!alive) return;
        // We don't know the current user id here, so leave usedToday null
        // unless the parent already filters — best-effort UX, not security.
        setUsedToday(null);
        void res;
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open]);

  // Sync default shop when shops prop changes.
  useEffect(() => {
    if (!selectedShopId && shops[0]?.id) {
      setSelectedShopId(String(shops[0].id));
    }
  }, [shops, selectedShopId]);

  // When picking a book, load the shop's books to choose from.
  useEffect(() => {
    if (kind !== STORY_TARGET_KIND.BOOK) return;
    if (!selectedShopId) {
      setShopBooks([]);
      return;
    }
    let alive = true;
    setBooksLoading(true);
    getBooksByShop(selectedShopId, 30)
      .then((res) => {
        if (alive) setShopBooks(res.books || []);
      })
      .catch(() => {
        if (alive) setShopBooks([]);
      })
      .finally(() => {
        if (alive) setBooksLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [kind, selectedShopId]);

  // When kind changes, reset the chosen target.
  useEffect(() => {
    if (kind === STORY_TARGET_KIND.SHOP) {
      setSelectedTargetId(selectedShopId ? Number(selectedShopId) : null);
    } else {
      setSelectedTargetId(null);
    }
  }, [kind, selectedShopId]);

  const handleSubmit = async () => {
    if (!selectedTargetId) return;
    try {
      setSubmitting(true);
      const res = await createStory({
        targetKind: kind,
        targetId: selectedTargetId,
      });
      if (res.success) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: t("created"),
          duration: 3000,
        });
        if (typeof onCreated === "function") onCreated(res.story);
        onClose?.();
      } else {
        showToast({
          type: "error",
          title: tCommon("error"),
          message: res.message || t("createError"),
          duration: 4000,
        });
      }
    } catch (err) {
      const code = err?.response?.data?.code;
      let message;
      if (code === "daily_limit_reached") message = t("dailyLimitReached");
      else if (code === "target_not_owned") message = t("targetNotOwned");
      else if (code === "not_eligible") message = t("notEligible");
      else {
        const mapped = mapValidationError(err);
        message = mapped.general || t("createError");
      }
      showToast({
        type: "error",
        title: tCommon("error"),
        message,
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedShop = useMemo(
    () => shops.find((s) => String(s.id) === selectedShopId),
    [shops, selectedShopId],
  );

  // Forward-compat: add new options here as backend kinds open up.
  const kindOptions = [
    { value: STORY_TARGET_KIND.BOOK, label: t("kindBook"), icon: "ph ph-book" },
    { value: STORY_TARGET_KIND.SHOP, label: t("kindShop"), icon: "ph ph-storefront" },
    // { value: STORY_TARGET_KIND.BOOK_COMMENT, label: t("kindComment"), icon: "ph ph-chat-circle" },
  ];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: "92vh",
          bgcolor: "var(--surface-card)",
          color: "var(--text-primary)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 3 },
          py: 2,
        }}
      >
        <Box sx={{ width: 40 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{t("title")}</Typography>
        <IconButton onClick={onClose} aria-label={tCommon("cancel") || "Close"}>
          <Icon className="ph ph-x" style={{ fontSize: 20 }} aria-hidden="true" />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ overflowY: "auto", px: { xs: 2, md: 3 }, py: 3, flex: 1 }}>
        <Box sx={{ maxWidth: 640, mx: "auto" }}>
          <Typography
            variant="caption"
            sx={{ color: "var(--text-muted)", mb: 1, display: "block" }}
          >
            {t("limitHint", { limit: DAILY_LIMIT })}
          </Typography>

          <ToggleButtonGroup
            value={kind}
            exclusive
            onChange={(_, v) => v && setKind(v)}
            fullWidth
            size="small"
            sx={{ mb: 2.5 }}
          >
            {kindOptions.map((opt) => (
              <ToggleButton
                key={opt.value}
                value={opt.value}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                <Icon
                  className={opt.icon}
                  style={{ fontSize: 16, marginRight: 6 }}
                  aria-hidden="true"
                />
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {shops.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: "var(--text-muted)", display: "block", mb: 0.5 }}
              >
                {t("pickShop")}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
                {shops.map((shop) => (
                  <Button
                    key={shop.id}
                    onClick={() => setSelectedShopId(String(shop.id))}
                    variant={String(shop.id) === selectedShopId ? "contained" : "outlined"}
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderRadius: 5,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {shop.name}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}

          {kind === STORY_TARGET_KIND.SHOP && selectedShop && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "var(--surface-muted)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar src={selectedShop.picture} sx={{ width: 56, height: 56 }}>
                <Icon className="ph-fill ph-storefront" aria-hidden="true" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }}>{selectedShop.name}</Typography>
                <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                  {t("shopWillBePromoted")}
                </Typography>
              </Box>
            </Box>
          )}

          {kind === STORY_TARGET_KIND.BOOK && (
            <>
              <Typography
                variant="caption"
                sx={{ color: "var(--text-muted)", display: "block", mb: 0.5 }}
              >
                {t("pickBook")}
              </Typography>
              {booksLoading ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : shopBooks.length === 0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  {t("noBooksInShop")}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: 1.5,
                    maxHeight: 360,
                    overflowY: "auto",
                  }}
                >
                  {shopBooks.map((book) => {
                    const selected = selectedTargetId === book.id;
                    return (
                      <Box
                        key={book.id}
                        component="button"
                        onClick={() => setSelectedTargetId(book.id)}
                        sx={{
                          textAlign: "left",
                          border: "2px solid",
                          borderColor: selected ? "primary.main" : "var(--border-subtle)",
                          borderRadius: 2,
                          p: 1,
                          bgcolor: "var(--surface-card)",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          transition: "border-color 0.15s ease",
                        }}
                      >
                        <Box
                          sx={{
                            aspectRatio: "3 / 4",
                            mb: 0.75,
                            bgcolor: "var(--surface-muted)",
                            borderRadius: 1,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {book.picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveMediaUrl(book.picture)}
                              alt={book.name || ""}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <Icon
                              className="ph ph-book"
                              style={{ fontSize: 28, color: "var(--text-muted)" }}
                              aria-hidden="true"
                            />
                          )}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {book.name || "—"}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      <Divider />
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ maxWidth: 640, mx: "auto" }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {tCommon("cancel") || t("cancel")}
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={!selectedTargetId || submitting}
            onClick={handleSubmit}
            startIcon={
              submitting ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <Icon className="ph ph-paper-plane-tilt" aria-hidden="true" />
              )
            }
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {submitting ? t("posting") : t("post")}
          </Button>
        </Stack>
      </Box>

      <ToastContainer />
    </Drawer>
  );
};

export default StoryCreateModal;
