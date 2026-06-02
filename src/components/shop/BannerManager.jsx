"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Chip,
  Collapse,
  Divider,
  CircularProgress,
} from "@mui/material";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { createShopBanner, updateShopBanner } from "@/services/shop";
import { useToast } from "@/components/Toast";
import Icon from "@/components/Icon";
import BannerEditor from "./BannerEditor";

/**
 * BannerManager — list + edit + add UI for a single shop's banners.
 *
 * Loads from the parent (already nested in shop detail response), then
 * delegates writes to the shop banner endpoints. Hosts an inline
 * BannerEditor in either "add" or "edit existing" mode.
 *
 * No DELETE endpoint exists on the backend yet, so "delete" is modeled
 * as a soft hide (`is_active: false`). Owners can flip it back later.
 *
 * Optimistic local state mirrors what the API will return so the parent
 * `onChange(banners)` callback keeps the surrounding shop object in sync
 * without a hard refresh.
 */
const BannerManager = ({ shopId, banners = [], onChange }) => {
  const t = useTranslations("Banner");
  const tShop = useTranslations("ShopEdit");
  const { showToast, ToastContainer } = useToast();

  const [items, setItems] = useState(banners);
  const [mode, setMode] = useState(null); // null | "add" | <bannerId>
  const [draft, setDraft] = useState({ title: "", description: "", picture: null });
  const [draftErrors, setDraftErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const updateItemsAndNotify = (next) => {
    setItems(next);
    onChange?.(next);
  };

  const startAdd = () => {
    setMode("add");
    setDraft({ title: "", description: "", picture: null });
    setDraftErrors({});
  };

  const startEdit = (banner) => {
    setMode(banner.id);
    setDraft({
      title: banner.title || "",
      description: banner.description || "",
      picture: null,
      persistedPicture: banner.picture || null,
    });
    setDraftErrors({});
  };

  const cancel = () => {
    setMode(null);
    setDraft({ title: "", description: "", picture: null });
    setDraftErrors({});
  };

  const handleSave = async () => {
    setDraftErrors({});
    if (!draft.title?.trim() && !draft.picture && !draft.persistedPicture) {
      setDraftErrors({ picture: t("bannerPicture") });
      return;
    }
    setSaving(true);
    try {
      let saved;
      if (mode === "add") {
        if (!draft.picture) {
          setDraftErrors({ picture: t("bannerPicture") });
          setSaving(false);
          return;
        }
        saved = await createShopBanner({
          shop: shopId,
          title: draft.title,
          description: draft.description,
          picture: draft.picture,
          is_active: true,
        });
        const newRow =
          saved && typeof saved === "object" && saved.id
            ? saved
            : { id: Date.now(), ...draft, is_active: true, picture: null };
        updateItemsAndNotify([...items, newRow]);
      } else {
        const bannerId = mode;
        // Only send changed fields. `picture` is only included when a new
        // file was picked — otherwise the backend keeps the existing one.
        const payload = {
          title: draft.title,
          description: draft.description,
        };
        if (draft.picture) payload.picture = draft.picture;
        saved = await updateShopBanner(bannerId, payload);
        const merged =
          saved && typeof saved === "object" && saved.id
            ? saved
            : { ...items.find((b) => b.id === bannerId), ...payload };
        updateItemsAndNotify(items.map((b) => (b.id === bannerId ? { ...b, ...merged } : b)));
      }
      showToast({
        type: "success",
        title: t("bannerSaved"),
        duration: 2200,
      });
      cancel();
    } catch (err) {
      const msg = err?.normalized?.message || err?.response?.data?.result || t("bannerSaveError");
      setDraftErrors({ general: msg });
      showToast({
        type: "error",
        title: t("bannerSaveError"),
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (banner) => {
    const next = !banner.is_active;
    try {
      await updateShopBanner(banner.id, { is_active: next });
      updateItemsAndNotify(items.map((b) => (b.id === banner.id ? { ...b, is_active: next } : b)));
    } catch {
      showToast({
        type: "error",
        title: t("bannerSaveError"),
        duration: 2500,
      });
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}
      >
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{tShop("sectionBanners")}</Typography>
          <Typography sx={{ fontSize: 12, color: "var(--text-muted)" }}>
            {tShop("sectionBannersHint")}
          </Typography>
        </Box>
        {mode !== "add" && (
          <Button
            type="button"
            variant="contained"
            size="small"
            onClick={startAdd}
            startIcon={<Icon className="ph-bold ph-plus" aria-hidden="true" />}
            sx={{ textTransform: "none", fontWeight: 700, flexShrink: 0 }}
          >
            {t("addBanner")}
          </Button>
        )}
      </Stack>

      {items.length === 0 && mode !== "add" && (
        <Box
          sx={{
            border: "1px dashed var(--border-subtle)",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: 13,
            mb: 2,
          }}
        >
          {t("noBannersYet")}
        </Box>
      )}

      <Stack spacing={1.5}>
        {items.map((banner) => {
          const isEditing = mode === banner.id;
          return (
            <Box
              key={banner.id}
              sx={{
                border: "1px solid var(--border-subtle)",
                borderRadius: 2.5,
                overflow: "hidden",
                bgcolor: "var(--surface-card)",
              }}
            >
              {/* Row header — thumbnail + title + actions */}
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 1.25 }}>
                <Box
                  sx={{
                    width: 96,
                    aspectRatio: "16 / 9",
                    borderRadius: 1.5,
                    overflow: "hidden",
                    bgcolor: "var(--surface-muted)",
                    flexShrink: 0,
                  }}
                >
                  {banner.picture ? (
                    <Box
                      component="img"
                      src={resolveMediaUrl(banner.picture)}
                      alt=""
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : null}
                </Box>
                <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.5}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {banner.title || "—"}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Chip
                      label={banner.is_active ? t("bannerActive") : t("bannerHidden")}
                      size="small"
                      color={banner.is_active ? "success" : "default"}
                      sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                    />
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleActive(banner)}
                    aria-label={banner.is_active ? t("hideBanner") : t("showBanner")}
                    title={banner.is_active ? t("hideBanner") : t("showBanner")}
                  >
                    <Icon
                      className={banner.is_active ? "ph ph-eye-slash" : "ph ph-eye"}
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => (isEditing ? cancel() : startEdit(banner))}
                    aria-label={t("editBanner")}
                    title={t("editBanner")}
                  >
                    <Icon
                      className={isEditing ? "ph ph-x" : "ph ph-pencil-simple"}
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    />
                  </IconButton>
                </Stack>
              </Stack>

              <Collapse in={isEditing} unmountOnExit>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <BannerEditor
                    value={draft}
                    onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
                    onPickPicture={(file) => setDraft((d) => ({ ...d, picture: file }))}
                    fieldErrors={draftErrors}
                    disabled={saving}
                    compact
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "flex-end" }}>
                    <Button
                      type="button"
                      onClick={cancel}
                      disabled={saving}
                      sx={{ textTransform: "none" }}
                    >
                      {tShop("cancel")}
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={14} /> : null}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {saving ? t("savingBanner") : t("saveBanner")}
                    </Button>
                  </Stack>
                </Box>
              </Collapse>
            </Box>
          );
        })}

        {/* Inline add form lives at the bottom of the list — like the
            "compose new" row in Telegram channel admin. */}
        {mode === "add" && (
          <Box
            sx={{
              border: "1px solid var(--main-600)",
              borderRadius: 2.5,
              p: 2,
              bgcolor: "var(--surface-card)",
            }}
          >
            <BannerEditor
              value={draft}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
              onPickPicture={(file) => setDraft((d) => ({ ...d, picture: file }))}
              fieldErrors={draftErrors}
              disabled={saving}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "flex-end" }}>
              <Button
                type="button"
                onClick={cancel}
                disabled={saving}
                sx={{ textTransform: "none" }}
              >
                {tShop("cancel")}
              </Button>
              <Button
                type="button"
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={14} /> : null}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                {saving ? t("savingBanner") : t("saveBanner")}
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>

      <ToastContainer />
    </Box>
  );
};

export default BannerManager;
