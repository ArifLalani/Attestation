"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { tokens } from "@/theme/theme";

/**
 * "Vous êtes une entreprise ?": a split card, the pitch on a navy gradient on the left and the shop illustration on the right.
 * Phones: the pitch first, the illustration under it.
 */
export function BusinessPitch() {
  const t = useTranslations("BusinessPitch");
  return (
    <Box component="section" aria-labelledby="business-pitch-title" sx={{ borderRadius: "20px", overflow: "hidden", boxShadow: tokens.shadowCardSoft, bgcolor: tokens.blanc, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" } }}>
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 1.5, px: { xs: 2.5, md: 4.5 }, py: { xs: 3, md: 4.5 }, color: tokens.blanc, background: "linear-gradient(160deg, #0c2d68 0%, #041b44 55%, #03163a 100%)" }}>
        <Typography id="business-pitch-title" component="h2" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6dd3c1" }}>{t("title")}</Typography>
        <Typography component="h3" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.5px", color: tokens.blanc }}>{t("heading")}</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.82)" }}>{t("description")}</Typography>
        <CtaButton href={opinionSystemLinks.signup} target="_blank" rel="noopener noreferrer" sx={{ mt: 1.5, width: { xs: "100%", sm: "auto" }, alignSelf: "flex-start", px: 2.5 }}>{t("signup")}</CtaButton>
      </Box>
      <Box sx={{ position: "relative", minHeight: { xs: 200, sm: 260, md: 300 }, bgcolor: "#eaf3fd" }}>
        <Image src="/figma/business-illustration.png" alt="" fill sizes="(min-width: 900px) 600px, 100vw" style={{ objectFit: "cover" }} />
      </Box>
    </Box>
  );
}
