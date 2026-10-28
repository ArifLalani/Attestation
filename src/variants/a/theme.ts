import { createTheme } from "@mui/material/styles";
import { Plus_Jakarta_Sans } from "next/font/google";

/** Option A · Confiance: the Opinion System palette, cleaner (white page, hairlines, Plus Jakarta Sans). */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const a = {
  navy: "#041b44",
  navySoft: "#1b3263",
  blue: "#2c95ff",
  /** Blue for text and links on white (AA). */
  blueText: "#1c64b4",
  blueTint: "#eaf4ff",
  teal: "#43b6a3",
  /** Teal for text on white (AA). */
  tealText: "#1f7d6e",
  tealTint: "#e8f6f3",
  yellow: "#ffd500",
  yellowHover: "#f7c600",
  star: "#ffb400",
  /** Muted text (AA on white and on the band). */
  muted: "#55667c",
  line: "#e3eaf0",
  lineStrong: "#cfdae4",
  band: "#f5f8fb",
  white: "#ffffff",
  danger: "#c2410c",
  tileEmpty: "#dde5ec",
  radius: 12,
  /** Pinned section bar; the review toolbar sticks right under it. */
  barHeight: 56,
  shadowFloat: "0 12px 32px -8px rgba(4, 27, 68, 0.18), 0 2px 6px rgba(4, 27, 68, 0.06)",
  shadowSoft: "0 1px 2px rgba(4, 27, 68, 0.06)",
  ease: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

/** Colour of the score for each view: blue = Avis global, teal = Avis Contrôlés. */
export const viewColor = { global: a.blue, controle: a.teal } as const;
export const viewText = { global: a.blueText, controle: a.tealText } as const;

export const themeA = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: a.navy, contrastText: a.white },
    secondary: { main: a.teal, contrastText: a.navy },
    info: { main: a.blue },
    success: { main: a.tealText },
    error: { main: a.danger },
    text: { primary: a.navy, secondary: a.muted },
    background: { default: a.white, paper: a.white },
    divider: a.line,
  },
  shape: { borderRadius: a.radius },
  typography: {
    fontFamily: `${jakarta.style.fontFamily}, system-ui, sans-serif`,
    button: { textTransform: "none", fontWeight: 700, letterSpacing: 0 },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 10,
          paddingInline: 18,
          fontSize: 15,
          transition: `background-color 150ms ease, border-color 150ms ease, transform 150ms ${a.ease}`,
          "&:active": { transform: "scale(0.98)" },
          "&.Mui-focusVisible": { outline: `3px solid ${a.blue}`, outlineOffset: 2 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10, "& .MuiOutlinedInput-notchedOutline": { borderColor: a.lineStrong } },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 44 } } },
  },
});
