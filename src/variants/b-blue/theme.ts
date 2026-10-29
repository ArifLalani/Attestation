import { createTheme } from "@mui/material/styles";
// Independent blue study of B. Poppins is already self-hosted by the app layout.
export const b = {
  ivory: "#f5f8fb",
  sand: "#edf2f7",
  sandDeep: "#dfe8f1",
  white: "#ffffff",
  ink: "#20364d",
  muted: "#607287",
  line: "#e1e9f1",
  lineStrong: "#c8d6e5",
  accent: "#4b6f96",
  accentDark: "#355574",
  accentTint: "#eaf0f7",
  sage: "#50788d",
  sageText: "#365f76",
  sageTint: "#eaf2f6",
  gold: "#4b6f96",
  serif: "var(--font-poppins), Poppins, system-ui, sans-serif",
  sans: "var(--font-poppins), Poppins, system-ui, sans-serif",
  radius: 20,
  shadow: "0 1px 2px rgba(4, 27, 68, 0.05), 0 6px 20px rgba(4, 27, 68, 0.06)",
  shadowLift: "0 2px 4px rgba(4, 27, 68, 0.06), 0 14px 36px rgba(4, 27, 68, 0.12)",
  shadowCard: "0 6px 16px rgba(0, 0, 0, 0.12)",
  gradient: "linear-gradient(90deg, #4b6f96 0%, #426487 55%, #355574 100%)",
  focus: "0 0 0 2px #ffffff, 0 0 0 4px #4b6f96",
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
