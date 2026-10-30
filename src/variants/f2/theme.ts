import { createTheme } from "@mui/material/styles";
import { roboto } from "@/variants/f/fonts";
// Option F2: B's layout in the colours and fonts of the live certificate page (opinionsystem.fr), like option F.
// Poppins (titles, buttons) is self-hosted by the app layout; Roboto (text) comes from option F.
export const b = {
  ivory: "#ecf3fb",
  sand: "#f5f9fd",
  sandDeep: "#dce7f5",
  white: "#ffffff",
  ink: "#041b44",
  muted: "#3c536a",
  line: "#dce7f5",
  lineStrong: "#c0d5ed",
  accent: "#004f9f",
  accentDark: "#102d69",
  accentTint: "#e3eefb",
  sage: "#1bb78e",
  sageText: "#0d7a5c",
  sageTint: "#e3f6ef",
  gold: "#004f9f",
  yellow: "#ffd500",
  yellowHover: "#f5cc00",
  serif: "var(--font-poppins), Poppins, Arial, Helvetica, sans-serif",
  sans: `${roboto.style.fontFamily}, Roboto, Arial, Helvetica, sans-serif`,
  radius: 20,
  shadow: "0 1px 2px rgba(4, 27, 68, 0.06), 0 6px 20px rgba(16, 45, 105, 0.08)",
  shadowLift: "0 2px 4px rgba(4, 27, 68, 0.08), 0 14px 36px rgba(16, 45, 105, 0.14)",
  shadowCard: "0 6px 16px rgba(4, 27, 68, 0.14)",
  gradient: "linear-gradient(90deg, #005aa9 0%, #102d69 100%)",
  focus: "0 0 0 2px #ffffff, 0 0 0 4px #004f9f",
} as const;

export const themeB = createTheme({
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
