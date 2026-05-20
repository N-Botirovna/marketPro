"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Stack,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import FieldError from "@/components/FieldError";

/**
 * Reusable single-banner form. Owner-facing.
 *
 * Used both as an inline-edit row inside the BannerManager and as the
 * standalone "first banner" step in SellerRegistrationModal. Stays a
 * controlled component — the parent owns the values; this component only
 * fires `onChange(patch)` deltas plus a `onPickPicture(file)` callback.
 *
 * The picture preview shows either:
 *   - the locally-picked File (via FileReader data URL), or
 *   - the persisted banner.picture URL (resolved against API origin), or
 *   - a 16:9 dotted placeholder inviting the upload tap.
 */
const BannerEditor = ({
  value, // { title, description, picture (File | null), persistedPicture? }
  onChange,
  onPickPicture,
  fieldErrors = {},
  disabled = false,
  compact = false, // tighter spacing when nested inside a list row
}) => {
  const t = useTranslations("Banner");
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onPickPicture?.(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const displaySrc = previewUrl || resolveMediaUrl(value?.persistedPicture, "") || null;

  return (
    <Stack spacing={compact ? 1.25 : 2}>
      {/* Picture picker — 16:9 cinema strip matching how the banner
          will render publicly. Click anywhere on the strip to upload. */}
      <Box
        component="button"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        sx={{
          all: "unset",
          display: "block",
          width: "100%",
          aspectRatio: "16 / 9",
          maxHeight: 280,
          borderRadius: 2,
          border: "1.5px dashed",
          borderColor: displaySrc ? "transparent" : "var(--border-subtle)",
          bgcolor: displaySrc ? "transparent" : "var(--surface-muted, #f1f5f9)",
          color: "var(--text-secondary)",
          cursor: disabled ? "not-allowed" : "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "border-color 0.15s ease, transform 0.1s ease",
          "&:hover": {
            borderColor: disabled ? undefined : "var(--main-600)",
          },
          "&:active": {
            transform: disabled ? undefined : "scale(0.997)",
          },
        }}
      >
        {displaySrc ? (
          <Box
            component="img"
            src={displaySrc}
            alt=""
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ width: "100%", height: "100%", textAlign: "center", px: 2 }}
          >
            <Box
              sx={{
                fontSize: 32,
                lineHeight: 1,
                color: "var(--text-muted)",
              }}
            >
              <i className="ph-fill ph-image-square" aria-hidden="true" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{t("bannerPicture")}</Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "var(--text-muted)",
                maxWidth: 340,
              }}
            >
              {t("bannerPicturePickHint")}
            </Typography>
          </Stack>
        )}
        {displaySrc && !disabled && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 700,
              px: 1.25,
              py: 0.5,
              backdropFilter: "blur(4px)",
            }}
          >
            <i className="ph ph-pencil-simple" aria-hidden="true" />
            {"  "}
            {t("editBanner")}
          </Box>
        )}
      </Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
        disabled={disabled}
      />
      <FieldError message={fieldErrors.picture} />

      <Box>
        <TextField
          fullWidth
          size="small"
          label={t("bannerTitle")}
          placeholder={t("bannerTitlePlaceholder")}
          value={value?.title || ""}
          onChange={(e) => onChange?.({ title: e.target.value })}
          error={!!fieldErrors.title}
          disabled={disabled}
          slotProps={{ htmlInput: { maxLength: 155 } }}
        />
        <FieldError message={fieldErrors.title} />
      </Box>

      <Box>
        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          label={t("bannerDescription")}
          placeholder={t("bannerDescriptionPlaceholder")}
          value={value?.description || ""}
          onChange={(e) => onChange?.({ description: e.target.value })}
          error={!!fieldErrors.description}
          disabled={disabled}
          slotProps={{ htmlInput: { maxLength: 400 } }}
        />
        <FieldError message={fieldErrors.description} />
      </Box>
    </Stack>
  );
};

export default BannerEditor;
