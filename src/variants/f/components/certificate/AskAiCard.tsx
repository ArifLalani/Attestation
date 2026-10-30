"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { tokens } from "@/variants/f/theme";
import { AiModelChips } from "./AssistantPanel";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CardTitle } from "./ReputationCard";

/** "Demandez à l'IA" card under the score: tapping an AI opens the chat answered "by" that AI. */
export function AskAiCard() {
  const t = useTranslations("Assistant");
  const { openAssistant } = useCertificate();
  return (
    <Box
      component="section"
      aria-labelledby="ask-ai-heading"
      sx={{
        bgcolor: tokens.blanc,
        borderRadius: "4px",
        boxShadow: tokens.shadowCardSoft,
        px: { xs: 1.5, md: 2 },
        py: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CardTitle bleedX={{ xs: 1.5, md: 2 }} id="ask-ai-heading" eyebrow={t("cardEyebrow")} heading={t("cardHeading")} />
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 2 }}>
        <Typography sx={{ fontSize: 15, color: tokens.texte, lineHeight: 1.5 }}>{t("cardText")}</Typography>
        <Box sx={{ flexShrink: 0 }}>
          <AiModelChips variant="buttons" onSelect={openAssistant} label={t("cardHeading")} />
        </Box>
      </Box>
    </Box>
  );
}
