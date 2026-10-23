"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CtaButton } from "@/components/ui/CtaButton";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { tokens } from "@/theme/theme";

/** Figma Ad (1433:130442). */
export function BusinessPitch() {
  const t = useTranslations("BusinessPitch");
  return (
    <Box component="section" aria-labelledby="business-pitch-title" sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, px: 1.5, py: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2, alignItems: "center" }}>
      <Typography id="business-pitch-title" component="h2" sx={{ gridColumn: "1 / -1", fontSize: 20, fontWeight: 600, lineHeight: "22.8px", letterSpacing: "-0.475px", textAlign: "center" }}>{t("title")}</Typography>
      <Box sx={{ position: "relative", height: { xs: 176.7, lg: "100%" }, minHeight: 176.7, borderRadius: "20px", overflow: "hidden", gridColumn: 1, gridRow: { lg: "2 / span 3" } }}>
        <Image src="/figma/business-illustration.png" alt="" fill sizes="(min-width: 1200px) 410px, (min-width: 900px) 600px, (min-width: 640px) 616px, 100vw" style={{ objectFit: "cover" }} />
      </Box>
      <Typography component="h3" sx={{ fontSize: 20, fontWeight: 600, lineHeight: "22.8px", letterSpacing: "-0.475px", textAlign: "center" }}>{t("heading")}</Typography>
      <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("description")}</Typography>
      <CtaButton href={opinionSystemLinks.signup} target="_blank" rel="noopener noreferrer">{t("signup")}</CtaButton>
    </Box>
  );
}
