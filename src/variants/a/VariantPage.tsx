"use client";

import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { CertificateProvider, sectionIds, type SectionId } from "@/components/certificate/CertificateContext";
import { getAgency } from "@/data/agencies";
import { useScrollSpy } from "@/lib/hooks";
import { AgenciesSection } from "./Agencies";
import { AssistantPanelA } from "./Assistant";
import { BrandBar, Hero, PhoneActionBar, SectionBar } from "./Header";
import { BusinessPitch, ContactPanel, Footer, QualitySection } from "./Quality";
import { AskAiCard, ReputationPanel } from "./Reputation";
import { ReviewRequestPanel, ReviewsSection } from "./Reviews";
import { TeamSection } from "./Team";
import { a, jakarta, themeA } from "./theme";
import { containerSx } from "./ui";

const offset = a.barHeight + 16;

/**
 * Option A · Confiance. Same data and behaviour as the prototype, Trustpilot-like layout:
 * identity and score in a hero, then the reviews beside a sticky Réputation sidebar (desktop).
 */
export function VariantPage({ agencyId }: { agencyId: string }) {
  const agency = getAgency(agencyId)!;
  const { active, goTo } = useScrollSpy(sectionIds, offset);
  const goToSection = goTo as (id: SectionId) => void;

  return (
    <ThemeProvider theme={themeA}>
      <GlobalStyles styles={{ body: { backgroundColor: a.white, color: a.navy }, ":root": { "--certificate-header-height": `${a.barHeight}px` } }} />
      <CertificateProvider agency={agency} goToSection={goToSection}>
        <Box className={jakarta.className} sx={{ color: a.navy, overflowX: "clip" }}>
          <BrandBar />
          <Hero />
          <SectionBar active={active as SectionId} onSelect={goToSection} />

          <Box component="main">
            <Box
              sx={{
                ...containerSx,
                pt: { xs: 3, md: 5 },
                pb: { xs: 6, md: 9 },
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
                columnGap: 6,
                rowGap: 4,
                alignItems: "start",
              }}
            >
              <Box
                component="aside"
                sx={{
                  gridColumn: { lg: 2 },
                  gridRow: { lg: 1 },
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  position: { lg: "sticky" },
                  top: { lg: a.barHeight + 24 },
                  // Short desktop windows: let the sidebar scroll with the page instead of cutting it off.
                  "@media (max-height: 820px)": { position: "static" },
                }}
              >
                <ReputationPanel />
                <AskAiCard />
              </Box>
              <Box id="avis" sx={{ gridColumn: { lg: 1 }, gridRow: { lg: 1 }, minWidth: 0, scrollMarginTop: `${offset}px` }}>
                <ReviewsSection />
              </Box>
            </Box>

            <Box id="agences" sx={{ scrollMarginTop: `${offset}px`, borderTop: `1px solid ${a.line}` }}>
              <TeamSection />
              <AgenciesSection />
            </Box>

            <Box id="qualite" sx={{ scrollMarginTop: `${offset}px` }}>
              <QualitySection />
              <BusinessPitch />
            </Box>
          </Box>

          <Footer />
          <PhoneActionBar />
          <ContactPanel />
          <ReviewRequestPanel />
          <AssistantPanelA />
        </Box>
      </CertificateProvider>
    </ThemeProvider>
  );
}
