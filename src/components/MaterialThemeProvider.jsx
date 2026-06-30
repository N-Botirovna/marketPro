"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { getResolvedTheme, subscribeTheme } from "@/lib/theme";

// Brand colour comes from public/assets/sass/abstracts/_variable.scss:218-220
// (--main-h 148 / --main-s 59% / --main-l 39%). Mirror it here so MUI's
// `color="primary"` picks up the Kitobzor green instead of MUI default blue.
// NOTE: CssBaseline is intentionally NOT applied — the project depends on
// Bootstrap 5 for layout/utilities, and CssBaseline would strip those
// margins/borders/typography.
// Mirrors _variable.scss --main-h/s/l (150 / 55% / 35%, deepened in Phase 3)
// and the --brand tokens in globals.scss. Keep all three in sync.
const BRAND = {
  main: "hsl(150, 55%, 35%)",
  light: "hsl(150, 55%, 90%)",
  dark: "hsl(150, 55%, 27%)",
  contrastText: "#ffffff",
};

const baseTypography = {
  fontFamily: [
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
  ].join(","),
  // Phase 3 type polish — tighter, more confident headings and roomier body
  // line-height (sizes left at MUI defaults to avoid layout shifts; this only
  // refines weight/tracking/rhythm where MUI Typography variants are used).
  h1: { fontWeight: 800, letterSpacing: "-0.02em" },
  h2: { fontWeight: 800, letterSpacing: "-0.02em" },
  h3: { fontWeight: 700, letterSpacing: "-0.02em" },
  h4: { fontWeight: 700, letterSpacing: "-0.015em" },
  h5: { fontWeight: 700, letterSpacing: "-0.01em" },
  h6: { fontWeight: 700, letterSpacing: "-0.01em" },
  body1: { lineHeight: 1.6 },
  body2: { lineHeight: 1.55 },
};

const buildTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: BRAND,
      secondary: { main: "#dc004e" },
      ...(mode === "dark"
        ? {
            background: { default: "#0f172a", paper: "#1e293b" },
            text: {
              primary: "#f1f5f9",
              secondary: "#cbd5e1",
              disabled: "#64748b",
            },
            divider: "rgba(255, 255, 255, 0.12)",
          }
        : {
            // Sync with --surface-page (globals.scss) — airier near-white page.
            background: { default: "#f7f8fa", paper: "#ffffff" },
          }),
    },
    // NOTE: do NOT set `shape.borderRadius` here — in MUI it multiplies every
    // numeric `borderRadius` in `sx` app-wide (e.g. `borderRadius: 3` → 3×),
    // which over-rounds dialogs/cards. Round inputs explicitly instead (below).
    typography: baseTypography,
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 10, fontWeight: 600 },
        },
      },
      // Round inputs/selects to match the app's rounded aesthetic (the original
      // MUI 4px looked sharp next to the rounded cards) — px value, so it does
      // NOT cascade into the `sx` borderRadius multiplier.
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      // Dialogs that don't set their own PaperProps still get a soft, rounded
      // surface (the big form modals override this with full-screen-on-mobile).
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            // Ultra-minimal: lighter, cooler menu elevation.
            boxShadow: "0 8px 28px rgba(15,23,42,0.10)",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: "2px 8px",
          },
        },
      },
    },
  });

const MaterialThemeProvider = ({ children }) => {
  // Start with "light" on the server. After hydration `useEffect` syncs to
  // the resolved client theme. We do NOT read getResolvedTheme() in the
  // initializer because the SSR pass would always say "light" and a client
  // running in dark mode would briefly render light-mode MUI components.
  const [mode, setMode] = useState("light");

  useEffect(() => {
    setMode(getResolvedTheme());
    return subscribeTheme(({ resolved }) => setMode(resolved));
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MaterialThemeProvider;
