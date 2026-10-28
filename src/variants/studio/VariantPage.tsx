"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import GlobalStyles from "@mui/material/GlobalStyles";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Verified from "@mui/icons-material/Verified";
import ArrowForward from "@mui/icons-material/ArrowForward";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import IosShare from "@mui/icons-material/IosShare";
import Image from "next/image";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { useEffect } from "react";
import { CertificateProvider, sectionIds, useCertificate, type SectionId } from "@/components/certificate/CertificateContext";
import { getAgency } from "@/data/agencies";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { formatCount, formatScore } from "@/lib/format";
import { useScrollSpy } from "@/lib/hooks";
import { AgenciesSection } from "./Agencies";
import { AssistantPanelA } from "./Assistant";
import { AgencyLogo, PhoneActionBar, useShare } from "./Header";
import { BusinessPitch, ContactPanel, Footer, QualitySection } from "./Quality";
import { AskAiCard, ReputationPanel } from "./Reputation";
import { ReviewRequestPanel, ReviewsSection } from "./Reviews";
import { TeamSection } from "./Team";
import { OpenStatusA, StarTiles } from "./ui";
import { useScore } from "./useScore";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap" });
const inter = Inter({ subsets: ["latin"], display: "swap" });
const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
type Variant = "d" | "e";

// D follows La Boîte Immo's live brand. E uses a quiet, consumer-oriented visual language.
const palettes = {
  d: { navy: "#202220", navySoft: "#343834", blue: "#608c1b", blueText: "#45651b", blueTint: "#f0f5de", teal: "#62aa47", tealText: "#356b27", tealTint: "#edf6e9", yellow: "#bed000", yellowHover: "#acbd00", star: "#5c7c17", muted: "#62675e", line: "#e3e7da", lineStrong: "#cbd2bd", band: "#f5f6f0", white: "#ffffff", danger: "#b54121", tileEmpty: "#e5e9dc" },
  e: { navy: "#1d1d1f", navySoft: "#37373c", blue: "#0071e3", blueText: "#0066cc", blueTint: "#edf5ff", teal: "#2b8756", tealText: "#237348", tealTint: "#edf7f0", yellow: "#e8f2ff", yellowHover: "#dcecff", star: "#ba8200", muted: "#68686d", line: "#e5e5e8", lineStrong: "#d0d0d5", band: "#f5f5f7", white: "#ffffff", danger: "#b52a27", tileEmpty: "#e8e8ed" },
} as const;

const themes = Object.fromEntries((["d", "e"] as const).map((variant) => {
  const p = palettes[variant];
  return [variant, createTheme({
    palette: { primary: { main: variant === "d" ? p.navy : p.blue }, secondary: { main: p.tealText }, text: { primary: p.navy, secondary: p.muted }, background: { default: p.band, paper: p.white }, divider: p.line },
    typography: { fontFamily: variant === "d" ? inter.style.fontFamily : systemFont, button: { textTransform: "none", fontWeight: 600 } },
    shape: { borderRadius: variant === "d" ? 20 : 24 },
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
    components: {
      MuiButtonBase: { defaultProps: { disableRipple: true }, styleOverrides: { root: { "&.Mui-focusVisible": { outline: `3px solid ${p.blue}`, outlineOffset: 3 } } } },
      MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { minHeight: 44, borderRadius: 999, paddingInline: 22, transition: "background-color 180ms ease, transform 180ms ease", "&:active": { transform: "scale(.98)" } } } },
      MuiPaper: { styleOverrides: { rounded: { borderRadius: 24 } } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 14 } } },
    },
  })];
})) as Record<Variant, ReturnType<typeof createTheme>>;

const frame = { width: "100%", maxWidth: 1240, mx: "auto", px: { xs: 2, sm: 3, lg: 4 } } as const;
const sectionStyle = { scrollMarginTop: "80px" } as const;

/** Effects clean up when Next hides a cached page, including during D/E navigation. */
function VisualTokens({ variant }: { variant: Variant }) {
  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(palettes[variant]);
    for (const [key, value] of entries) root.style.setProperty(`--studio-${key}`, value);
    return () => { for (const [key] of entries) root.style.removeProperty(`--studio-${key}`); };
  }, [variant]);
  return null;
}

