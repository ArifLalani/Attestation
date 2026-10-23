"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { getAgency } from "@/data/agencies";
import { useScrollSpy } from "@/lib/hooks";
import { tokens } from "@/theme/theme";
import { AppHeader, pageColumnSx } from "./AppHeader";
import { BusinessCard } from "./BusinessCard";
import { CertificateProvider, sectionIds, type SectionId } from "./CertificateContext";
import { ReputationCard } from "./ReputationCard";

const sectionSx = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  scrollMarginTop: `${tokens.headerHeight + 16}px`,
} as const;

function Placeholder({ id }: { id: "avis" | "agences" | "qualite" }) {
  const t = useTranslations("Placeholder");
  return (
    <Box sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, p: 3, minHeight: 240, display: "grid", placeItems: "center" }}>
      <Typography sx={{ color: tokens.gris, fontSize: 14, textAlign: "center" }}>{t(id)}</Typography>
    </Box>
  );
}

export function CertificatePage({ agencyId }: { agencyId: string }) {
  const agency = getAgency(agencyId)!;
  const { active, goTo } = useScrollSpy(sectionIds, tokens.headerHeight + 16);
  const goToSection = goTo as (id: SectionId) => void;

  return (
    <CertificateProvider agency={agency} goToSection={goToSection}>
      <AppHeader active={active as SectionId} onSelect={goToSection} />
      <Box component="main" sx={{ ...pageColumnSx, px: 1.5, pt: 2, pb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box id="synthese" sx={sectionSx}>
          <BusinessCard />
          <ReputationCard />
        </Box>
        <Box id="avis" sx={sectionSx}>
          <Placeholder id="avis" />
        </Box>
        <Box id="agences" sx={sectionSx}>
          <Placeholder id="agences" />
        </Box>
        <Box id="qualite" sx={sectionSx}>
          <Placeholder id="qualite" />
        </Box>
      </Box>
    </CertificateProvider>
  );
}
