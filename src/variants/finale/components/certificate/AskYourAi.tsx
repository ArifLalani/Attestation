"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ChevronRight from "@mui/icons-material/ChevronRight";
import OpenInNew from "@mui/icons-material/OpenInNew";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { tokens } from "@/theme/theme";
import { AiLogo, aiModels, type AiModel } from "@/variants/finale/components/ui/AiLogo";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";

const questions = ["reviews", "team", "agencies"] as const;
type Question = (typeof questions)[number];

/**
 * Where each AI receives a ready-made question. Gemini has no official way to receive one:
 * the question is copied and Gemini opens empty, for the visitor to paste it.
 */
const aiUrl: Record<AiModel, ((prompt: string) => string) | null> = {
  chatgpt: (prompt) => `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
  claude: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  gemini: null,
  lechat: (prompt) => `https://chat.mistral.ai/chat?q=${encodeURIComponent(prompt)}`,
  perplexity: (prompt) => `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
};
const geminiUrl = "https://gemini.google.com/app";

/**
 * "Demander à votre IA": the visitor opens their own AI with a visible question about this page,
 * which the AI answers by reading it. They choose the question first; nothing is hidden in it.
 */
export function AskYourAi() {
  const t = useTranslations("VarianteFinale.askAi");
  const tm = useTranslations("Assistant.models");
  const { agency } = useCertificate();
  const [model, setModel] = useState<AiModel | null>(null);
  const [copied, setCopied] = useState(false);
  const close = () => setModel(null);

  const ask = (question: Question) => {
    if (!model) return;
    // The page as published, without the hash or the query.
    const url = `${window.location.origin}${window.location.pathname}`;
    const prompt = t(`prompts.${question}`, { name: agency.name, city: agency.city, url });
    const build = aiUrl[model];
    if (build) {
      window.open(build(prompt), "_blank", "noopener");
    } else {
      void navigator.clipboard?.writeText(prompt);
      setCopied(true);
      window.open(geminiUrl, "_blank", "noopener");
    }
    close();
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, gap: { xs: 1.5, sm: 2 } }}>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: tokens.bleuFonce, textAlign: "center" }}>{t("label", { name: agency.name, city: agency.city })}</Typography>
      <Box component="ul" aria-label={t("listLabel")} sx={{ listStyle: "none", m: 0, p: 0, display: "flex", gap: 1 }}>
        {aiModels.map((item) => (
          <li key={item}>
            <Tooltip title={tm(item)}>
              <ButtonBase
                aria-label={t("open", { model: tm(item) })}
                aria-haspopup="dialog"
                aria-expanded={model === item}
                onClick={() => setModel(item)}
                sx={{ width: 44, height: 44, borderRadius: "8px", border: `1px solid ${model === item ? tokens.bleuFonce : tokens.grisMoyen1}`, bgcolor: tokens.blanc, transition: "border-color 150ms ease, background-color 150ms ease", "&:hover": { bgcolor: tokens.grisClair1, borderColor: "#c9d7e0" }, "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } }}
              >
                <AiLogo model={item} sx={{ fontSize: 22 }} />
              </ButtonBase>
            </Tooltip>
          </li>
        ))}
      </Box>

      <ResponsiveSheet
        open={model !== null}
        onClose={close}
        title={model ? t("title", { model: tm(model) }) : ""}
        closeLabel={t("close")}
        side
      >
        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>{/* Desktop: a side sheet, like every other window; phones: a bottom sheet. */}
          {questions.map((question) => (
            <ButtonBase
              key={question}
              onClick={() => ask(question)}
              sx={{ justifyContent: "flex-start", gap: 1.5, px: 1.5, py: 1.25, borderRadius: "8px", textAlign: "left", fontFamily: "inherit", "&:hover": { bgcolor: tokens.grisClair1 }, "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: -2 } }}
            >
              {model && <AiLogo model={model} sx={{ fontSize: 18, flexShrink: 0 }} />}
              <Typography component="span" sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: tokens.bleuFonce }}>{t(`questions.${question}`)}</Typography>
              <ChevronRight sx={{ fontSize: 20, color: tokens.gris }} />
            </ButtonBase>
          ))}
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", px: 1.5, pt: 1, color: tokens.gris }}>
            <OpenInNew sx={{ fontSize: 16, mt: "2px" }} />
            <Typography sx={{ fontSize: 13, lineHeight: 1.45 }}>{model === "gemini" ? t("noteCopy") : t("note", { model: model ? tm(model) : "" })}</Typography>
          </Box>
        </Box>
      </ResponsiveSheet>
      <Snackbar open={copied} autoHideDuration={4000} onClose={() => setCopied(false)} message={t("copied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
