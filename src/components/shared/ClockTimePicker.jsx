"use client";

import React, { useState } from "react";
import { Box, Popover, Typography, Button, TextField, InputAdornment } from "@mui/material";
import { useTranslations } from "next-intl";
import Icon from "@/components/Icon";

// A self-contained 24-hour analog clock time picker — no `@mui/x-date-pickers`
// (incompatible with this project's @mui/material 9) and, crucially, NO AM/PM:
// hours run 00–23 on a Material-style two-ring dial, which is what local users
// expect. Tap an hour (auto-advances to minutes), tap a minute (5-min steps),
// then "Done". Value in/out is a plain "HH:mm" string.

const pad = (n) => String(n).padStart(2, "0");

const parse = (v) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || ""));
  if (!m) return { h: 9, m: 0 };
  return { h: Math.max(0, Math.min(23, +m[1])), m: Math.max(0, Math.min(59, +m[2])) };
};

const SIZE = 248;
const C = SIZE / 2;
const R_OUTER = 104;
const R_INNER = 66;
const DOT = 30;

// idx 0 = top (12 o'clock position), increasing clockwise.
const pos = (idx, r) => {
  const rad = ((idx * 30 - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
};

// Outer ring: hours 1–12. Inner ring: 00, 13–23.
const OUTER_HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const INNER_HOURS = Array.from({ length: 12 }, (_, i) => (i === 0 ? 0 : i + 12)); // 0,13..23
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,..,55

const ClockTimePicker = ({
  value,
  onChange,
  label,
  size = "small",
  disabled = false,
  fullWidth,
}) => {
  const t = useTranslations("TimePicker");
  const [anchorEl, setAnchorEl] = useState(null);
  const [mode, setMode] = useState("h"); // 'h' | 'm'
  const { h, m } = parse(value);

  const open = (e) => {
    if (disabled) return;
    setMode("h");
    setAnchorEl(e.currentTarget);
  };
  const close = () => setAnchorEl(null);

  const setHour = (hh) => {
    onChange?.(`${pad(hh)}:${pad(m)}`);
    setMode("m");
  };
  const setMinute = (mm) => onChange?.(`${pad(h)}:${pad(mm)}`);

  // Hand target.
  const handIdx = mode === "h" ? h % 12 : Math.round(m / 5) % 12;
  const handR = mode === "h" ? (h >= 1 && h <= 12 ? R_OUTER : R_INNER) : R_OUTER;
  const hand = pos(handIdx, handR);

  const renderNumber = (label, selected, onClick, p) => (
    <Box
      key={`${label}-${p.x}-${p.y}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        position: "absolute",
        width: DOT,
        height: DOT,
        left: p.x - DOT / 2,
        top: p.y - DOT / 2,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: selected ? 700 : 500,
        cursor: "pointer",
        userSelect: "none",
        zIndex: 2,
        color: selected ? "#fff" : "var(--text-primary)",
        bgcolor: selected ? "var(--main-600, hsl(148,59%,39%))" : "transparent",
        "&:hover": {
          bgcolor: selected ? "var(--main-600, hsl(148,59%,39%))" : "var(--surface-muted)",
        },
      }}
    >
      {label}
    </Box>
  );

  return (
    <>
      <TextField
        size={size}
        fullWidth={fullWidth}
        label={label}
        value={value || ""}
        placeholder="--:--"
        onClick={open}
        disabled={disabled}
        slotProps={{
          input: {
            readOnly: true,
            sx: { cursor: disabled ? "default" : "pointer" },
            endAdornment: (
              <InputAdornment position="end">
                <Icon
                  className="ph ph-clock"
                  style={{ fontSize: 18, color: "var(--text-muted)" }}
                  aria-hidden="true"
                />
              </InputAdornment>
            ),
          },
        }}
        sx={{ flex: 1 }}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{ paper: { sx: { p: 2, borderRadius: 3 } } }}
      >
        {/* Header: HH : MM with the active unit highlighted/clickable */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.5,
            mb: 1.5,
          }}
        >
          <Typography
            onClick={() => setMode("h")}
            sx={{
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1,
              cursor: "pointer",
              color: mode === "h" ? "var(--main-600, hsl(148,59%,39%))" : "var(--text-muted)",
            }}
          >
            {pad(h)}
          </Typography>
          <Typography
            sx={{ fontSize: 34, fontWeight: 700, lineHeight: 1, color: "var(--text-muted)" }}
          >
            :
          </Typography>
          <Typography
            onClick={() => setMode("m")}
            sx={{
              fontSize: 34,
              fontWeight: 700,
              lineHeight: 1,
              cursor: "pointer",
              color: mode === "m" ? "var(--main-600, hsl(148,59%,39%))" : "var(--text-muted)",
            }}
          >
            {pad(m)}
          </Typography>
        </Box>
        <Typography sx={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", mb: 1 }}>
          {mode === "h" ? t("hour") : t("minute")}
        </Typography>

        {/* Clock face */}
        <Box
          sx={{
            position: "relative",
            width: SIZE,
            height: SIZE,
            borderRadius: "50%",
            bgcolor: "var(--surface-muted)",
            mx: "auto",
          }}
        >
          <Box
            component="svg"
            width={SIZE}
            height={SIZE}
            sx={{ position: "absolute", inset: 0, zIndex: 1 }}
          >
            <line
              x1={C}
              y1={C}
              x2={hand.x}
              y2={hand.y}
              stroke="var(--main-600, hsl(148,59%,39%))"
              strokeWidth="2"
            />
            <circle cx={C} cy={C} r="3" fill="var(--main-600, hsl(148,59%,39%))" />
          </Box>

          {mode === "h" ? (
            <>
              {OUTER_HOURS.map((hh) =>
                renderNumber(String(hh), h === hh, () => setHour(hh), pos(hh % 12, R_OUTER)),
              )}
              {INNER_HOURS.map((hh, i) =>
                renderNumber(
                  hh === 0 ? "00" : String(hh),
                  h === hh,
                  () => setHour(hh),
                  pos(i, R_INNER),
                ),
              )}
            </>
          ) : (
            MINUTES.map((mm, i) =>
              renderNumber(pad(mm), m === mm, () => setMinute(mm), pos(i, R_OUTER)),
            )
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
          <Button
            onClick={close}
            variant="contained"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {t("done")}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default ClockTimePicker;
