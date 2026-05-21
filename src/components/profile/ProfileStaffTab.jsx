"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
} from "@mui/material";
import Spin from "@/components/Spin";
import { useToast } from "@/components/Toast";
import { listStaff, addStaff, removeStaff } from "@/services/shopStaff";
import { mapValidationError } from "@/lib/mapValidationError";

const ProfileStaffTab = ({ shops = [] }) => {
  const t = useTranslations("ProfileDashboard");
  const tStaff = useTranslations("ProfileStaff");
  const tCommon = useTranslations("Common");
  const { showToast, ToastContainer } = useToast();

  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.id ? String(shops[0].id) : "");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!shops.length) return;
    if (!selectedShopId || !shops.some((s) => String(s.id) === selectedShopId)) {
      setSelectedShopId(String(shops[0].id));
    }
  }, [shops, selectedShopId]);

  const fetchStaff = useCallback(
    async (shopId) => {
      if (!shopId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await listStaff({ shopId });
        setStaff(res.staff || []);
      } catch (err) {
        setError(err?.normalized?.message || err?.message || tStaff("loadError"));
      } finally {
        setLoading(false);
      }
    },
    [tStaff],
  );

  useEffect(() => {
    if (selectedShopId) {
      fetchStaff(selectedShopId);
    } else {
      setStaff([]);
    }
  }, [selectedShopId, fetchStaff]);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!selectedShopId || !phone.trim() || adding) return;

    try {
      setAdding(true);
      await addStaff({
        shopId: Number(selectedShopId),
        phoneNumber: phone.trim(),
      });
      showToast({
        type: "success",
        title: tCommon("success"),
        message: tStaff("addedSuccess"),
        duration: 3000,
      });
      setPhone("");
      await fetchStaff(selectedShopId);
    } catch (err) {
      const mapped = mapValidationError(err);
      showToast({
        type: "error",
        title: tCommon("error"),
        message: mapped.fields?.phone_number || mapped.general || tStaff("addError"),
        duration: 4000,
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (entry) => {
    if (!window.confirm(tStaff("removeConfirm", { name: entry.user_name || "" }))) {
      return;
    }
    try {
      setRemovingId(entry.id);
      await removeStaff(entry.id);
      showToast({
        type: "success",
        title: tCommon("success"),
        message: tStaff("removedSuccess"),
        duration: 3000,
      });
      await fetchStaff(selectedShopId);
    } catch (err) {
      const mapped = mapValidationError(err);
      showToast({
        type: "error",
        title: tCommon("error"),
        message: mapped.general || tStaff("removeError"),
        duration: 4000,
      });
    } finally {
      setRemovingId(null);
    }
  };

  const selectedShop = useMemo(
    () => shops.find((s) => String(s.id) === selectedShopId),
    [shops, selectedShopId],
  );

  if (!shops.length) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            color: "var(--text-muted)",
          }}
        >
          <i
            className="ph ph-storefront"
            style={{ fontSize: 48, display: "inline-block", marginBottom: 12 }}
            aria-hidden="true"
          />
          <Typography sx={{ fontWeight: 600, color: "var(--text-secondary)" }}>
            {tStaff("noShopsTitle")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {tStaff("noShopsSubtitle")}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
          {tStaff("title")}
        </Typography>
        {selectedShop && (
          <Box
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              fontSize: 12,
              fontWeight: 600,
              bgcolor: "var(--surface-muted)",
              color: "var(--text-secondary)",
              borderRadius: 5,
            }}
          >
            {selectedShop.name}
          </Box>
        )}
      </Stack>

      {shops.length > 1 && (
        <TextField
          fullWidth
          select
          size="small"
          label={tStaff("shopSelector")}
          value={selectedShopId}
          onChange={(e) => setSelectedShopId(e.target.value)}
          sx={{ mb: 2.5 }}
        >
          {shops.map((shop) => (
            <MenuItem key={shop.id} value={String(shop.id)}>
              {shop.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      <Box
        component="form"
        onSubmit={handleAdd}
        sx={{
          display: "flex",
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "flex-start" },
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: "var(--surface-muted)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <TextField
          fullWidth
          size="small"
          type="tel"
          label={tStaff("phoneLabel")}
          placeholder="+998 9X XXX XX XX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          sx={{ flex: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!phone.trim() || adding || !selectedShopId}
          startIcon={
            adding ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : (
              <i className="ph ph-plus" aria-hidden="true" />
            )
          }
          sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
        >
          {adding ? tStaff("adding") : tStaff("addBtn")}
        </Button>
      </Box>

      {loading && (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Spin text={tStaff("loading")} />
        </Box>
      )}

      {!loading && error && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "var(--surface-muted)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
            textAlign: "center",
          }}
        >
          {error}
        </Box>
      )}

      {!loading && !error && staff.length === 0 && (
        <Box sx={{ py: 4, textAlign: "center", color: "var(--text-muted)" }}>
          <i
            className="ph ph-users-three"
            style={{ fontSize: 40, display: "inline-block", marginBottom: 8 }}
            aria-hidden="true"
          />
          <Typography>{tStaff("emptyTitle")}</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {tStaff("emptySubtitle")}
          </Typography>
        </Box>
      )}

      {!loading && !error && staff.length > 0 && (
        <Stack
          divider={<Divider flexItem />}
          sx={{
            bgcolor: "var(--surface-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {staff.map((entry) => (
            <Stack
              key={entry.id}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ px: 2, py: 1.5 }}
            >
              <Avatar sx={{ bgcolor: "primary.light", width: 40, height: 40 }}>
                {(entry.user_name || "?").trim().charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.user_name || tStaff("unknownUser")}
                </Typography>
                <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                  ID: {entry.user}
                </Typography>
              </Box>
              <IconButton
                onClick={() => handleRemove(entry)}
                disabled={removingId === entry.id}
                aria-label={tStaff("removeBtn")}
                sx={{
                  color: "var(--text-secondary)",
                  "&:hover": { color: "error.main" },
                }}
              >
                {removingId === entry.id ? (
                  <CircularProgress size={18} />
                ) : (
                  <i className="ph ph-trash" style={{ fontSize: 18 }} aria-hidden="true" />
                )}
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}

      <ToastContainer />
    </Box>
  );
};

export default ProfileStaffTab;
