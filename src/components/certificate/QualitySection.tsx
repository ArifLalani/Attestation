"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CtaButton } from "@/components/ui/CtaButton";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "./CertificateContext";
import { CardTitle } from "./ReputationCard";

const certifications = [
  { key: "nf", image: "/figma/nf-service.png", width: 48, height: 56 },
  { key: "iso20252", image: "/figma/iso-20252.svg", width: 48.4481, height: 54 },
  { key: "iso9001", image: "/figma/iso-9001.png", width: 48, height: 48 },
] as const;

/** Figma Démarche Qualité (1429:117212). Certifications belong to Opinion System. */
export function QualitySection() {
  const t = useTranslations("Quality");
  const { agency, reviews, goToSection, setFilters, setScoreCollaboratorId } = useCertificate();
  const recommendation = useMemo(() => {
    const surveys = reviews.filter((review) => review.status === "controle" && review.survey);
    return surveys.length ? Math.round(surveys.reduce((sum, review) => sum + review.survey!.recommendation, 0) / surveys.length) : null;
  }, [reviews]);

  return (
    <Box component="section" aria-labelledby="quality-title" sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, px: { xs: 1.5, lg: 2.5 }, py: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1.15fr)" }, gap: 2, alignItems: "start" }}>
      <CardTitle id="quality-title" eyebrow={t("eyebrow")} heading={t("heading", { name: agency.name })} />
      <Typography sx={{ fontSize: 14, color: tokens.gris, lineHeight: "normal", gridColumn: 1 }}>{t("description")}</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", gridColumn: 1, py: 1 }}>
        <Image src="/figma/quality-badge.png" alt={t("badgeAlt")} width={134} height={134} unoptimized />
        <Box sx={{ flex: "1 1 139px", minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
          <Image src="/figma/os-logo.png" alt="Opinion System" width={139} height={56} unoptimized />
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t("verified")}</Typography>
          {recommendation !== null && <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: 1, px: 1.5, py: 0.5, borderRadius: "4px", bgcolor: tokens.bleu20, border: `1px solid ${tokens.bleu400}` }}>
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>{t("recommendation")}</Typography>
            <Typography component="span" sx={{ fontSize: 20, fontWeight: 600 }}>{recommendation}<Box component="span" sx={{ fontSize: 14 }}>%</Box></Typography>
          </Box>}
        </Box>
      </Box>
      {/* Right column on desktop: the certifications, then "Lire les avis clients" right under them. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, gridColumn: { xs: 1, lg: 2 }, gridRow: { lg: "1 / span 3" } }}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {certifications.map((certification) => <Box component="li" key={certification.key}>
            <Link href={opinionSystemLinks.certifications} target="_blank" rel="noopener noreferrer" underline="none" sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, alignItems: "center", p: 1.5, borderRadius: "16px", border: `1px solid ${tokens.grisMoyen1}`, color: tokens.bleuFonce, "&:hover": { bgcolor: tokens.grisClair1, borderColor: tokens.bleu30 }, "&:focus-visible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } }}>
              <Box sx={{ width: 49, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                <Image src={certification.image} alt="" width={certification.width} height={certification.height} unoptimized />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>{t(`certifications.${certification.key}.title`)}</Typography>
                <Typography sx={{ fontSize: 14 }}>{t(`certifications.${certification.key}.description`)}</Typography>
              </Box>
              <FigmaIcon name="certification-chevron" />
            </Link>
          </Box>)}
        </Box>
        <CtaButton onClick={() => { setFilters(emptyFilters); setScoreCollaboratorId(undefined); goToSection("avis"); }}>{t("readReviews")}</CtaButton>
      </Box>
    </Box>
  );
}