function Navigation({ variant, active, onSelect }: { variant: Variant; active: SectionId; onSelect: (id: SectionId) => void }) {
  const { agency, setPanel } = useCertificate();
  const p = palettes[variant];
  const labels = { synthese: "Présentation", avis: "Avis", agences: "Équipe & agences", qualite: "Qualité" };
  return (
    <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 1200, bgcolor: variant === "d" ? "rgba(255,255,255,.96)" : "rgba(250,250,252,.86)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${p.line}` }}>
      <Box sx={{ ...frame, minHeight: 56, display: "flex", alignItems: "center", gap: 3 }}>
        <ButtonBase onClick={() => onSelect("synthese")} aria-label="Revenir à la présentation" sx={{ display: { xs: "none", md: "flex" }, gap: 1, flexShrink: 0, fontWeight: 700, fontSize: 15 }}>
          <Image src={agency.logo} alt="" width={26} height={26} style={{ objectFit: "contain" }} />{agency.name}
        </ButtonBase>
        <Box component="nav" aria-label="Sections de la page" sx={{ flex: 1, display: "flex", justifyContent: { xs: "space-between", md: "center" }, minWidth: 0, gap: { xs: 0.25, sm: 2 } }}>
          {sectionIds.map(id => <ButtonBase key={id} onClick={() => onSelect(id)} aria-current={active === id ? "location" : undefined} sx={{ position: "relative", height: 56, px: { xs: 0.5, sm: 1.5 }, whiteSpace: "nowrap", fontSize: { xs: 11, sm: 13 }, fontWeight: active === id ? 700 : 500, color: active === id ? p.navy : p.muted, "&::after": active === id ? { content: '\"\"', position: "absolute", height: variant === "d" ? 4 : 2, borderRadius: 4, bgcolor: variant === "d" ? p.yellow : p.navy, bottom: 0, left: 8, right: 8 } : {} }}>{labels[id]}</ButtonBase>)}
        </Box>
        <Button onClick={() => setPanel("contact")} variant="contained" sx={{ display: { xs: "none", md: "inline-flex" }, bgcolor: variant === "d" ? p.navy : p.blue, color: "#fff", minHeight: 34, fontSize: 12 }}>Contacter</Button>
      </Box>
    </Box>
  );
}

function Score({ variant }: { variant: Variant }) {
  const { summary, visible, person } = useScore();
  const { scoreView, goToSection } = useCertificate();
  const p = palettes[variant];
  return (
    <ButtonBase onClick={() => goToSection("avis")} aria-label="Voir les avis clients" sx={{ display: "flex", flexDirection: variant === "d" ? "row" : "column", gap: variant === "d" ? 1.5 : 1.25, alignItems: "center", textAlign: "left", p: variant === "d" ? 1.5 : 0, bgcolor: variant === "d" ? "rgba(255,255,255,.65)" : "transparent", borderRadius: 4, maxWidth: "100%" }}>
      <Box sx={{ whiteSpace: "nowrap", flexShrink: 0, fontSize: variant === "d" ? 48 : { xs: 56, md: 72 }, lineHeight: 1, fontWeight: 700, letterSpacing: "-.065em", color: p.navy }}>{visible ? formatScore(summary.average!) : "—"}<Box component="span" sx={{ fontSize: 18, letterSpacing: 0, fontWeight: 400, color: p.muted }}> /5</Box></Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, alignItems: variant === "d" ? "flex-start" : "center", minWidth: 0 }}>
        <StarTiles value={visible ? summary.average! : 0} size={20} color={scoreView === "controle" ? p.tealText : p.blueText} />
        <Box sx={{ fontSize: 13, color: p.muted }}>{formatCount(summary.count)} avis {scoreView === "controle" ? "contrôlés" : "clients"}{person ? ` · ${person.name}` : ""}</Box>
      </Box>
    </ButtonBase>
  );
}

