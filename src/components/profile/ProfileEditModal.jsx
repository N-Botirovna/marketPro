"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  MenuItem,
  Divider,
} from "@mui/material";
import FieldError from "@/components/FieldError";
import { isBlank, tooLong, isPhoneE164 } from "@/lib/validation";
import Icon from "@/components/Icon";

const FieldGroup = ({ children }) => <Stack spacing={1.75}>{children}</Stack>;

const ProfileEditModal = ({
  open,
  onClose,
  profileFormData,
  onInputChange,
  regions = [],
  regionsLoading = false,
  districtOptions = [],
  hasChanges = false,
  saving = false,
  onSave,
}) => {
  const t = useTranslations("ProfileDashboard");
  const tLocation = useTranslations("Location");
  const tProfileForm = useTranslations("ProfileForm");
  const tv = useTranslations("Validation");
  const [fieldErrors, setFieldErrors] = useState({});

  // Mirror of UserUpdate serializer: app_phone_number E.164 (optional, full
  // number with +), bio max 255. Returns a localized message or null.
  const validateProfileField = (name, value) => {
    switch (name) {
      case "app_phone_number":
        if (isBlank(value)) return null; // optional
        return isPhoneE164(value) ? null : tv("phoneInvalid");
      case "bio":
        return tooLong(value, 255) ? tv("maxLength", { max: 255 }) : null;
      default:
        return null;
    }
  };

  const handleChange = (event) => {
    if (typeof onInputChange === "function") onInputChange(event);
    const { name, value } = event.target;
    setFieldErrors((prev) => ({ ...prev, [name]: validateProfileField(name, value) || undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const blocking = {};
    ["app_phone_number", "bio"].forEach((f) => {
      const msg = validateProfileField(f, profileFormData?.[f] || "");
      if (msg) blocking[f] = msg;
    });
    if (Object.keys(blocking).length > 0) {
      setFieldErrors(blocking);
      return;
    }
    if (!saving && hasChanges && typeof onSave === "function") {
      onSave();
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: false }}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
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
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: 40 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{t("editProfile")}</Typography>
        <IconButton
          onClick={onClose}
          aria-label={t("cancel")}
          size="small"
          sx={{ width: 40, height: 40 }}
        >
          <Icon className="ph ph-x" style={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <Divider />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          overflowY: "auto",
          px: { xs: 2, md: 3 },
          py: 3,
          flex: 1,
          maxWidth: 640,
          mx: "auto",
          width: "100%",
        }}
      >
        <FieldGroup>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75}>
            <TextField
              fullWidth
              label={tProfileForm("firstName")}
              name="first_name"
              value={profileFormData?.first_name || ""}
              onChange={handleChange}
              size="small"
              autoComplete="given-name"
            />
            <TextField
              fullWidth
              label={tProfileForm("lastName")}
              name="last_name"
              value={profileFormData?.last_name || ""}
              onChange={handleChange}
              size="small"
              autoComplete="family-name"
            />
          </Stack>

          <Box>
            <TextField
              fullWidth
              label={t("phone")}
              name="app_phone_number"
              type="tel"
              value={profileFormData?.app_phone_number || ""}
              onChange={handleChange}
              placeholder={t("phonePlaceholder")}
              size="small"
              autoComplete="tel"
              error={!!fieldErrors.app_phone_number}
            />
            <FieldError message={fieldErrors.app_phone_number} />
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75}>
            <TextField
              fullWidth
              select
              label={t("region")}
              name="region"
              value={profileFormData?.region || ""}
              onChange={handleChange}
              disabled={regionsLoading}
              size="small"
            >
              <MenuItem value="">
                {regionsLoading ? t("loadingData") : tLocation("selectRegion")}
              </MenuItem>
              {regions.map((region) => (
                <MenuItem key={region.id} value={String(region.id)}>
                  {region.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label={t("district")}
              name="district"
              value={profileFormData?.district || ""}
              onChange={handleChange}
              disabled={!profileFormData?.region || districtOptions.length === 0}
              size="small"
            >
              <MenuItem value="">
                {!profileFormData?.region
                  ? tLocation("selectRegion")
                  : districtOptions.length === 0
                    ? tLocation("noDistricts")
                    : tLocation("selectDistrict")}
              </MenuItem>
              {districtOptions.map((district) => (
                <MenuItem key={district.id} value={String(district.id)}>
                  {district.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            fullWidth
            label={t("location")}
            name="location_text"
            value={profileFormData?.location_text || ""}
            onChange={handleChange}
            placeholder={tProfileForm("enterFullAddress")}
            size="small"
          />

          <Box>
            <TextField
              fullWidth
              label={t("bioTitle")}
              name="bio"
              value={profileFormData?.bio || ""}
              onChange={handleChange}
              placeholder={t("bioEmpty")}
              size="small"
              multiline
              minRows={3}
              maxRows={6}
              error={!!fieldErrors.bio}
            />
            <FieldError message={fieldErrors.bio} />
          </Box>
        </FieldGroup>
      </Box>

      <Divider />
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          flexShrink: 0,
          bgcolor: "background.paper",
          maxWidth: 640,
          mx: "auto",
          width: "100%",
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: 2, textTransform: "none", py: 1 }}
          >
            {t("cancel")}
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={!hasChanges || saving}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              py: 1,
              fontWeight: 600,
            }}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : null}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default ProfileEditModal;
