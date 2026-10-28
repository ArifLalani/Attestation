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
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Close from "@mui/icons-material/Close";
import RestartAlt from "@mui/icons-material/RestartAlt";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { AiLogo, aiModels, type AiModel } from "@/components/ui/AiLogo";
import type { Criterion, Product } from "@/data/types";
import { buildAnswer, detectIntent, quickQuestions, type AnswerBlock, type AnswerContext, type AnswerTarget, type Intent, type QuickQuestionKey } from "@/lib/assistant";
import { formatCount, formatScore } from "@/lib/format";
import { a } from "./theme";
import { focusRing } from "./ui";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; model: AiModel; blocks: AnswerBlock[]; suggest: boolean };

const THINKING_MS = 900;
const BLOCK_MS = 260;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
  40% { transform: translateY(-3px); opacity: 1; }
`;

function QuestionChips({ questions, onAsk, row }: { questions: QuickQuestionKey[]; onAsk: (key: QuickQuestionKey) => void; row?: boolean }) {
  const t = useTranslations("Assistant.quick");
  return (
    <Box sx={{ display: "flex", flexWrap: row ? "nowrap" : "wrap", gap: 1 }}>
      {questions.map((key) => (
        <ButtonBase
          key={key}
          onClick={() => onAsk(key)}
          sx={{ minHeight: 40, px: 1.75, borderRadius: 999, border: `1px solid ${a.lineStrong}`, bgcolor: a.white, color: a.navy, fontSize: 14, fontWeight: 600, textAlign: "left", whiteSpace: row ? "nowrap" : "normal", flexShrink: 0, "&:hover": { borderColor: a.navy, bgcolor: a.band }, ...focusRing }}
        >
          {t(key)}
        </ButtonBase>
      ))}
    </Box>
  );
}

const bubbleSx = { px: 1.75, py: 1.25, borderRadius: "16px", fontSize: 15, lineHeight: 1.55, maxWidth: "88%" } as const;

/** Simulated chat answered from the agency's own reviews. Side panel on desktop, bottom sheet on phones. */
export function AssistantPanelA() {
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
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
  const rich = (key: string, values?: Record<string, string | number>) => t.rich(`answers.${key}`, { ...values, b: (chunks) => <Box component="b" sx={{ fontWeight: 800 }}>{chunks}</Box> });
  const renderBlock = (block: AnswerBlock, index: number) => {
    if (block.type === "text") return <Typography key={index} sx={{ fontSize: "inherit", lineHeight: "inherit" }}>{rich(block.key, block.values)}</Typography>;
    if (block.type === "bullets") return <Box key={index} component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}>{block.items.map((item, i) => <li key={i}>{rich(item.key, item.values)}</li>)}</Box>;
    return (
      <ButtonBase key={index} onClick={() => follow(block.target)} sx={{ alignSelf: "flex-start", gap: 0.5, mt: 0.5, minHeight: 36, px: 1.5, borderRadius: 999, bgcolor: a.white, border: `1px solid ${a.lineStrong}`, color: a.navy, fontSize: 14, fontWeight: 700, "&:hover": { borderColor: a.navy }, ...focusRing }}>
        {rich(block.key, block.values)}
        <ArrowForward sx={{ fontSize: 16 }} />
      </ButtonBase>
    );
  };
  const latest = messages.at(-1);
  const fallbackShown = latest?.role === "assistant" && latest.suggest;
  const modelTag = (model: AiModel) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12, fontWeight: 700, color: a.muted }}>
      <AiLogo model={model} sx={{ fontSize: 16 }} />
      {t(`models.${model}`)}
    </Box>
  );

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, bgcolor: a.white, color: a.navy }}>
      {!desktop && <Box sx={{ pt: 1, display: "flex", justifyContent: "center" }}><Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: a.lineStrong }} /></Box>}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2.5, py: 1.5, borderBottom: `1px solid ${a.line}` }}>
        <Box aria-hidden sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: a.navy, display: "grid", placeItems: "center" }}>
          <AutoAwesome sx={{ fontSize: 20, color: "#7fd9c9" }} />
        </Box>
        <Typography id={titleId} component="h2" sx={{ flex: 1, fontSize: 19, fontWeight: 800 }}>{t("title")}</Typography>
        {messages.length > 0 && (
          <Tooltip title={t("restart")}>
            <IconButton onClick={restart} aria-label={t("restart")} sx={{ width: 44, height: 44, color: a.navy }}><RestartAlt /></IconButton>
          </Tooltip>
        )}
        <IconButton onClick={() => setPanel(null)} aria-label={t("close")} sx={{ width: 44, height: 44, color: a.navy, bgcolor: a.band, "&:hover": { bgcolor: a.line } }}><Close fontSize="small" /></IconButton>
      </Box>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${a.line}` }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: a.muted, mb: 1 }}>{t("answerWith")}</Typography>
        <Box role="radiogroup" aria-label={t("answerWith")} sx={{ display: "flex", gap: 1, overflowX: "auto", scrollbarWidth: "none", mx: -2.5, px: 2.5 }}>
          {aiModels.map((model) => {
            const selected = model === assistantModel;
            return (
              <ButtonBase key={model} role="radio" aria-checked={selected} onClick={() => setAssistantModel(model)} sx={{ flexShrink: 0, minHeight: 40, gap: 0.75, px: 1.5, borderRadius: "10px", border: `1.5px solid ${selected ? a.navy : a.line}`, bgcolor: selected ? a.band : a.white, fontSize: 14, fontWeight: selected ? 800 : 600, color: a.navy, ...focusRing }}>
                <AiLogo model={model} sx={{ fontSize: 18 }} />
                {t(`models.${model}`)}
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
      <Box ref={scrollRef} aria-live="polite" sx={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 1.5, bgcolor: a.band }}>
        {modelTag(assistantModel)}
        <Box sx={{ ...bubbleSx, bgcolor: a.white, border: `1px solid ${a.line}`, borderTopLeftRadius: "4px" }}>
          {t.rich("welcome", { count: formatCount(reviews.length), name: `${agency.name} · ${agency.city}`, b: (chunks) => <b>{chunks}</b> })}
        </Box>
        {messages.length === 0 && <QuestionChips questions={remaining} onAsk={askQuick} />}
        {messages.map((message) =>
          message.role === "user" ? (
            <Box key={message.id} sx={{ ...bubbleSx, alignSelf: "flex-end", bgcolor: a.navy, color: a.white, borderTopRightRadius: "4px" }}>{message.text}</Box>
          ) : (
            <Box key={message.id} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {modelTag(message.model)}
              <Box sx={{ ...bubbleSx, bgcolor: a.white, border: `1px solid ${a.line}`, borderTopLeftRadius: "4px", display: "flex", flexDirection: "column", gap: 1 }}>
                {message.blocks.slice(0, message.id === latest?.id ? revealed : undefined).map(renderBlock)}
              </Box>
              {message.suggest && message.id === latest?.id && revealed >= message.blocks.length && <QuestionChips questions={quickQuestions.map((question) => question.key)} onAsk={askQuick} />}
            </Box>
          ),
        )}
        {thinking && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {modelTag(assistantModel)}
            <Box role="status" aria-label={t("typing", { model: t(`models.${assistantModel}`) })} sx={{ ...bubbleSx, alignSelf: "flex-start", bgcolor: a.white, border: `1px solid ${a.line}`, borderTopLeftRadius: "4px", display: "flex", gap: 0.5, py: 1.75 }}>
              {[0, 1, 2].map((dot) => <Box key={dot} sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: a.navy, animation: `${bounce} 1s ${dot * 0.15}s infinite ease-in-out` }} />)}
            </Box>
          </Box>
        )}
      </Box>
      <Box sx={{ px: 2.5, pt: 1.25, pb: desktop ? 1.5 : "calc(12px + env(safe-area-inset-bottom))", borderTop: `1px solid ${a.line}` }}>
        {messages.length > 0 && remaining.length > 0 && !thinking && !fallbackShown && (
          <Box sx={{ overflowX: "auto", pb: 1.25, mx: -2.5, px: 2.5, scrollbarWidth: "none" }}><QuestionChips questions={remaining} onAsk={askQuick} row /></Box>
        )}
        <Box
          component="form"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
            ask(draft);
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1, pl: 2, pr: 0.5, minHeight: 52, borderRadius: "14px", border: `1.5px solid ${a.lineStrong}`, "&:focus-within": { borderColor: a.blue, boxShadow: `0 0 0 3px ${a.blueTint}` } }}
        >
          <InputBase inputRef={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t("placeholder")} inputProps={{ "aria-label": t("placeholder"), enterKeyHint: "send", maxLength: 300 }} sx={{ flex: 1, fontSize: 16, color: a.navy }} />
          <IconButton type="submit" aria-label={t("send")} disabled={!draft.trim() || thinking} sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: a.yellow, color: a.navy, "&:hover": { bgcolor: a.yellowHover }, "&.Mui-disabled": { bgcolor: a.band, color: a.muted } }}>
            <ArrowUpward fontSize="small" />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 1, fontSize: 12, color: a.muted, textAlign: "center", lineHeight: 1.4 }}>{t("disclaimer")}</Typography>
      </Box>
    </Box>
  );

  if (desktop) {
    return (
      <Drawer anchor="right" open={open} onClose={() => setPanel(null)} keepMounted slotProps={{ backdrop: { sx: { bgcolor: "rgba(4,27,68,0.3)" } }, paper: { role: "dialog", "aria-labelledby": titleId, sx: { width: 460, maxWidth: "100vw", overflow: "hidden", borderRadius: "20px 0 0 20px", boxShadow: a.shadowFloat } } }}>
        {body}
      </Drawer>
    );
  }
  return (
    <SwipeableDrawer anchor="bottom" open={open} onClose={() => setPanel(null)} onOpen={() => {}} disableSwipeToOpen keepMounted slotProps={{ backdrop: { sx: { bgcolor: "rgba(4,27,68,0.35)" } }, paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { height: "92dvh", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", maxWidth: 640, mx: "auto" } } }}>
      {body}
    </SwipeableDrawer>
  );
}
