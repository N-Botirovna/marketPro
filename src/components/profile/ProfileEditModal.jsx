"use client";

import React from "react";
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

  const handleChange = (event) => {
    if (typeof onInputChange === "function") onInputChange(event);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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
          <i className="ph ph-x" style={{ fontSize: 20 }} />
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
          />

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
          />
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
