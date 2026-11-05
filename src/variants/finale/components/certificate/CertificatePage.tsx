"use client";

import Box from "@mui/material/Box";
import { ReviewsSection } from "@/variants/finale/components/reviews/ReviewsSection";
import { getAgency } from "@/data/agencies";
import { useScrollSpy } from "@/lib/hooks";
import { tokens } from "@/theme/theme";
import { AppHeader, contentColumnSx } from "./AppHeader";
import { BusinessCard } from "./BusinessCard";
import { BusinessCard as CurrentBusinessCard } from "@/components/certificate/BusinessCard";
import { CertificateProvider, sectionIds, type SectionId } from "@/components/certificate/CertificateContext";
import { ReputationCard } from "./ReputationCard";
import { TeamSection } from "./TeamSection";
import { AgenciesSection } from "./AgenciesSection";
import { QualitySection } from "./QualitySection";
import { BusinessPitch } from "./BusinessPitch";
import { CertificateFooter } from "./CertificateFooter";
import { CertificateActions } from "./CertificateActions";

const sectionSx = {
  display: "flex",
  flexDirection: "column",
  // The same space between every section: 16 px on phones, 24 px on desktop (as between the groups).
  gap: { xs: 2, md: 3 },
  scrollMarginTop: `${tokens.headerHeight + 16}px`,
} as const;

/** `hero="actuel"` (Version 2): the current prototype's hero (photo banner, name, address, hours, Contacter / Site web / Itinéraire) instead of H's. */
export function CertificatePage({ agencyId, hero = "finale" }: { agencyId: string; hero?: "finale" | "actuel" }) {
  const agency = getAgency(agencyId)!;
  const { active, goTo } = useScrollSpy(sectionIds, tokens.headerHeight + 16);
  const goToSection = goTo as (id: SectionId) => void;

  return (
    <CertificateProvider agency={agency} goToSection={goToSection}>
      <AppHeader active={active as SectionId} onSelect={goToSection} />
      <Box component="main" sx={{ ...contentColumnSx, px: 1.5, pt: { xs: 2, md: 3 }, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Box id="synthese" sx={sectionSx}>
            {hero === "actuel" ? <CurrentBusinessCard /> : <BusinessCard />}
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
      </Box>
      <CertificateFooter />
      <CertificateActions />
    </CertificateProvider>
  );
}
