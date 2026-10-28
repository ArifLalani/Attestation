"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { keyframes } from "@mui/material/styles";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Close from "@mui/icons-material/Close";
import RestartAlt from "@mui/icons-material/RestartAlt";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { AiLogo, aiModels, type AiModel } from "@/components/ui/AiLogo";
import type { Criterion, Product } from "@/data/types";
import { buildAnswer, detectIntent, quickQuestions, type AnswerBlock, type AnswerContext, type AnswerTarget, type Intent, type QuickQuestionKey } from "@/lib/assistant";
import { formatCount, formatScore } from "@/lib/format";
import { focusRing, pc } from "./theme";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; model: AiModel; blocks: AnswerBlock[]; suggest: boolean };

const THINKING_MS = 900;
const BLOCK_MS = 260;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-3px); opacity: 1; }
`;

/** One AI as an outlined pill with its logo. `selected` = inside the chat (radio). */
function ModelPill({ model, selected, onClick, ariaLabel }: { model: AiModel; selected?: boolean; onClick: () => void; ariaLabel?: string }) {
  const t = useTranslations("Assistant.models");
  return (
    <ButtonBase
      role={selected === undefined ? undefined : "radio"}
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      sx={{
        flexShrink: 0,
        minHeight: 44,
        gap: 1,
        pl: 1.5,
        pr: 2,
        borderRadius: 999,
        border: `1px solid ${selected ? "transparent" : pc.outlineStrong}`,
        bgcolor: selected ? pc.indigoTonal : "#fff",
        color: selected ? pc.indigoDark : pc.ink,
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: "nowrap",
        transition: "background-color 150ms ease, border-color 150ms ease, transform 120ms ease",
        "&:hover": { bgcolor: selected ? pc.indigoTonal : pc.indigoSoft },
        "&:active": { transform: "scale(0.97)" },
        "&.Mui-focusVisible": focusRing,
      }}
    >
      <AiLogo model={model} sx={{ fontSize: 20 }} />
      {t(model)}
    </ButtonBase>
  );
}

/** "Demander à l'IA" card, in Présentation. */
export function AskAiCard() {
  const t = useTranslations("Assistant");
  const tv = useTranslations("VarianteC");
  const { openAssistant } = useCertificate();
  return (
    <Box
      component="section"
      aria-labelledby="vc-ai-title"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        p: { xs: 2, sm: 3 },
        bgcolor: pc.surface,
        border: `1px solid ${pc.outline}`,
        backgroundImage: `radial-gradient(120% 140% at 100% 0%, ${pc.indigoTonal} 0%, rgba(232,231,253,0) 55%), radial-gradient(90% 120% at 0% 100%, ${pc.emeraldTint} 0%, rgba(227,245,238,0) 50%)`,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: pc.indigoDark }}>
        <AutoAwesome sx={{ fontSize: 20 }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>{t("cardEyebrow")}</Typography>
      </Box>
      <Box>
        <Typography id="vc-ai-title" component="h2" sx={{ fontSize: { xs: 22, md: 24 }, fontWeight: 700, lineHeight: 1.25 }}>{t("cardHeading")}</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 15, color: pc.muted }}>{t("cardText")}</Typography>
      </Box>
      <ButtonBase
        onClick={() => openAssistant()}
        sx={{ justifyContent: "flex-start", gap: 1.5, minHeight: 52, pl: 2, pr: 1, borderRadius: 999, bgcolor: "#fff", border: `1px solid ${pc.outlineStrong}`, color: pc.muted, fontSize: 16, textAlign: "left", boxShadow: "0 1px 2px rgba(27,31,42,0.06)", "&:hover": { borderColor: pc.indigo }, "&.Mui-focusVisible": focusRing }}
      >
        <AutoAwesome sx={{ fontSize: 20, color: pc.indigo }} />
        <Box component="span" sx={{ flex: 1 }}>{t("placeholder")}</Box>
        <Box component="span" sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: pc.indigo, color: "#fff", display: "grid", placeItems: "center" }}>
          <ArrowUpward sx={{ fontSize: 18 }} />
        </Box>
      </ButtonBase>
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: pc.muted, mb: 1 }}>{tv("aiChoose")}</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {aiModels.map((model) => (
            <ModelPill key={model} model={model} onClick={() => openAssistant(model)} ariaLabel={t("openWith", { model: t(`models.${model}`) })} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function QuestionChips({ questions, onAsk, row }: { questions: QuickQuestionKey[]; onAsk: (key: QuickQuestionKey) => void; row?: boolean }) {
  const t = useTranslations("Assistant.quick");
  return (
    <Box sx={{ display: "flex", flexWrap: row ? "nowrap" : "wrap", gap: 1 }}>
      {questions.map((key) => (
        <ButtonBase
          key={key}
          onClick={() => onAsk(key)}
          sx={{ flexShrink: 0, minHeight: 40, px: 1.75, py: 0.75, borderRadius: "12px", border: `1px solid ${pc.outlineStrong}`, bgcolor: "#fff", color: pc.indigoDark, fontSize: 14, fontWeight: 600, textAlign: "left", whiteSpace: row ? "nowrap" : "normal", "&:hover": { bgcolor: pc.indigoSoft }, "&.Mui-focusVisible": focusRing }}
        >
          {t(key)}
        </ButtonBase>
      ))}
    </Box>
  );
}

const bubbleSx = { px: 2, py: 1.25, borderRadius: "20px", fontSize: 15, lineHeight: 1.5, maxWidth: "88%" } as const;

/** Simulated chat answered from the agency's reviews. Bottom sheet on phones, side sheet from 900 px. */
export function AssistantPanelC() {
  const t = useTranslations("Assistant");
  const tc = useTranslations("Criteria");
  const tq = useTranslations("Assistant.quick");
  const { agency, team, reviews, panel, setPanel, assistantModel, setAssistantModel, setFilters, goToSection } = useCertificate();
  const open = panel === "assistant";
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [revealed, setRevealed] = useState(Infinity);
  const [draft, setDraft] = useState("");
  const timers = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  const context: AnswerContext = useMemo(() => {
    const list = new Intl.ListFormat("fr", { style: "long", type: "conjunction" });
    return {
      agency,
      team,
      reviews,
      format: {
        score: formatScore,
        count: formatCount,
        criterion: (criterion: Criterion) => tc(criterion),
        criterionPhrase: (criterion: Criterion) => t(`criterionPhrase.${criterion}`),
        productPhrase: (product: Product) => t(`productPhrase.${product}`),
        list: (items: string[]) => list.format(items),
      },
    };
  }, [agency, team, reviews, t, tc]);

  const asked = new Set(messages.flatMap((message) => (message.role === "user" ? [message.text] : [])));
  const remaining = quickQuestions.map((question) => question.key).filter((key) => !asked.has(tq(key)));

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, revealed, thinking]);
  useEffect(() => {
    if (open && desktop) window.setTimeout(() => inputRef.current?.focus(), 250);
  }, [open, desktop]);

  const ask = (text: string, intent?: Intent) => {
    const question = text.trim();
    if (!question || thinking) return;
    const resolved = intent ?? detectIntent(question, team);
    const blocks = buildAnswer(resolved, context);
    const model = assistantModel;
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text: question }]);
    setDraft("");
    setThinking(true);
    timers.current.push(
      window.setTimeout(() => {
        setThinking(false);
        setRevealed(1);
        setMessages((current) => [...current, { id: nextId.current++, role: "assistant", model, blocks, suggest: resolved.kind === "fallback" }]);
        for (let shown = 2; shown <= blocks.length; shown++) timers.current.push(window.setTimeout(() => setRevealed(shown), (shown - 1) * BLOCK_MS));
      }, THINKING_MS),
    );
  };
  const askQuick = (key: QuickQuestionKey) => ask(tq(key), quickQuestions.find((question) => question.key === key)!.intent);
  const restart = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setMessages([]);
    setThinking(false);
    setRevealed(Infinity);
  };
  const follow = (target: AnswerTarget) => {
    if ("panel" in target) return setPanel(target.panel);
    setPanel(null);
    if ("filters" in target) {
      setFilters({ ...emptyFilters, ...target.filters });
      goToSection("avis");
    } else {
      goToSection(target.section);
    }
  };

  const rich = (key: string, values?: Record<string, string | number>) =>
    t.rich(`answers.${key}`, { ...values, b: (chunks) => <Box component="b" sx={{ fontWeight: 700 }}>{chunks}</Box> });

  const renderBlock = (block: AnswerBlock, index: number) => {
    if (block.type === "text") return <Typography key={index} sx={{ fontSize: "inherit", lineHeight: "inherit" }}>{rich(block.key, block.values)}</Typography>;
    if (block.type === "bullets") {
      return (
        <Box key={index} component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {block.items.map((item, i) => <li key={i}>{rich(item.key, item.values)}</li>)}
        </Box>
      );
    }
    return (
      <ButtonBase key={index} onClick={() => follow(block.target)} sx={{ alignSelf: "flex-start", gap: 0.25, mt: 0.5, minHeight: 36, pl: 1.5, pr: 1, borderRadius: 999, bgcolor: "#fff", color: pc.indigoDark, fontSize: 14, fontWeight: 700, "&:hover": { bgcolor: pc.indigoSoft }, "&.Mui-focusVisible": focusRing }}>
        {rich(block.key, block.values)}
        <ChevronRight sx={{ fontSize: 18 }} />
      </ButtonBase>
    );
  };

  const latest = messages.at(-1);
  const latestId = latest?.id;
  const fallbackShown = latest?.role === "assistant" && latest.suggest;

  const modelTag = (model: AiModel) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12, color: pc.muted, fontWeight: 600 }}>
      <AiLogo model={model} sx={{ fontSize: 14 }} />
      {t(`models.${model}`)}
    </Box>
  );

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, bgcolor: "#fff", color: pc.ink }}>
      {!desktop && (
        <Box sx={{ pt: 1.25, pb: 0.5, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: pc.outlineStrong }} />
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 3, pr: 1.5, py: 1.5, flexShrink: 0 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "12px", bgcolor: pc.indigoTonal, color: pc.indigoDark, display: "grid", placeItems: "center" }}>
          <AutoAwesome sx={{ fontSize: 20 }} />
        </Box>
        <Typography id={titleId} component="h2" sx={{ flex: 1, fontSize: 20, fontWeight: 700 }}>{t("title")}</Typography>
        {messages.length > 0 && (
          <Tooltip title={t("restart")}>
            <IconButton onClick={restart} aria-label={t("restart")} sx={{ width: 44, height: 44, color: pc.muted }}>
              <RestartAlt />
            </IconButton>
          </Tooltip>
        )}
        <IconButton onClick={() => setPanel(null)} aria-label={t("close")} sx={{ width: 44, height: 44, color: pc.muted }}>
          <Close />
        </IconButton>
      </Box>
      <Box sx={{ px: 3, pb: 1.5, flexShrink: 0, borderBottom: `1px solid ${pc.outline}` }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: pc.muted, mb: 1 }}>{t("answerWith")}</Typography>
        <Box role="radiogroup" aria-label={t("answerWith")} sx={{ display: "flex", gap: 1, overflowX: "auto", scrollbarWidth: "none", mx: -3, px: 3 }}>
          {aiModels.map((model) => <ModelPill key={model} model={model} selected={model === assistantModel} onClick={() => setAssistantModel(model)} />)}
        </Box>
      </Box>

      <Box ref={scrollRef} aria-live="polite" sx={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 1.5, bgcolor: pc.surfaceDim }}>
        {modelTag(assistantModel)}
        <Box sx={{ ...bubbleSx, bgcolor: "#fff", border: `1px solid ${pc.outline}`, borderTopLeftRadius: "6px" }}>
          {t.rich("welcome", { count: formatCount(reviews.length), name: `${agency.name} · ${agency.city}`, b: (chunks) => <b>{chunks}</b> })}
        </Box>
        {messages.length === 0 && <QuestionChips questions={remaining} onAsk={askQuick} />}
        {messages.map((message) =>
          message.role === "user" ? (
            <Box key={message.id} sx={{ ...bubbleSx, alignSelf: "flex-end", bgcolor: pc.indigo, color: "#fff", borderTopRightRadius: "6px" }}>{message.text}</Box>
          ) : (
            <Box key={message.id} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {modelTag(message.model)}
              <Box sx={{ ...bubbleSx, bgcolor: "#fff", border: `1px solid ${pc.outline}`, borderTopLeftRadius: "6px", display: "flex", flexDirection: "column", gap: 1 }}>
                {message.blocks.slice(0, message.id === latestId ? revealed : undefined).map(renderBlock)}
              </Box>
              {message.suggest && message.id === latestId && revealed >= message.blocks.length && <QuestionChips questions={quickQuestions.map((question) => question.key)} onAsk={askQuick} />}
            </Box>
          ),
        )}
        {thinking && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {modelTag(assistantModel)}
            <Box role="status" aria-label={t("typing", { model: t(`models.${assistantModel}`) })} sx={{ ...bubbleSx, bgcolor: "#fff", border: `1px solid ${pc.outline}`, borderTopLeftRadius: "6px", display: "flex", gap: 0.5, alignSelf: "flex-start", py: 1.75 }}>
              {[0, 1, 2].map((dot) => <Box key={dot} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: pc.indigo, animation: `${bounce} 1s ${dot * 0.15}s infinite ease-in-out` }} />)}
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ flexShrink: 0, minWidth: 0, px: 2, pt: 1.25, pb: desktop ? 1.5 : "calc(12px + env(safe-area-inset-bottom))", borderTop: `1px solid ${pc.outline}` }}>
        {messages.length > 0 && remaining.length > 0 && !thinking && !fallbackShown && (
          <Box sx={{ overflowX: "auto", pb: 1.25, mx: -2, px: 2, scrollbarWidth: "none" }}>
            <QuestionChips questions={remaining} onAsk={askQuick} row />
          </Box>
        )}
        <Box
          component="form"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
            ask(draft);
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1, pl: 2.5, pr: 0.75, py: 0.75, borderRadius: 999, bgcolor: pc.surfaceDim, border: `1px solid ${pc.outline}`, "&:focus-within": { borderColor: pc.indigo, bgcolor: "#fff" } }}
        >
          <InputBase
            inputRef={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("placeholder")}
            inputProps={{ "aria-label": t("placeholder"), enterKeyHint: "send", maxLength: 300 }}
            sx={{ flex: 1, fontSize: 16, color: pc.ink }}
          />
          <IconButton type="submit" aria-label={t("send")} disabled={!draft.trim() || thinking} sx={{ width: 40, height: 40, bgcolor: pc.indigo, color: "#fff", "&:hover": { bgcolor: pc.indigoDark }, "&.Mui-disabled": { bgcolor: pc.outline, color: pc.muted } }}>
            <ArrowUpward fontSize="small" />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 1, fontSize: 12, color: pc.muted, textAlign: "center", lineHeight: 1.4 }}>{t("disclaimer")}</Typography>
      </Box>
    </Box>
  );

  if (desktop) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setPanel(null)}
        keepMounted
        slotProps={{
          backdrop: { sx: { bgcolor: pc.scrim } },
          paper: { role: "dialog", "aria-labelledby": titleId, sx: { width: 460, maxWidth: "100vw", m: 1.5, height: "calc(100% - 24px)", borderRadius: "28px", overflow: "hidden", boxShadow: "0 24px 60px rgba(27,31,42,0.22)" } },
        }}
      >
        {body}
      </Drawer>
    );
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={() => setPanel(null)}
      onOpen={() => {}}
      disableSwipeToOpen
      keepMounted
      slotProps={{
        backdrop: { sx: { bgcolor: pc.scrim } },
        paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { height: "92dvh", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden", maxWidth: 640, mx: "auto" } },
      }}
    >
      {body}
    </SwipeableDrawer>
  );
}
