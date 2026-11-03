"use client";

import Box from "@mui/material/Box";
import { ReviewsSection } from "@/variants/finale/components/reviews/ReviewsSection";
import { getAgency } from "@/data/agencies";
import { useScrollSpy } from "@/lib/hooks";
import { tokens } from "@/theme/theme";
import { AppHeader, contentColumnSx } from "./AppHeader";
import { BusinessCard } from "./BusinessCard";
import { CertificateProvider, sectionIds, type SectionId } from "@/components/certificate/CertificateContext";
import { ReputationCard } from "./ReputationCard";
import { TeamSection } from "./TeamSection";
import { AgenciesSection } from "./AgenciesSection";
import { QualitySection } from "./QualitySection";
import { BusinessPitch } from "./BusinessPitch";
import { CertificateFooter } from "./CertificateFooter";
import { CertificateActions } from "./CertificateActions";
import { SIDE_SHEET_WIDTH, useSideSheet } from "@/variants/finale/components/reviews/FiltersSheet";

const sectionSx = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  scrollMarginTop: `${tokens.headerHeight + 16}px`,
} as const;

/** Desktop: while the filters side sheet is open, the page moves left beside it instead of being covered. */
function PageShift({ children }: { children: React.ReactNode }) {
  const open = useSideSheet();
  return <Box sx={{ pr: open ? `${SIDE_SHEET_WIDTH}px` : 0, transition: "padding-right 225ms cubic-bezier(0, 0, 0.2, 1)" }}>{children}</Box>;
}

export function CertificatePage({ agencyId }: { agencyId: string }) {
  const agency = getAgency(agencyId)!;
  const { active, goTo } = useScrollSpy(sectionIds, tokens.headerHeight + 16);
  const goToSection = goTo as (id: SectionId) => void;

  return (
    <CertificateProvider agency={agency} goToSection={goToSection}>
      <PageShift>
        <AppHeader active={active as SectionId} onSelect={goToSection} />
        <Box component="main" sx={{ ...contentColumnSx, px: 1.5, pt: { xs: 2, md: 3 }, pb: 2 }}>
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
        </Box>
        <CertificateFooter />
      </PageShift>
      <CertificateActions />
    </CertificateProvider>
  );
}
