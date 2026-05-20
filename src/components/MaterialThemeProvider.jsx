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
const BRAND = {
  main: "hsl(148, 59%, 39%)",
  light: "hsl(148, 59%, 90%)",
  dark: "hsl(148, 59%, 31%)",
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
            background: { default: "#f4f5f7", paper: "#ffffff" },
          }),
    },
    typography: baseTypography,
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 8 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
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