function Hero({ variant }: { variant: Variant }) {
  const { agency, setPanel, goToSection } = useCertificate();
  const p = palettes[variant];
  const { share, snackbar } = useShare();
  const d = variant === "d";
  return (
    <Box id="synthese" sx={{ ...sectionStyle, ...frame, animation: d ? "none" : "studio-arrive 600ms cubic-bezier(.2,0,0,1) both", pt: { xs: 2, md: d ? 4 : 6 }, pb: { xs: 3, md: 5 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: { xs: 2, md: 3 } }}>
        <Box component="a" href={opinionSystemLinks.home} target="_blank" rel="noopener noreferrer" sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none", color: p.navy, fontSize: 12, fontWeight: 600 }}><Image src="/figma/os-icon-logo.svg" alt="" width={23} height={23} unoptimized />Opinion System</Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 11, color: p.tealText }}><Verified sx={{ fontSize: 15 }} />Avis clients vérifiés</Box>
      </Box>
      <Box sx={{ position: "relative", display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: d ? "1.1fr 1fr" : "minmax(0,1fr)" }, bgcolor: d ? p.yellow : "transparent", borderRadius: d ? { xs: "28px 28px 80px 28px", md: "40px 40px 140px 40px" } : 0, overflow: "hidden", alignItems: "stretch" }}>
        <Box sx={{ p: d ? { xs: 3, md: 5 } : 0, display: "flex", flexDirection: "column", alignItems: d ? "flex-start" : "center", textAlign: d ? "left" : "center", gap: { xs: 2, md: 2.5 }, minWidth: 0 }}>
          {d ? <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><AgencyLogo agency={agency} size={48} /><Box sx={{ fontSize: 13 }}>Agence immobilière à {agency.city}</Box></Box> : <AgencyLogo agency={agency} size={72} />}
          <Typography component="h1" sx={{ fontFamily: d ? bricolage.style.fontFamily : systemFont, fontSize: d ? { xs: 39, sm: 54, md: 64 } : { xs: 39, sm: 56, md: 72 }, lineHeight: 1.02, fontWeight: d ? 700 : 600, letterSpacing: "-.055em", textWrap: "balance" }}>{agency.name}{d && <Box component="span" sx={{ display: "block", fontSize: { xs: 27, md: 38 }, mt: 1, fontWeight: 500, letterSpacing: "-.035em" }}>Les bonnes personnes pour votre projet.</Box>}</Typography>
          {!d && <Typography sx={{ fontSize: { xs: 18, md: 24 }, color: p.muted, letterSpacing: "-.025em" }}>La confiance se partage.</Typography>}
          <Score variant={variant} />
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: d ? "flex-start" : "center", gap: 1.25 }}>
            <Button onClick={() => setPanel("contact")} variant="contained" endIcon={d ? <ArrowForward /> : undefined} sx={{ bgcolor: d ? p.navy : p.blue, color: "#fff", px: 3, py: 1.5 }}>Parlons de votre projet</Button>
            <Button onClick={() => goToSection("avis")} sx={{ color: p.navy, bgcolor: d ? "rgba(255,255,255,.65)" : p.white, px: 3 }}>Lire les avis</Button>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: d ? "flex-start" : "center", alignItems: "center", color: p.muted }}><OpenStatusA hours={agency.hours} size={12} /><ButtonBase onClick={share} aria-label="Partager cette page" sx={{ fontSize: 12, gap: 0.5 }}><IosShare sx={{ fontSize: 15 }} />Partager</ButtonBase></Box>
        </Box>
        <Box sx={{ position: "relative", height: d ? { xs: 230, md: "auto" } : { xs: 220, sm: 330, md: 420 }, minHeight: d ? { md: 520 } : 0, mt: d ? 0 : { xs: 3, md: 5 }, borderRadius: d ? 0 : { xs: "24px", md: "32px" }, overflow: "hidden" }}>
          <Image src={agency.coverPhoto} alt={`L'équipe de ${agency.name} accompagne ses clients`} fill priority sizes="(min-width: 900px) 1100px, 100vw" style={{ objectFit: "cover", objectPosition: "center" }} />
          <Box sx={{ position: "absolute", inset: "50% 0 0", background: "linear-gradient(transparent,rgba(0,0,0,.55))" }} />
          <Box sx={{ position: "absolute", left: { xs: 24, md: 32 }, bottom: { xs: 24, md: 32 }, color: "#fff", maxWidth: "80%" }}><Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75, fontSize: 13 }}><Verified sx={{ fontSize: 18 }} />Une équipe. De vraies expériences.</Box><Typography sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1.15 }}>Votre projet mérite d’être entre de bonnes mains.</Typography></Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: d ? "flex-start" : "center", alignItems: "center", columnGap: { xs: 2, md: 4 }, rowGap: 1.25, mt: 3, fontSize: 13, color: p.muted }}>
        <ButtonBase onClick={() => goToSection("agences")} sx={{ gap: 0.75, textAlign: "left", fontSize: "inherit", maxWidth: "100%" }}><PlaceOutlined sx={{ fontSize: 18, flexShrink: 0 }} />{agency.address}</ButtonBase>
        <Box component="a" href={agency.website} target="_blank" rel="noopener noreferrer" sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "inherit", textDecoration: "none" }}><LanguageOutlined sx={{ fontSize: 18 }} />Site web</Box>
        <ButtonBase onClick={() => setPanel("contact")} sx={{ gap: 0.75, fontSize: "inherit" }}><PhoneOutlined sx={{ fontSize: 18 }} />Contacter l’agence</ButtonBase>
      </Box>
      {snackbar}
    </Box>
  );
}

