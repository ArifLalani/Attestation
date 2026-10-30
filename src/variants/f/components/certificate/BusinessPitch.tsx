"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CtaButton } from "@/variants/f/components/ui/CtaButton";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { tokens } from "@/variants/f/theme";

/** Figma Ad (1433:130442), as the live page's navy "Pour les entreprises" band. */
export function BusinessPitch() {
  const t = useTranslations("BusinessPitch");
  const tf = useTranslations("VarianteF");
  return (
    <Box component="section" aria-labelledby="business-pitch-title" sx={{ color: tokens.blanc, background: `url(/variantes/f/bg-band.svg) center bottom / 100% 100% no-repeat, linear-gradient(120deg, ${tokens.marine}, ${tokens.bleuOs})`, borderRadius: tokens.radiusCard, boxShadow: tokens.shadowCardSoft, px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }, columnGap: 4, rowGap: 2 }}>
      <Box sx={{ position: "relative", height: { xs: 176.7, lg: "auto" }, aspectRatio: { lg: "522 / 274" }, borderRadius: "4px", overflow: "hidden" }}>
        <Image src="/figma/business-illustration.png" alt="" fill sizes="(min-width: 1200px) 530px, (min-width: 640px) 616px, 100vw" style={{ objectFit: "cover" }} />
      </Box>
      {/* Phones: these flow into the card (title first, above the illustration). Desktop: one column, button at the bottom. */}
      <Box sx={{ display: { xs: "contents", lg: "flex" }, flexDirection: "column", gap: 2 }}>
        <Typography id="business-pitch-title" component="h2" sx={{ order: { xs: -1, lg: 0 }, fontSize: { xs: 22, md: 26 }, fontWeight: 300, lineHeight: 1.2, textTransform: "uppercase", textAlign: "center" }}>{tf("pitchEyebrow")}</Typography>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <Typography component="h3" sx={{ fontSize: 18, fontWeight: 500, lineHeight: 1.3, textAlign: "center" }}>{t("title")} {t("heading")}</Typography>
          <Typography sx={{ fontSize: 15, color: "#dce7f5", textAlign: "center", lineHeight: 1.5 }}>{t("description")}</Typography>
        </Box>
        <CtaButton href={opinionSystemLinks.signup} target="_blank" rel="noopener noreferrer">{t("signup")}</CtaButton>
      </Box>
    </Box>
  );
}
