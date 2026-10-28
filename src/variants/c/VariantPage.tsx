"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import GlobalStyles from "@mui/material/GlobalStyles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider } from "@mui/material/styles";
import Add from "@mui/icons-material/Add";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Close from "@mui/icons-material/Close";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import Verified from "@mui/icons-material/Verified";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CertificateProvider, useCertificate } from "@/components/certificate/CertificateContext";
import { getAgency } from "@/data/agencies";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { useScrollSpy } from "@/lib/hooks";
import { Agencies } from "./Agencies";
import { AskAiCard, AssistantPanelC } from "./Assistant";
import { ContactSheetC, ReviewRequestSheetC } from "./Forms";
import { AgencyInfo, Identity } from "./Identity";
import { Photos } from "./Photos";
import { Pitch, Quality, FooterC } from "./Quality";
import { Reputation } from "./Reputation";
import { Reviews } from "./Reviews";
import { Team } from "./Team";
import { focusRing, pc, themeC } from "./theme";

const sections = ["synthese", "avis", "equipe", "agences", "qualite"] as const;
type Section = (typeof sections)[number];

const globalStyles = {
  body: { backgroundColor: pc.page, color: pc.ink },
  ":root": { "--vc-sticky-top": `${pc.tabs}px` },
  "@media (min-width: 1200px)": { ":root": { "--vc-sticky-top": `${pc.appBar + pc.tabs}px` } },
} as const;

function AppBar() {
  const t = useTranslations("Header");
  return (
    <Box component="header" sx={{ position: { lg: "sticky" }, top: 0, zIndex: 20, height: { xs: 56, lg: pc.appBar }, px: { xs: 2, lg: 3 }, display: "flex", alignItems: "center", gap: 1.25, bgcolor: "#fff", borderBottom: `1px solid ${pc.outline}` }}>
      <Image src="/figma/os-icon-logo.svg" alt="" width={28} height={28} unoptimized />
      <Typography sx={{ flex: 1, fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{t("brand")}</Typography>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, height: 32, px: 1.25, borderRadius: 999, bgcolor: pc.emeraldTint, color: pc.emeraldText, fontSize: 12, fontWeight: 700, letterSpacing: "0.02em" }}>
        <Verified sx={{ fontSize: 16 }} />
        {t("badge")}
      </Box>
    </Box>
  );
}

