"use client";

import Box from "@mui/material/Box";
import { ReviewsSection } from "@/variants/finale/components/reviews/ReviewsSection";
import { getAgency } from "@/data/agencies";
import { useEffect, useMemo, useState } from "react";
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
import { AskYourAi } from "./AskYourAi";
import { CertificateFooter } from "./CertificateFooter";
import { CertificateActions } from "./CertificateActions";
import { buildCase, CaseProvider } from "@/variants/finale/cases";
import { NoReviewsCard } from "./NoReviewsCard";

const sectionSx = {
  display: "flex",
  flexDirection: "column",
  // The same space between every section: 16 px on phones, 24 px on desktop (as between the groups).
  gap: { xs: 2, md: 3 },
  // 16 px under the pinned bar, whatever its height (96 px on phones, 64 px on desktop).
  scrollMarginTop: `calc(var(--certificate-header-height, ${tokens.headerHeight}px) + 16px)`,
} as const;

export function CertificatePage({ agencyId, caseSlug }: { agencyId: string; caseSlug?: string }) {
  // A use case (/finale/cas/<slug>) swaps in its demo client and data.
  const useCase = useMemo(() => (caseSlug ? buildCase(caseSlug) : null), [caseSlug]);
  const agency = useCase?.agency ?? getAgency(agencyId)!;
  // The scroll spy and the jumps to a section follow the real height of the pinned bar.
  const [headerHeight, setHeaderHeight] = useState<number>(tokens.headerHeight);
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const observer = new ResizeObserver(() => setHeaderHeight(header.offsetHeight));
    observer.observe(header);
    setHeaderHeight(header.offsetHeight);
    return () => observer.disconnect();
  }, []);
  const dataset = useCase?.dataset;
  const hasReviews = !dataset || dataset.reviews.length > 0;
  const hasTeam = !dataset || dataset.team.length > 0;
  const { active, goTo } = useScrollSpy(sectionIds, headerHeight + 16);
  const goToSection = goTo as (id: SectionId) => void;

  return (
    <CaseProvider value={useCase}>
    <CertificateProvider agency={agency} goToSection={goToSection} dataset={useCase?.dataset}>
      <AppHeader active={active as SectionId} onSelect={goToSection} />
      <Box component="main" sx={{ ...contentColumnSx, px: 1.5, pt: { xs: 2, md: 3 }, pb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Box id="synthese" sx={sectionSx}>
            <BusinessCard />
            {/* Case 3 (no reviews): one card explains the label instead of Réputation and the reviews. */}
            {hasReviews ? <ReputationCard /> : <NoReviewsCard />}
          </Box>
          <Box id="avis" sx={sectionSx}>
            {hasReviews && <ReviewsSection />}
            {/* Under the reviews: ask an AI about this agency. */}
            <AskYourAi />
          </Box>
          <Box id="agences" sx={sectionSx}>
            <AgenciesSection />
            {/* Case 5: no team, no Team section. */}
            {hasTeam && <TeamSection />}
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
    </CaseProvider>
  );
}
