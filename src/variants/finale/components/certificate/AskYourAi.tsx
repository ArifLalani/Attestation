"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Radio from "@mui/material/Radio";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { tokens } from "@/theme/theme";
import { AiLogo, aiModels, type AiModel } from "@/variants/finale/components/ui/AiLogo";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";

const questions = ["reviews", "team", "agencies", "custom"] as const;
type Question = (typeof questions)[number];
const CUSTOM_MAX = 200;

/**
 * Where each AI receives a ready-made question. These are the AIs' own web links: on a phone where the AI's app is
 * installed, iOS and Android hand the link to the app; otherwise it opens in the browser.
 * Gemini has no official way to receive one: the question is copied and Gemini opens empty, for the visitor to paste it.
 */
const aiUrl: Record<AiModel, ((prompt: string) => string) | null> = {
  chatgpt: (prompt) => `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
  claude: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  gemini: null,
  lechat: (prompt) => `https://chat.mistral.ai/chat?q=${encodeURIComponent(prompt)}`,
  perplexity: (prompt) => `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
};
const geminiUrl = "https://gemini.google.com/app";

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;

/** "1. Choisissez votre IA": the 5 AIs as tiles (logo over the name), one chosen. */
function AiChoice({ value, onChange, labelId }: { value: AiModel; onChange: (model: AiModel) => void; labelId: string }) {
  const tm = useTranslations("Assistant.models");
  return (
    <Box role="radiogroup" aria-labelledby={labelId} sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 1 }}>
      {aiModels.map((model) => {
        const selected = value === model;
        return (
          <ButtonBase
            key={model}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(model)}
            sx={{
              flexDirection: "column",
              gap: 0.75,
              minWidth: 0,
              px: 0.25,
              pt: 1.5,
              pb: 1.25,
              borderRadius: "12px",
              border: `1px solid ${selected ? tokens.bleuFonce : tokens.grisMoyen1}`,
              boxShadow: selected ? `inset 0 0 0 1px ${tokens.bleuFonce}` : "none",
              bgcolor: selected ? tokens.grisClair1 : tokens.blanc,
              fontFamily: "inherit",
              transition: "border-color 150ms ease, background-color 150ms ease",
              "&:hover": { bgcolor: tokens.grisClair1 },
              ...focusSx,
            }}
          >
            <AiLogo model={model} sx={{ fontSize: 24 }} />
            <Box component="span" sx={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: { xs: 11.5, sm: 13 }, fontWeight: selected ? 600 : 500, color: tokens.bleuFonce }}>
              {tm(model)}
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/** "2. Choisissez votre question": the 3 ready-made questions and "Poser ma propre question" (a field opens under it). */
function QuestionChoice({ value, onChange, custom, onCustomChange, labelId }: { value: Question; onChange: (question: Question) => void; custom: string; onCustomChange: (text: string) => void; labelId: string }) {
  const t = useTranslations("VarianteFinale.askAi");
  const name = useId();
  return (
    <Box role="radiogroup" aria-labelledby={labelId} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {questions.map((question) => {
        const selected = value === question;
        return (
          <Box key={question} sx={{ borderRadius: "12px", border: `1px solid ${selected ? tokens.bleuFonce : tokens.grisMoyen1}`, boxShadow: selected ? `inset 0 0 0 1px ${tokens.bleuFonce}` : "none", bgcolor: selected ? tokens.grisClair1 : tokens.blanc, transition: "border-color 150ms ease, background-color 150ms ease" }}>
            <Box component="label" sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 0.5, pr: 1.5, minHeight: 52, cursor: "pointer" }}>
              <Radio name={name} checked={selected} onChange={() => onChange(question)} sx={{ color: tokens.gris, "&.Mui-checked": { color: tokens.bleuFonce } }} />
              <Typography component="span" sx={{ fontSize: 15, fontWeight: selected ? 600 : 500, color: tokens.bleuFonce }}>{t(`questions.${question}`)}</Typography>
            </Box>
            {question === "custom" && selected && (
              <Box sx={{ px: 1.5, pb: 1.5 }}>
                <TextField
                  autoFocus
                  fullWidth
                  multiline
                  minRows={2}
                  label={t("customLabel")}
                  placeholder={t("customPlaceholder")}
                  value={custom}
                  onChange={(event) => onCustomChange(event.target.value)}
                  helperText={`${custom.length}/${CUSTOM_MAX}`}
                  slotProps={{ htmlInput: { maxLength: CUSTOM_MAX }, formHelperText: { sx: { textAlign: "right" } } }}
                  sx={{ "& .MuiInputBase-root": { bgcolor: tokens.blanc } }}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * The "Demandez à votre IA" sheet: what it is, then the AI and the question; the button opens that AI
 * (its app on a phone where it is installed) with the question ready to send. Opened by the card and by the floating card.
 */
function AskYourAiSheet({ question, setQuestion, onCopied }: { question: Question; setQuestion: (question: Question) => void; onCopied: () => void }) {
  const t = useTranslations("VarianteFinale.askAi");
  const tm = useTranslations("Assistant.models");
  const { agency, panel, setPanel, assistantModel: model, setAssistantModel } = useCertificate();
  const [custom, setCustom] = useState("");
  const aiLabelId = useId();
  const questionLabelId = useId();
  const close = () => setPanel(null);

  const ready = question !== "custom" || custom.trim().length > 0;
  // The page as published, without the hash or the query (built on the client, at the tap).
  const prompt = () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    return question === "custom" ? t("prompts.custom", { question: custom.trim(), name: agency.name, city: agency.city, url }) : t(`prompts.${question}`, { name: agency.name, city: agency.city, url });
  };
  const build = aiUrl[model];

  const stepTitle = { fontSize: 16, fontWeight: 600, lineHeight: 1.4, color: tokens.bleuFonce } as const;

  return (
    <ResponsiveSheet
      open={panel === "assistant"}
      onClose={close}
      title={t("sheetTitle")}
      closeLabel={t("close")}
      footer={
        <Box sx={{ p: 2, pt: 1.5, flexShrink: 0, borderTop: `1px solid ${tokens.grisMoyen1}`, display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.45, color: tokens.gris }}>{model === "gemini" ? t("noteCopy") : t("note", { model: tm(model) })}</Typography>
          <Box sx={{ display: "flex", gap: 1.5, "& > *": { flex: 1 } }}>
            <CtaButton variant="secondary" icon={null} onClick={close}>
              {t("close")}
            </CtaButton>
            {/* A real link, so the phone can hand it to the AI's app. */}
            <CtaButton
              href={build ? "#" : geminiUrl}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!ready}
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                const text = prompt();
                if (build) {
                  event.currentTarget.setAttribute("href", build(text));
                } else {
                  void navigator.clipboard?.writeText(text);
                  onCopied();
                }
                close();
              }}
            >
              {t("openButton", { model: tm(model) })}
            </CtaButton>
          </Box>
        </Box>
      }
    >
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: tokens.bleuFonce }}>
          {t.rich("intro", { name: agency.name, city: agency.city, b: (chunks) => <Box component="strong" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{chunks}</Box> })}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography id={aiLabelId} component="h3" sx={stepTitle}>{t("stepAi")}</Typography>
          <AiChoice value={model} onChange={setAssistantModel} labelId={aiLabelId} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography id={questionLabelId} component="h3" sx={stepTitle}>{t("stepQuestion")}</Typography>
          <QuestionChoice value={question} onChange={setQuestion} custom={custom} onCustomChange={setCustom} labelId={questionLabelId} />
        </Box>
      </Box>
    </ResponsiveSheet>
  );
}

/** Anchor of the card. */
export const askYourAiId = "demander-ia";

const readyMade = ["reviews", "team", "agencies"] as const;

/**
 * "Demandez à votre IA" (its own card, under the hero), in the style of "Vous êtes une entreprise ?": side by side at every size,
 * the pitch on the left, the 5 AIs as white tiles on the right, the ready-made questions as pills. Every part opens the sheet:
 * a tile with that AI chosen, a pill with that question chosen.
 * Phones: compact (no description, a short button, small logo tiles 3 + 2, no question pills: the sheet has them).
 * Tablets: the same with the description and named tiles. From 900 px: two halves, the 5 tiles in a row with the pills under them.
 */
export function AskYourAi() {
  const t = useTranslations("VarianteFinale.askAi");
  const tm = useTranslations("Assistant.models");
  const { agency, openAssistant } = useCertificate();
  const [question, setQuestion] = useState<Question>("reviews");
  const [copied, setCopied] = useState(false);
  const titleId = useId();

  return (
    <Box
      component="section"
      id={askYourAiId}
      aria-labelledby={titleId}
      sx={{
        position: "relative",
        scrollMarginTop: `${tokens.headerHeight + 16}px`,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: tokens.shadowCardSoft,
        background: "linear-gradient(160deg, #0c2d68 0%, #041b44 55%, #03163a 100%)",
        color: tokens.blanc,
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr) auto", md: "minmax(0, 1fr) minmax(0, 1fr)" },
        gridTemplateRows: { xs: "auto", sm: "auto auto", md: "1fr auto auto 1fr" },
        gridTemplateAreas: { xs: '"pitch tiles"', sm: '"pitch tiles" "pills pills"', md: '"pitch ." "pitch tiles" "pitch pills" "pitch ."' },
      }}
    >
      {/* A soft green and blue glow behind the tiles. */}
      <Box aria-hidden sx={{ position: "absolute", top: { xs: "38%", md: "50%" }, right: { xs: 96, sm: 120, md: "25%" }, width: { xs: 220, md: 360 }, height: { xs: 220, md: 360 }, transform: "translate(50%, -50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(109, 211, 193, 0.28) 0, rgba(44, 149, 255, 0.12) 45%, transparent 70%)", pointerEvents: "none" }} />

      <Box sx={{ gridArea: "pitch", position: "relative", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: { xs: 1, md: 1.5 }, pl: { xs: 2, sm: 3, md: 4.5 }, pr: { xs: 0, md: 4.5 }, pt: { xs: 2.5, sm: 3, md: 4.5 }, pb: { xs: 2.5, sm: 2, md: 4.5 } }}>
        <Typography id={titleId} component="h2" sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: { xs: 11, md: 12 }, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6dd3c1" }}>
          <AutoAwesome sx={{ fontSize: 15 }} />
          {t("eyebrow")}
        </Typography>
        <Typography component="h3" sx={{ fontSize: { xs: 18, sm: 22, md: 28 }, "@media (max-width:374.95px)": { fontSize: 16 }, fontWeight: 700, lineHeight: 1.2, letterSpacing: { xs: "-0.3px", md: "-0.5px" }, textWrap: "balance" }}>{t("heading", { name: agency.name })}</Typography>
        <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: 14, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.82)" }}>{t("text")}</Typography>
        <CtaButton onClick={() => openAssistant()} aria-haspopup="dialog" sx={{ mt: { xs: 0.5, md: 1.5 }, width: "auto", alignSelf: "flex-start", px: { xs: 1.75, md: 2.5 } }}>
          <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>{t("ctaShort")}</Box>
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{t("cta")}</Box>
        </CtaButton>
      </Box>

      {/* Phones and tablets: 3 + 2 tiles (logos only on phones); from 900 px: the 5 in a row, every other one a little lower. */}
      <Box
        component="ul"
        aria-label={t("listLabel")}
        sx={{
          gridArea: "tiles",
          position: "relative",
          alignSelf: "center",
          justifySelf: "center",
          listStyle: "none",
          m: 0,
          pl: { xs: 1.5, sm: 2, md: 4.5 },
          pr: { xs: 2, sm: 3, md: 4.5 },
          pt: { xs: 2.5, sm: 2, md: 0 },
          pb: { xs: 2.5, sm: 0, md: 1.75 },
          display: "flex",
          flexWrap: { xs: "wrap", md: "nowrap" },
          justifyContent: "center",
          width: { xs: 46 * 3 + 6 * 2 + 12 + 16, sm: 66 * 3 + 8 * 2 + 16 + 24, md: "auto" },
          gap: { xs: 0.75, sm: 1, md: 1.25 },
          // Small phones: smaller tiles, so the title keeps room.
          "@media (max-width:374.95px)": { width: 38 * 3 + 5 * 2 + 10 + 16, gap: "5px", pl: 1.25, "& li": { width: 38 }, "& .MuiButtonBase-root": { height: 38, borderRadius: "10px" }, "& svg": { fontSize: 18 } },
        }}
      >
        {aiModels.map((model, index) => (
          <Box component="li" key={model} sx={{ width: { xs: 46, sm: 66, md: 76 } }}>
            <ButtonBase
              onClick={() => openAssistant(model)}
              aria-haspopup="dialog"
              aria-label={t("askWith", { model: tm(model) })}
              sx={{
                width: "100%",
                height: { xs: 46, sm: 66, md: 84 },
                flexDirection: "column",
                gap: { sm: 0.75, md: 1 },
                borderRadius: { xs: "12px", md: "14px" },
                bgcolor: tokens.blanc,
                color: tokens.bleuFonce,
                fontFamily: "inherit",
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
                transform: { md: index % 2 ? "translateY(14px)" : "none" },
                transition: "box-shadow 200ms ease",
                "&:hover": { boxShadow: "0 14px 30px rgba(0, 0, 0, 0.35), 0 0 0 2px #6dd3c1" },
                "&.Mui-focusVisible": { outline: "3px solid #6dd3c1", outlineOffset: 2 },
              }}
            >
              <AiLogo model={model} sx={{ fontSize: { xs: 22, sm: 24, md: 30 } }} />
              <Box component="span" sx={{ display: { xs: "none", sm: "block" }, maxWidth: "100%", px: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: { sm: 10, md: 11 }, fontWeight: 600 }}>{tm(model)}</Box>
            </ButtonBase>
          </Box>
        ))}
      </Box>

      <Box component="ul" aria-label={t("questionsLabel")} sx={{ gridArea: "pills", position: "relative", listStyle: "none", m: 0, px: { sm: 3, md: 4.5 }, pt: { sm: 0.5, md: 3 }, pb: { sm: 3, md: 0 }, display: { xs: "none", sm: "flex" }, flexWrap: "wrap", justifyContent: { xs: "flex-start", md: "center" }, gap: 1 }}>
        {readyMade.map((item) => (
          <li key={item}>
            <ButtonBase
              onClick={() => { setQuestion(item); openAssistant(); }}
              aria-haspopup="dialog"
              sx={{ px: { xs: 1.25, md: 1.5 }, py: { xs: 0.75, md: 1 }, borderRadius: "999px", fontFamily: "inherit", fontSize: { xs: 12, md: 12.5 }, fontWeight: 500, color: tokens.blanc, bgcolor: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.22)", transition: "background-color 150ms ease", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.18)" }, "&.Mui-focusVisible": { outline: "3px solid #6dd3c1", outlineOffset: 2 } }}
            >
              {t(`questions.${item}`)}
            </ButtonBase>
          </li>
        ))}
      </Box>

      <AskYourAiSheet question={question} setQuestion={setQuestion} onCopied={() => setCopied(true)} />
      <Snackbar open={copied} autoHideDuration={4000} onClose={() => setCopied(false)} message={t("copied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
