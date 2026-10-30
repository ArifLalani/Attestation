"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import ArrowUpwardRounded from "@mui/icons-material/ArrowUpwardRounded";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { tokens } from "@/theme/theme";
import { askAssistantEvent } from "./AssistantPanel";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CardTitle } from "./ReputationCard";

/** "Une question sur cette agence ?": a simple chat box (structure from option C). Sending opens the assistant with the question. */
export function AskAiCard() {
  const t = useTranslations("Assistant");
  const { openAssistant } = useCertificate();
  const [draft, setDraft] = useState("");

  const send = () => {
    const question = draft.trim();
    openAssistant();
    if (question) window.dispatchEvent(new CustomEvent(askAssistantEvent, { detail: question }));
    setDraft("");
  };

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
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <CardTitle id="ask-ai-heading" eyebrow={t("cardEyebrow")} heading={t("cardHeading")} />
        <Typography sx={{ fontSize: 14, color: tokens.gris, lineHeight: "normal" }}>{t("cardText")}</Typography>
      </Box>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pl: 2,
          pr: 0.75,
          minHeight: 52,
          borderRadius: "999px",
          bgcolor: tokens.grisClair1,
          border: `1px solid ${tokens.grisMoyen1}`,
          transition: "border-color 150ms ease, background-color 150ms ease",
          "&:focus-within": { borderColor: tokens.bleuFonce, bgcolor: tokens.blanc },
        }}
      >
        <AutoAwesome aria-hidden sx={{ fontSize: 20, color: tokens.vertOs }} />
        <InputBase
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t("placeholder")}
          inputProps={{ "aria-label": t("cardHeading"), enterKeyHint: "send", maxLength: 300 }}
          sx={{ flex: 1, fontSize: 16, color: tokens.bleuFonce, "& input::placeholder": { color: tokens.gris, opacity: 1 } }}
        />
        <IconButton
          type="submit"
          aria-label={t("send")}
          sx={{ width: 40, height: 40, bgcolor: tokens.bleuFonce, color: tokens.blanc, "&:hover": { bgcolor: tokens.bleu600 } }}
        >
          <ArrowUpwardRounded sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
