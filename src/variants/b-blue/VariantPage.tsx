"use client";

import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { useCallback, useState } from "react";
import { CertificateProvider, sectionIds, type SectionId } from "@/components/certificate/CertificateContext";
import { getAgency } from "@/data/agencies";
import { useScrollSpy } from "@/lib/hooks";
import { Agencies } from "./Agencies";
import { AskAiCard, AssistantB } from "./Assistant";
import { FooterB, Pitch, Quality } from "./Closing";
import { ContactCard, ContactSheetB, PhoneBar } from "./Contact";
import { ReviewRequestB } from "./Forms";
import { Header, pageWidthSx } from "./Header";
import { Hero } from "./Hero";
import { Highlights, ScoreBanner } from "./Highlights";
import { Reputation } from "./Reputation";
import { Reviews } from "./Reviews";
import { Team } from "./Team";
import { b, themeB } from "./theme";
import { HEADER_VAR } from "./ui";

const sectionSx = { scrollMarginTop: `calc(${HEADER_VAR} + 8px)` } as const;

/** Option B · Chaleureux: an Airbnb-like listing. Same data and behaviour as the current certificate. */
export function VariantPage({ agencyId }: { agencyId: string }) {
  const agency = getAgency(agencyId)!;
  const [headerHeight, setHeaderHeight] = useState(64);
  const onHeight = useCallback((height: number) => setHeaderHeight(Math.round(height)), []);
  const { active, goTo } = useScrollSpy(sectionIds, headerHeight + 8);
  const goToSection = goTo as (id: SectionId) => void;

  return (
    <ThemeProvider theme={themeB}>
      <GlobalStyles
        styles={{
          body: { backgroundColor: b.ivory, color: b.ink, fontFamily: b.sans },
          "::selection": { backgroundColor: b.accentTint },
        }}
      />
      <CertificateProvider agency={agency} goToSection={goToSection}>
        <Box sx={{ fontFamily: b.sans, color: b.ink, overflowX: "clip", minHeight: "100vh" }}>
          <Header active={active as SectionId} onSelect={goToSection} onHeight={onHeight} />
          <Box component="main">
            <Box id="synthese" sx={sectionSx}>
              <Hero />
              <Box sx={{ ...pageWidthSx, mt: { xs: 3, md: 5 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 340px", lg: "minmax(0, 1fr) 380px" }, columnGap: { md: 5, lg: 8 }, alignItems: "start" }}>
                <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}>
                  <ScoreBanner />
                  <Highlights />
                  <Reputation />
                  <AskAiCard />
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, height: "100%" }}>
                  <ContactCard />
                </Box>
              </Box>
            </Box>
            <Box id="avis" sx={{ ...sectionSx, pt: { xs: 6, md: 9 } }}>
              <Reviews />
            </Box>
            <Box id="agences" sx={{ ...sectionSx, pt: { xs: 6, md: 9 }, display: "flex", flexDirection: "column", gap: { xs: 6, md: 9 } }}>
              <Team />
              <Agencies />
            </Box>
            <Box id="qualite" sx={{ ...sectionSx, pt: { xs: 6, md: 9 }, display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}>
              <Quality />
              <Pitch />
            </Box>
          </Box>
          <FooterB />
          <PhoneBar />
          <ContactSheetB />
          <ReviewRequestB />
          <AssistantB />
        </Box>
      </CertificateProvider>
    </ThemeProvider>
  );
}
