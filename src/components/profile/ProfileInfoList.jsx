"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Box, Stack, Typography, Divider } from "@mui/material";

const Row = ({ icon, label, value, href }) => {
  const valueNode = href ? (
    <Box
      component="a"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      sx={{
        color: "primary.main",
        textDecoration: "none",
        fontWeight: 500,
        "&:hover": { textDecoration: "underline" },
      }}
    >
      {value}
    </Box>
  ) : (
    <Typography sx={{ fontWeight: 500, color: "text.primary" }}>{value}</Typography>
  );

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", py: 1.5, minHeight: 48 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: "50%",
          bgcolor: "primary.50",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        <i className={icon} aria-hidden="true" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontSize: 12,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
        <Box sx={{ mt: 0.25, overflow: "hidden", textOverflow: "ellipsis" }}>{valueNode}</Box>
      </Box>
    </Stack>
  );
};

const formatJoinDate = (raw, locale) => {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return date.toLocaleDateString(locale || "uz-UZ", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return date.toISOString().slice(0, 10);
  }
};

const ProfileInfoList = ({ user, locationLine, locale }) => {
  const t = useTranslations("ProfileDashboard");

  const phone = user?.app_phone_number || user?.phone_number || null;
  const telegram = user?.telegram_username || null;
  const telegramId = user?.telegram_id || null;
  const joined = formatJoinDate(user?.created_at || user?.date_joined, locale);

  const rows = [];

  if (phone) {
    rows.push({
      key: "phone",
      icon: "ph ph-phone",
      label: t("phone"),
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
    });
  }

  if (locationLine) {
    rows.push({
      key: "location",
      icon: "ph ph-map-pin",
      label: t("location"),
      value: locationLine,
    });
  }

  if (telegram) {
    const username = telegram.startsWith("@") ? telegram.slice(1) : telegram;
    rows.push({
      key: "telegram",
      icon: "ph ph-telegram-logo",
      label: "Telegram",
      value: `@${username}`,
      href: `https://t.me/${username}`,
    });
  } else if (telegramId) {
    rows.push({
      key: "telegram-id",
      icon: "ph ph-telegram-logo",
      label: "Telegram",
      value: t("notProvided"),
    });
  }

  if (joined) {
    rows.push({
      key: "joined",
      icon: "ph ph-calendar-blank",
      label: t("joinedLabel"),
      value: joined,
    });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: "var(--surface-card)",
        color: "var(--text-primary)",
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Typography
        component="h3"
        sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", mb: 1 }}
      >
        {t("infoTitle")}
      </Typography>
      <Stack divider={<Divider flexItem />}>
        {rows.map((row) => (
          <Row key={row.key} icon={row.icon} label={row.label} value={row.value} href={row.href} />
        ))}
      </Stack>
    </Box>
  );
};

export default ProfileInfoList;
