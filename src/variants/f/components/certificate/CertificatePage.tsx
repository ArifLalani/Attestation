"use client";

import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { ReviewsSection } from "@/variants/f/components/reviews/ReviewsSection";
import { getAgency } from "@/data/agencies";
import { useScrollSpy } from "@/lib/hooks";
import { poppins, robotoFamily, theme, tokens } from "@/variants/f/theme";
import { AppHeader, contentColumnSx } from "./AppHeader";
import { BusinessCard } from "./BusinessCard";
import { CertificateProvider, sectionIds, type SectionId } from "@/components/certificate/CertificateContext";
import { ReputationCard } from "./ReputationCard";
import { AskAiCard } from "./AskAiCard";
import { TeamSection } from "./TeamSection";
import { AgenciesSection } from "./AgenciesSection";
import { QualitySection } from "./QualitySection";
import { BusinessPitch } from "./BusinessPitch";
import { CertificateFooter } from "./CertificateFooter";
import { CertificateActions, DesktopScorePill } from "./CertificateActions";

const sectionSx = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  scrollMarginTop: `${tokens.headerHeight + 16}px`,
} as const;

/** Option F · Classique: the prototype's page in the colours and fonts of the live certificate page. */
export function CertificatePage({ agencyId }: { agencyId: string }) {
  const agency = getAgency(agencyId)!;
  const { active, goTo } = useScrollSpy(sectionIds, tokens.headerHeight + 16);
  const goToSection = goTo as (id: SectionId) => void;

  return (
    <ThemeProvider theme={theme}>
    {/* Live page background: pale blue with the slanted bars, the big pale shape behind the top of the page. */}
    <GlobalStyles
      styles={{
        body: {
          backgroundColor: tokens.grisClair2,
          backgroundImage: "url(/variantes/f/bg-header.svg), url(/variantes/f/bg-page.svg)",
          backgroundRepeat: "no-repeat, repeat-y",
          backgroundPosition: "center top, center 640px",
          backgroundSize: "max(100%, 1200px) auto, max(100%, 1200px) auto",
          fontFamily: robotoFamily,
          color: tokens.bleuFonce,
        },
        ":is(h1, h2, h3, h4).MuiTypography-root": { fontFamily: poppins },
      }}
    />
    <CertificateProvider agency={agency} goToSection={goToSection}>
      <AppHeader active={active as SectionId} onSelect={goToSection} />
      <Box component="main" sx={{ ...contentColumnSx, px: 1.5, pt: { xs: 2, md: 3 }, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Box id="synthese" sx={sectionSx}>
            <BusinessCard />
            <ReputationCard />
            <AskAiCard />
          </Box>
          <Box id="avis" sx={sectionSx}>
            <ReviewsSection />
          </Box>
          <Box id="agences" sx={sectionSx}>
            <TeamSection />
            <AgenciesSection />
          </Box>
          <Box id="qualite" sx={sectionSx}>
            <QualitySection />
            <BusinessPitch />
          </Box>
        </Box>
      </Box>
      <CertificateFooter />
      <CertificateActions />
      <DesktopScorePill />
    </CertificateProvider>
    </ThemeProvider>
  );
}
