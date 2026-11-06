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
export type Question = (typeof questions)[number];

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

/** Opens the visitor's own AI with a visible question about this page; the snackbar says when Gemini's was copied. */
export function useAskYourAi() {
  const t = useTranslations("VarianteFinale.askAi");
  const { agency } = useCertificate();
  const [copied, setCopied] = useState(false);
  const ask = (model: AiModel, question: Question) => {
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
  };
  const snackbar = <Snackbar open={copied} autoHideDuration={4000} onClose={() => setCopied(false)} message={t("copied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />;
  return { ask, snackbar };
}

/** The 5 AIs as square logo buttons. */
/** `phoneSize`: smaller squares under 900 px (the footer row on phones). */
function AiIconRow({ selected, onPick, size = 44, phoneSize }: { selected: AiModel | null; onPick: (model: AiModel) => void; size?: number; phoneSize?: number }) {
  const square = phoneSize ? { xs: phoneSize, md: size } : size;
  const small = (value: number) => value < 44;
  const logo = phoneSize ? { xs: small(phoneSize) ? 19 : 22, md: small(size) ? 19 : 22 } : small(size) ? 19 : 22;
  const gap = phoneSize ? { xs: small(phoneSize) ? 0.75 : 1, md: small(size) ? 0.75 : 1 } : small(size) ? 0.75 : 1;
  const t = useTranslations("VarianteFinale.askAi");
  const tm = useTranslations("Assistant.models");
  return (
    <Box component="ul" aria-label={t("listLabel")} sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexShrink: 0, gap }}>
      {aiModels.map((item) => (
        <li key={item}>
          <Tooltip title={tm(item)}>
            <ButtonBase
              aria-label={t("open", { model: tm(item) })}
              aria-haspopup="dialog"
              aria-expanded={selected === item}
              onClick={() => onPick(item)}
              sx={{ width: square, height: square, borderRadius: "8px", border: `1px solid ${selected === item ? tokens.bleuFonce : tokens.grisMoyen1}`, bgcolor: tokens.blanc, transition: "border-color 150ms ease, background-color 150ms ease", "&:hover": { bgcolor: tokens.grisClair1, borderColor: "#c9d7e0" }, "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } }}
            >
              <AiLogo model={item} sx={{ fontSize: logo }} />
            </ButtonBase>
          </Tooltip>
        </li>
      ))}
    </Box>
  );
}

/** "Que demander à ChatGPT ?": the 3 questions, then a note on what happens. */
function QuestionList({ model, onAsk }: { model: AiModel; onAsk: (question: Question) => void }) {
  const t = useTranslations("VarianteFinale.askAi");
  const tm = useTranslations("Assistant.models");
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {questions.map((question) => (
        <ButtonBase
          key={question}
          onClick={() => onAsk(question)}
          sx={{ justifyContent: "flex-start", gap: 1.5, px: 1.5, py: 1.25, borderRadius: "8px", textAlign: "left", fontFamily: "inherit", "&:hover": { bgcolor: tokens.grisClair1 }, "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: -2 } }}
        >
          <AiLogo model={model} sx={{ fontSize: 18, flexShrink: 0 }} />
          <Typography component="span" sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: tokens.bleuFonce }}>{t(`questions.${question}`)}</Typography>
          <ChevronRight sx={{ fontSize: 20, color: tokens.gris }} />
        </ButtonBase>
      ))}
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", px: 1.5, pt: 1, color: tokens.gris }}>
        <OpenInNew sx={{ fontSize: 16, mt: "2px" }} />
        <Typography sx={{ fontSize: 13, lineHeight: 1.45 }}>{model === "gemini" ? t("noteCopy") : t("note", { model: tm(model) })}</Typography>
      </Box>
    </Box>
  );
}

/**
 * "Demander à votre IA" (its own card, above the footer): the visitor opens their own AI with a visible question about this page,
 * which the AI answers by reading it. They choose the question first; nothing is hidden in it.
 */
export function AskYourAi() {
  const t = useTranslations("VarianteFinale.askAi");
  const tm = useTranslations("Assistant.models");
  const { agency } = useCertificate();
  const [model, setModel] = useState<AiModel | null>(null);
  const { ask, snackbar } = useAskYourAi();
  const close = () => setModel(null);

  return (
    // A white card like the others. Phones: the label, then the 5 logos (36 px) in one line under it. From 600 px: the label on the left, the logos (44 px on desktop) on the right.
    <Box sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 }, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: { xs: 1.25, sm: 2 } }}>
      <Typography sx={{ minWidth: 0, fontSize: 14, fontWeight: 500, lineHeight: 1.45, color: tokens.bleuFonce }}>
        {/* The agency and its city stay on one line. */}
        {t.rich("label", { name: agency.name, city: agency.city, agency: (chunks) => <Box component="span" sx={{ whiteSpace: "nowrap" }}>{chunks}</Box> })}
      </Typography>
      <AiIconRow selected={model} onPick={setModel} phoneSize={36} />
      {/* Desktop: a side sheet, like every other window; phones: a bottom sheet. */}
      <ResponsiveSheet open={model !== null} onClose={close} title={model ? t("title", { model: tm(model) }) : ""} closeLabel={t("close")} side>
        <Box sx={{ p: 1.5 }}>
          {model && <QuestionList model={model} onAsk={(question) => { ask(model, question); close(); }} />}
        </Box>
      </ResponsiveSheet>
      {snackbar}
    </Box>
  );
}

/** Inside the assistant, under the input: "Ou demandez à votre IA" and the 5 logos. */
export function AskYourAiRow({ selected, onPick }: { selected: AiModel | null; onPick: (model: AiModel) => void }) {
  const t = useTranslations("VarianteFinale.askAi");
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: 1, rowGap: 0.75 }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: tokens.bleuFonce }}>{t("orAsk")}</Typography>
      <AiIconRow selected={selected} onPick={onPick} size={36} />
    </Box>
  );
}

/** Inside the assistant, after a logo is picked: "Que demander à ChatGPT ?" and the 3 questions, in the panel. */
export function AskYourAiQuestions({ model, onAsk }: { model: AiModel; onAsk: (question: Question) => void }) {
  const t = useTranslations("VarianteFinale.askAi");
  const tm = useTranslations("Assistant.models");
  return (
    <>
      <Typography component="h3" sx={{ px: 1.5, pb: 0.5, fontSize: 18, fontWeight: 600, color: tokens.bleuFonce }}>{t("title", { model: tm(model) })}</Typography>
      <QuestionList model={model} onAsk={onAsk} />
    </>
  );
}