function Content({ variant, active, goTo }: { variant: Variant; active: SectionId; goTo: (id: SectionId) => void }) {
  const d = variant === "d";
  const p = palettes[variant];
  return (
    <Box sx={{ color: p.navy, fontFamily: themes[variant].typography.fontFamily, overflowX: "clip", "& h2, & h3": { fontFamily: d ? bricolage.style.fontFamily : systemFont }, "& section[aria-labelledby]": { borderRadius: d ? "24px" : "28px" }, "& article": { borderRadius: d ? "20px" : "24px", p: { xs: 2.5, sm: 3.5 }, bgcolor: p.white }, "& h2": { letterSpacing: "-.035em" } }}>
      <Navigation variant={variant} active={active} onSelect={goTo} />
      <Box component="main">
        <Hero variant={variant} />
        <Box sx={{ ...frame, pb: { xs: 5, md: 8 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: d ? "340px minmax(0,1fr)" : "minmax(0,1fr) 330px" }, gap: { xs: 4, md: 5 }, alignItems: "start" }}>
            <Box component="aside" sx={{ gridColumn: { md: d ? 1 : 2 }, gridRow: { md: 1 }, position: { md: "sticky" }, top: 80, display: "flex", flexDirection: "column", gap: 2, minWidth: 0, "@media (max-height: 850px)": { position: "static" } }}><ReputationPanel /><AskAiCard /></Box>
            <Box id="avis" sx={{ ...sectionStyle, gridColumn: { md: d ? 2 : 1 }, gridRow: { md: 1 }, minWidth: 0 }}><ReviewsSection /></Box>
          </Box>
        </Box>
        <Box id="agences" sx={sectionStyle}><TeamSection /><AgenciesSection variant={variant} /></Box>
        <Box id="qualite" sx={sectionStyle}><QualitySection /><BusinessPitch /></Box>
      </Box>
      <Footer /><PhoneActionBar /><ContactPanel /><ReviewRequestPanel /><AssistantPanelA />
    </Box>
  );
}

export function VariantPage({ agencyId, variant }: { agencyId: string; variant: Variant }) {
  const agency = getAgency(agencyId)!;
  const { active, goTo } = useScrollSpy(sectionIds, 76);
  return (
    <ThemeProvider theme={themes[variant]}>
      <VisualTokens variant={variant} />
      <GlobalStyles styles={{ "@keyframes studio-arrive": { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } }, body: { backgroundColor: palettes[variant].band }, "@media (prefers-reduced-motion: reduce)": { "*, *::before, *::after": { animation: "none !important", transition: "none !important", scrollBehavior: "auto !important" } } }} />
      <CertificateProvider agency={agency} goToSection={goTo}>
        <Content variant={variant} active={active as SectionId} goTo={goTo} />
      </CertificateProvider>
    </ThemeProvider>
  );
}
