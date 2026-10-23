"use client";

import { createTheme } from "@mui/material/styles";

/** Figma variables (file oFEG69fZBUK2wh0esta2Ov). */
export const tokens = {
  bleuFonce: "#041b44",
  bleu400: "#2c95ff",
  bleu600: "#1c64b4",
  bleu5: "rgba(44, 149, 255, 0.05)",
  bleu10: "rgba(44, 149, 255, 0.1)",
  bleu20: "rgba(44, 149, 255, 0.2)",
  bleu30: "rgba(44, 149, 255, 0.3)",
  vertOs: "#43b6a3",
  vertOs2: "#00d492",
  successLight2: "#e9fff2",
  jaune400: "#ffd500",
  jaune600: "#f7b600",
  rating: "#ffb400",
  error3: "#fc6530",
  errorMain: "#d32f2f",
  gris: "#8ea1b2",
  grisMoyen1: "#dfe9ef",
  grisClair1: "#f7fafc",
  grisClair2: "#f0f6f9",
  blanc: "#ffffff",
  /** Card shadows used across the page. */
  shadowCard: "0px 2px 8px 0px rgba(4, 27, 68, 0.12)",
  shadowCardSoft: "0px 2px 4px 0px rgba(4, 27, 68, 0.12)",
  elevation3: "0px 1px 8px 0px rgba(0,0,0,0.12), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 3px 3px -2px rgba(0,0,0,0.2)",
  elevation6: "0px 1px 18px 0px rgba(0,0,0,0.12), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 3px 5px -1px rgba(0,0,0,0.2)",
  headerHeight: 104,
} as const;

export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: tokens.bleuFonce, contrastText: tokens.blanc },
    secondary: { main: tokens.vertOs, contrastText: tokens.blanc },
    warning: { main: tokens.jaune600 },
    error: { main: tokens.errorMain },
    info: { main: tokens.bleu400 },
    success: { main: tokens.vertOs },
    text: { primary: tokens.bleuFonce, secondary: tokens.gris },
    background: { default: tokens.grisClair2, paper: tokens.blanc },
    divider: tokens.grisMoyen1,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "var(--font-poppins), Poppins, system-ui, sans-serif",
    button: { textTransform: "none" },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: false } },
    MuiButton: {
      styleOverrides: { root: { boxShadow: "none", "&:hover": { boxShadow: "none" } } },
    },
    MuiRating: {
      styleOverrides: {
        iconFilled: { color: tokens.rating },
        iconEmpty: { color: "rgba(0, 0, 0, 0.23)" },
      },
    },
  },
});
