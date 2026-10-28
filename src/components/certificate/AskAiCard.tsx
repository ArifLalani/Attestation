"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { tokens } from "@/theme/theme";
import { AiModelChips } from "./AssistantPanel";
import { useCertificate } from "./CertificateContext";
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
        borderRadius: "20px",
        boxShadow: tokens.shadowCardSoft,
        px: { xs: 1.5, md: 2 },
        py: 2,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "center" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        <CardTitle id="ask-ai-heading" eyebrow={t("cardEyebrow")} heading={t("cardHeading")} />
        <Typography sx={{ fontSize: 14, color: tokens.gris, lineHeight: "normal" }}>{t("cardText")}</Typography>
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <AiModelChips variant="buttons" onSelect={openAssistant} label={t("cardHeading")} />
      </Box>
    </Box>
  );
}
