"use client";

import { createTheme } from "@mui/material/styles";
import { figtree } from "./font";

/** Option C · Pratique: cool neutrals, indigo accent, emerald for verified reviews. Text pairs checked for WCAG AA. */
export const pc = {
  page: "#f3f5f9",
  surface: "#ffffff",
  surfaceDim: "#f7f8fb",
  ink: "#1b1f2a",
  muted: "#5b6475",
  outline: "#e2e6ee",
  outlineStrong: "#c9cfdb",
  indigo: "#4f46e5",
  indigoDark: "#4338ca",
  indigoTonal: "#e8e7fd",
  indigoSoft: "#eef0ff",
  emerald: "#0f8a65",
  /** Emerald for text and icons on white or the tint (5.3:1). */
  emeraldText: "#0b7a59",
  emeraldTint: "#e3f5ee",
  star: "#fbbc04",
  starEmpty: "#dfe3ea",
  red: "#c5221f",
  redTint: "#fdecea",
  scrim: "rgba(27, 31, 42, 0.32)",
  /** Pinned bars on desktop: top app bar (64) + section tabs (56). */
  appBar: 64,
  tabs: 56,
} as const;

export const focusRing = { outline: `2px solid ${pc.indigo}`, outlineOffset: 2 } as const;

export const themeC = createTheme({
  cssVariables: false,
  palette: {
    primary: { main: pc.indigo, dark: pc.indigoDark, contrastText: "#fff" },
    secondary: { main: pc.emerald, contrastText: "#fff" },
    success: { main: pc.emerald },
    error: { main: pc.red },
    text: { primary: pc.ink, secondary: pc.muted },
    background: { default: pc.page, paper: pc.surface },
    divider: pc.outline,
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: `${figtree.style.fontFamily}, system-ui, sans-serif`,
    button: { textTransform: "none", fontWeight: 600 },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: false } },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, boxShadow: "none", "&:hover": { boxShadow: "none" }, "&.Mui-focusVisible": focusRing },
      },
    },
    MuiIconButton: { styleOverrides: { root: { "&.Mui-focusVisible": focusRing } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: pc.ink, fontSize: 12 } } },
    MuiSnackbarContent: { styleOverrides: { root: { backgroundColor: pc.ink, borderRadius: 12 } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 16, boxShadow: "0 8px 28px rgba(27,31,42,0.16)" } } },
  },
});
