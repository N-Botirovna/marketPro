"use client";

import React, { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Avatar,
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Icon from "@/components/Icon";

const StatCell = ({ value, label }) => (
  <Box sx={{ flex: 1, py: 1.5, textAlign: "center" }}>
    <Typography
      component="div"
      sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700, lineHeight: 1.2 }}
    >
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const ProfileHero = ({
  user,
  stats,
  avatarUploading = false,
  onAvatarChange,
  onEditClick,
  onShareClick,
  locationLine,
  roleLabel,
}) => {
  const t = useTranslations("ProfileDashboard");
  const fileInputRef = useRef(null);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || t("user");
  const phone = user?.app_phone_number || user?.phone_number || "";
  const initial = fullName.trim().charAt(0).toUpperCase() || "?";

  const handleFileSelect = (event) => {
    if (typeof onAvatarChange === "function") onAvatarChange(event);
  };

  return (
    <Box
      sx={{
        bgcolor: "var(--surface-card)",
        color: "var(--text-primary)",
        borderRadius: 3,
        p: { xs: 2.5, md: 4 },
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar
            src={user?.picture || undefined}
            alt={fullName}
            sx={{
              width: { xs: 100, md: 140 },
              height: { xs: 100, md: 140 },
              fontSize: { xs: 36, md: 48 },
              bgcolor: "primary.light",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {initial}
          </Avatar>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            aria-label={t("cameraButton")}
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 36,
              height: 36,
              bgcolor: "primary.main",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": { bgcolor: "grey.400", color: "#fff" },
            }}
          >
            {avatarUploading ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              <Icon className="ph ph-camera" style={{ fontSize: 18 }} />
            )}
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileSelect}
          />
        </Box>

        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 20, md: 24 },
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            {fullName}
          </Typography>
          {phone && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {phone}
            </Typography>
          )}
          {(locationLine || roleLabel) && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: "center", flexWrap: "wrap", mt: 1, rowGap: 1 }}
            >
              {locationLine && (
                <Chip
                  size="small"
                  icon={
                    <Icon className="ph ph-map-pin" style={{ fontSize: 14, color: "inherit" }} />
                  }
                  label={locationLine}
                  sx={{
                    bgcolor: "var(--surface-muted)",
                    color: "var(--text-secondary)",
                    height: 24,
                  }}
                />
              )}
              {roleLabel && (
                <Chip
                  size="small"
                  label={roleLabel}
                  color="primary"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
            </Stack>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexWrap: "wrap", justifyContent: "center", rowGap: 1 }}
        >
          <Button
            variant="contained"
            onClick={onEditClick}
            startIcon={<Icon className="ph ph-pencil-simple" style={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              fontWeight: 600,
            }}
          >
            {t("editProfile")}
          </Button>
          <Button
            variant="outlined"
            onClick={onShareClick}
            startIcon={<Icon className="ph ph-share-network" style={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              fontWeight: 600,
            }}
          >
            {t("share")}
          </Button>
        </Stack>

        <Stack
          direction="row"
          divider={
            <Box sx={{ width: "1px", bgcolor: "var(--border-strong)", alignSelf: "stretch" }} />
          }
          sx={{
            width: "100%",
            mt: 2,
            bgcolor: "var(--surface-muted)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <StatCell value={stats?.books ?? 0} label={t("statsBooks")} />
          <StatCell value={stats?.archive ?? 0} label={t("statsArchive")} />
          <StatCell value={stats?.shops ?? 0} label={t("statsShops")} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProfileHero;
