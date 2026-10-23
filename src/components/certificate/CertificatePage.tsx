"use client";

import Box from "@mui/material/Box";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { getAgency } from "@/data/agencies";
import { useScrollSpy } from "@/lib/hooks";
import { tokens } from "@/theme/theme";
import { AppHeader, pageColumnSx } from "./AppHeader";
import { BusinessCard } from "./BusinessCard";
import { CertificateProvider, sectionIds, type SectionId } from "./CertificateContext";
import { ReputationCard } from "./ReputationCard";
import { TeamSection } from "./TeamSection";
import { AgenciesSection } from "./AgenciesSection";
import { QualitySection } from "./QualitySection";
import { BusinessPitch } from "./BusinessPitch";
import { CertificateFooter } from "./CertificateFooter";
import { CertificateActions, DesktopActions } from "./CertificateActions";

const sectionSx = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  scrollMarginTop: `${tokens.headerHeight + 16}px`,
} as const;

export function CertificatePage({ agencyId }: { agencyId: string }) {
  const agency = getAgency(agencyId)!;
  const { active, goTo } = useScrollSpy(sectionIds, tokens.headerHeight + 16);
  const goToSection = goTo as (id: SectionId) => void;

  return (
    <CertificateProvider agency={agency} goToSection={goToSection}>
      <AppHeader active={active as SectionId} onSelect={goToSection} />
      <Box component="main" sx={{ ...pageColumnSx, px: 1.5, pt: { xs: 2, md: 3 }, pb: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 280px", lg: "minmax(0, 1fr) 288px" }, gap: { xs: 2, md: 3 }, alignItems: "start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Box id="synthese" sx={sectionSx}>
            <BusinessCard />
            <ReputationCard />
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
        <DesktopActions />
      </Box>
      <CertificateFooter />
      <CertificateActions />
    </CertificateProvider>
  );
}
