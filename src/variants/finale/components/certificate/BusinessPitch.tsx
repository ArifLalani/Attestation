"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { tokens } from "@/theme/theme";

/** Figma Ad (1433:130442). */
export function BusinessPitch() {
  const t = useTranslations("BusinessPitch");
  return (
    <Box component="section" aria-labelledby="business-pitch-title" sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, px: { xs: 1.5, md: 2 }, py: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }, columnGap: 4, rowGap: 2 }}>
      <Box sx={{ position: "relative", height: { xs: 176.7, lg: "auto" }, aspectRatio: { lg: "522 / 274" }, borderRadius: "20px", overflow: "hidden" }}>
        <Image src="/figma/business-illustration.png" alt="" fill sizes="(min-width: 1200px) 530px, (min-width: 640px) 616px, 100vw" style={{ objectFit: "cover" }} />
      </Box>
      {/* Phones: these flow into the card (title first, above the illustration). Desktop: one column, button at the bottom. */}
      <Box sx={{ display: { xs: "contents", lg: "flex" }, flexDirection: "column", gap: 2 }}>
        <Typography id="business-pitch-title" component="h2" sx={{ order: { xs: -1, lg: 0 }, fontSize: 20, fontWeight: 600, lineHeight: "22.8px", letterSpacing: "-0.475px", textAlign: "center" }}>{t("title")}</Typography>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <Typography component="h3" sx={{ fontSize: 20, fontWeight: 600, lineHeight: "22.8px", letterSpacing: "-0.475px", textAlign: "center" }}>{t("heading")}</Typography>
          <Typography sx={{ fontSize: 14, color: tokens.gris, textAlign: { lg: "center" } }}>{t("description")}</Typography>
        </Box>
        <CtaButton href={opinionSystemLinks.signup} target="_blank" rel="noopener noreferrer">{t("signup")}</CtaButton>
      </Box>
    </Box>
  );
}
