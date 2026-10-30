"use client";

import { createTheme } from "@mui/material/styles";
import { roboto } from "./fonts";

/**
 * Option F · Classique: the prototype's layout with the colours and fonts of the live certificate page
 * (opinionsystem.fr/fr-fr/certificate/14434). Same keys as src/theme/theme.ts so the copied components keep working.
 */
export const tokens = {
  bleuFonce: "#041b44",
  bleu400: "#2c95ff",
  bleu600: "#004f9f",
  bleu5: "rgba(44, 149, 255, 0.05)",
  bleu10: "rgba(44, 149, 255, 0.1)",
  bleu20: "rgba(44, 149, 255, 0.2)",
  bleu30: "rgba(44, 149, 255, 0.3)",
  vertOs: "#1bb78e",
  vertOs2: "#23ae84",
  successLight2: "#e6f7f1",
  jaune400: "#ffd500",
  jaune600: "#f7b600",
  rating: "#ffc72c",
  error3: "#e5173f",
  errorMain: "#d0103a",
  gris: "#677a90",
  grisMoyen1: "#dce7f5",
  grisClair1: "#f5f9fd",
  grisClair2: "#ecf3fb",
  blanc: "#ffffff",
  /** Live page: navy section bars and score panel, darker band, OS blue buttons, body text, gold. */
  marine: "#102d69",
  marineFonce: "#0b1a45",
  bleuOs: "#004f9f",
  texte: "#3c536a",
  titre: "#12253a",
  ombre: "#c0d5ed",
  or: "#c0a96e",
  bleuClair: "#7db9ff",
  /** Square-ish cards and buttons, as on the live page. */
  radiusCard: "4px",
  radiusButton: "3px",
  /** MUI elevation 2, the live page's card shadow. */
  shadowCard: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  shadowCardSoft: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  elevation3: "0px 1px 8px 0px rgba(0,0,0,0.12), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 3px 3px -2px rgba(0,0,0,0.2)",
  elevation6: "0px 1px 18px 0px rgba(0,0,0,0.12), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 3px 5px -1px rgba(0,0,0,0.2)",
  headerHeight: 112,
} as const;

export const poppins = "var(--font-poppins), Poppins, Arial, Helvetica, sans-serif";
export const robotoFamily = `${roboto.style.fontFamily}, Roboto, Arial, Helvetica, sans-serif`;

export const theme = createTheme({
  palette: {
    primary: { main: tokens.marine, contrastText: tokens.blanc },
    secondary: { main: tokens.vertOs, contrastText: tokens.blanc },
    warning: { main: tokens.jaune600 },
    error: { main: tokens.errorMain },
    info: { main: tokens.bleu400 },
    success: { main: tokens.vertOs },
    text: { primary: tokens.bleuFonce, secondary: tokens.gris },
    background: { default: tokens.grisClair2, paper: tokens.blanc },
    divider: tokens.grisMoyen1,
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: robotoFamily,
    h1: { fontFamily: poppins },
    h2: { fontFamily: poppins },
    h3: { fontFamily: poppins },
    h4: { fontFamily: poppins },
    h5: { fontFamily: poppins },
    h6: { fontFamily: poppins },
    button: { fontFamily: poppins, textTransform: "none" },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: false } },
    MuiButton: {
      styleOverrides: { root: { fontFamily: poppins, boxShadow: "none", "&:hover": { boxShadow: "none" } } },
    },
    MuiTab: { styleOverrides: { root: { fontFamily: poppins } } },
    MuiRating: {
      styleOverrides: {
        iconFilled: { color: tokens.rating },
        iconEmpty: { color: "rgba(0, 0, 0, 0.23)" },
      },
    },
  },
});