function SectionTabs({ active, onSelect }: { active: Section; onSelect: (id: Section) => void }) {
  const t = useTranslations("Header");
  const tv = useTranslations("VarianteC");
  return (
    <Box
      component="nav"
      aria-label={t("tabsLabel")}
      sx={{ position: "sticky", top: { xs: 0, lg: pc.appBar }, zIndex: 10, height: pc.tabs, mx: { xs: -1.5, sm: -3, lg: -4 }, px: { xs: 1.5, sm: 3, lg: 4 }, display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 1 }, overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, bgcolor: "rgba(243,245,249,0.92)", backdropFilter: "blur(10px)" }}
    >
      {sections.map((id) => {
        const selected = id === active;
        return (
          <ButtonBase
            key={id}
            onClick={() => onSelect(id)}
            aria-current={selected ? "true" : undefined}
            sx={{
              flexShrink: 0,
              height: 40,
              px: { xs: 1.5, sm: 2 },
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              bgcolor: selected ? pc.ink : "#fff",
              color: selected ? "#fff" : pc.ink,
              border: `1px solid ${selected ? pc.ink : pc.outline}`,
              transition: "background-color 200ms ease, color 200ms ease, border-color 200ms ease",
              "&:hover": { bgcolor: selected ? pc.ink : pc.surfaceDim },
              "&.Mui-focusVisible": focusRing,
            }}
          >
            {tv(`tabs.${id}`)}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/** Phones and tablets: a FAB that unfolds the quick actions (Material 3 FAB menu). */
function FabMenu() {
  const t = useTranslations("Actions");
  const { setPanel, openAssistant } = useCertificate();
  const [open, setOpen] = useState(false);
  const items = [
    { key: "contact", icon: <PhoneOutlined />, label: t("contact"), action: () => setPanel("contact") },
    { key: "review", icon: <RateReviewOutlined />, label: t("leaveReview"), action: () => setPanel("reviewRequest") },
    { key: "ai", icon: <AutoAwesome />, label: t("askAi"), action: () => openAssistant() },
    { key: "signup", icon: <PersonAddOutlined />, label: t("signup"), action: () => window.open(opinionSystemLinks.signup, "_blank", "noopener,noreferrer") },
  ];
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "fixed", right: 16, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 1100, display: { xs: "flex", lg: "none" }, flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
        {open && (
          <Box component="ul" aria-label={t("menuLabel")} sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            {items.map((item, index) => (
              <Box component="li" key={item.key} sx={{ animation: `vcFabIn 180ms ${index * 30}ms both cubic-bezier(0.2, 0, 0, 1)`, "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}>
                <ButtonBase
                  onClick={() => {
                    setOpen(false);
                    item.action();
                  }}
                  sx={{ height: 52, gap: 1.25, pl: 2, pr: 2.5, borderRadius: "16px", bgcolor: pc.indigoTonal, color: pc.indigoDark, fontSize: 15, fontWeight: 700, boxShadow: "0 4px 14px rgba(27,31,42,0.18)", "&:hover": { bgcolor: "#dcdafb" }, "&.Mui-focusVisible": focusRing }}
                >
                  {item.icon}
                  {item.label}
                </ButtonBase>
              </Box>
            ))}
          </Box>
        )}
        <ButtonBase
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          sx={{ width: 60, height: 60, borderRadius: "18px", bgcolor: pc.indigo, color: "#fff", boxShadow: "0 6px 18px rgba(79,70,229,0.35)", "&:hover": { bgcolor: pc.indigoDark }, "&.Mui-focusVisible": focusRing, "& svg": { fontSize: 28, transition: "transform 200ms ease" } }}
        >
          {open ? <Close /> : <Add />}
        </ButtonBase>
      </Box>
    </ClickAwayListener>
  );
}

const cardSx = { bgcolor: "#fff", borderRadius: "28px", border: `1px solid ${pc.outline}` } as const;
const sectionSx = { display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 } } as const;

function Layout({ active, goTo }: { active: Section; goTo: (id: Section) => void }) {
  return (
    <>
      <GlobalStyles styles={{ ...globalStyles, "@keyframes vcFabIn": { from: { opacity: 0, transform: "translateY(8px) scale(0.96)" }, to: { opacity: 1, transform: "none" } } }} />
      <AppBar />
      <Box sx={{ display: { lg: "grid" }, gridTemplateColumns: { lg: "420px minmax(0, 1fr)", xl: "460px minmax(0, 1fr)" }, alignItems: "start" }}>
        {/* Desktop: a Google Maps-like side panel, sticky, with its own scroll. */}
        <Box component="aside" sx={{ display: { xs: "none", lg: "block" }, position: "sticky", top: pc.appBar, height: `calc(100vh - ${pc.appBar}px)`, overflowY: "auto", overscrollBehavior: "contain", bgcolor: "#fff", borderRight: `1px solid ${pc.outline}`, scrollbarWidth: "thin" }}>
          {/* The score comes right after the actions, so it shows without scrolling the panel; the practical details follow. */}
          <Identity compactCover info={false} />
          <Box sx={{ mx: 3, mt: 0.5, borderTop: `1px solid ${pc.outline}` }} />
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            <Reputation dense />
          </Box>
          <Box sx={{ px: 3, pb: 4 }}>
            <AgencyInfo />
          </Box>
        </Box>

        <Box component="main" sx={{ minWidth: 0, width: "100%", maxWidth: { xs: 720, lg: 1080 }, mx: "auto", px: { xs: 1.5, sm: 3, lg: 4 }, pt: { xs: 1.5, lg: 0 } }}>
          <Box sx={{ ...cardSx, display: { lg: "none" }, p: 1, pb: 1.5, mb: 0.5 }}>
            <Identity />
          </Box>
          <SectionTabs active={active} onSelect={goTo} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 }, pt: { xs: 0.5, lg: 1 } }}>
            <Box id="synthese" sx={sectionSx}>
              <Box sx={{ ...cardSx, display: { lg: "none" }, p: { xs: 2, sm: 3 } }}>
                <Reputation />
              </Box>
              <Box sx={{ display: { xs: "none", lg: "block" } }}>
                <Photos />
              </Box>
              <AskAiCard />
            </Box>
            <Box id="avis" sx={sectionSx}>
              <Reviews />
            </Box>
            <Box id="equipe" sx={sectionSx}>
              <Team />
            </Box>
            <Box id="agences" sx={sectionSx}>
              <Agencies />
            </Box>
            <Box id="qualite" sx={sectionSx}>
              <Quality />
              <Pitch />
            </Box>
            <FooterC />
          </Box>
        </Box>
      </Box>
      <FabMenu />
      <ContactSheetC />
      <ReviewRequestSheetC />
      <AssistantPanelC />
    </>
  );
}

/** Option C · Pratique: Google Business-style profile. Same data and behaviour as the current prototype. */
export function VariantPage({ agencyId }: { agencyId: string }) {
  const agency = getAgency(agencyId)!;
  const desktop = useMediaQuery("(min-width:1200px)");
  const { active, goTo } = useScrollSpy(sections, (desktop ? pc.appBar + pc.tabs : pc.tabs) + 12);
  const goToSection = goTo as (id: string) => void;

  return (
    <ThemeProvider theme={themeC}>
      <CertificateProvider agency={agency} goToSection={goToSection}>
        <Box sx={{ fontFamily: themeC.typography.fontFamily, color: pc.ink, minHeight: "100vh" }}>
          <Layout active={active as Section} goTo={goTo as (id: Section) => void} />
        </Box>
      </CertificateProvider>
    </ThemeProvider>
  );
}
