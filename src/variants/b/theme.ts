import { createTheme } from "@mui/material/styles";
import { DM_Sans, Fraunces } from "next/font/google";

// Option B · Chaleureux: soft serif titles, a friendly sans for everything else.
export const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-b-serif", axes: ["SOFT", "opsz"], display: "swap" });
export const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-b-sans", axes: ["opsz"], display: "swap" });

/** Warm palette. Every text colour passes WCAG AA on white and on the ivory page. */
export const b = {
  ivory: "#fbf8f4",
  sand: "#f3eee7",
  sandDeep: "#e9e1d6",
  white: "#ffffff",
  ink: "#222222",
  muted: "#6a6a6a",
  line: "#ebe5dd",
  lineStrong: "#d9d1c6",
  /** Terracotta: links and primary actions (5,2:1 on white). */
  accent: "#c2412a",
  accentDark: "#a8341f",
  accentTint: "#fdeee9",
  /** Sage: Avis Contrôlés. `sageText` for small text on the sage tint. */
  sage: "#2f7d5b",
  sageText: "#276b4e",
  sageTint: "#e8f3ed",
  gold: "#b7791f",
  serif: "var(--font-b-serif), Georgia, serif",
  sans: "var(--font-b-sans), system-ui, sans-serif",
  radius: 20,
  shadow: "0 1px 2px rgba(34, 24, 10, 0.06), 0 6px 20px rgba(34, 24, 10, 0.06)",
  shadowLift: "0 2px 4px rgba(34, 24, 10, 0.06), 0 14px 36px rgba(34, 24, 10, 0.12)",
  shadowCard: "0 6px 16px rgba(0, 0, 0, 0.12)",
  /** The primary CTA, like Airbnb's: a warm gradient (white text stays above 4,5:1 at both ends). */
  gradient: "linear-gradient(90deg, #d2462c 0%, #c2412a 55%, #a8341f 100%)",
  focus: "0 0 0 2px #ffffff, 0 0 0 4px #222222",
} as const;

export const themeB = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: b.ink, contrastText: b.white },
    secondary: { main: b.accent, contrastText: b.white },
    success: { main: b.sage },
    error: { main: "#b3261e" },
    text: { primary: b.ink, secondary: b.muted },
    background: { default: b.ivory, paper: b.white },
    divider: b.line,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: b.sans,
    button: { textTransform: "none", fontWeight: 600 },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});
