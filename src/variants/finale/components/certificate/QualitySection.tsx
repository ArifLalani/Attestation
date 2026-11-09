"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { CardTitle } from "./ReputationCard";

const certifications = [
  { key: "nf", image: "/figma/nf-service.png", width: 48, height: 56 },
  { key: "iso20252", image: "/figma/iso-20252.svg", width: 48, height: 54 },
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
    <Box component="section" aria-labelledby="quality-title" sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, px: { xs: 1.5, md: 2 }, py: { xs: 1.5, md: 2 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }, columnGap: 4, rowGap: 2, alignItems: "start" }}>
      <CardTitle id="quality-title" eyebrow={t("eyebrow")} heading={t("heading", { name: agency.name })} />
      <Typography sx={{ fontSize: 14, color: tokens.gris, lineHeight: "normal", gridColumn: 1 }}>{t("description")}</Typography>
      <Box component="hr" sx={{ gridColumn: 1, m: 0, border: 0, borderTop: `1px solid ${tokens.grisMoyen1}` }} />
      {/* The Opinion System box: an outlined card with the badge, the logo, "Avis contrôlés" in green,
          then "Niveau de Recommandation" with its percentage on the same line and the bar underneath. */}
      <Box sx={{ gridColumn: 1, display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: { xs: 1.5, sm: 2 }, alignItems: "center", p: { xs: 1.5, sm: 2 }, borderRadius: "16px", border: "1px solid #d6e4f3", background: "linear-gradient(135deg, #ffffff 45%, rgba(67, 182, 163, 0.1) 100%)" }}>
        <Box sx={{ width: { xs: 96, sm: 112 }, height: { xs: 96, sm: 112 }, position: "relative", flexShrink: 0 }}>
          <Image src="/figma/quality-badge.png" alt={t("badgeAlt")} fill sizes="112px" unoptimized style={{ objectFit: "contain" }} />
        </Box>
        <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Image src="/figma/os-logo.png" alt="Opinion System" width={119} height={48} unoptimized />
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.vertOs, lineHeight: 1.35 }}>{t("verified")}</Typography>
          {recommendation !== null && <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleuFonce }}>{t("recommendation")}</Typography>
              <Typography component="span" sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: tokens.bleuFonce, whiteSpace: "nowrap" }}>{recommendation}{"\u202f"}%</Typography>
            </Box>
            <Box aria-hidden sx={{ height: 10, borderRadius: "5px", bgcolor: tokens.blanc, border: `1px solid ${tokens.grisMoyen1}`, overflow: "hidden" }}>
              <Box sx={{ width: `${recommendation}%`, height: "100%", borderRadius: "5px", background: `linear-gradient(90deg, ${tokens.bleu400}, ${tokens.vertOs})` }} />
            </Box>
          </Box>}
        </Box>
      </Box>
      {/* Right column on desktop: the certifications, then "Lire les avis clients" at the bottom, level with the badge. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, gridColumn: { xs: 1, lg: 2 }, gridRow: { lg: "1 / span 4" }, alignSelf: "stretch" }}>
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
        <CtaButton variant="secondary" sx={{ mt: { lg: "auto" } }} onClick={() => { setFilters(emptyFilters); setScoreCollaboratorId(undefined); goToSection("avis"); }}>{t("readReviews")}</CtaButton>
      </Box>
    </Box>
  );
}
