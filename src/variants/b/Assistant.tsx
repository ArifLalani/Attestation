"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { keyframes } from "@mui/material/styles";
import ArrowUpwardRounded from "@mui/icons-material/ArrowUpwardRounded";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { AiLogo, aiModels, type AiModel } from "@/components/ui/AiLogo";
import type { Criterion, Product } from "@/data/types";
import { buildAnswer, detectIntent, quickQuestions, type AnswerBlock, type AnswerContext, type AnswerTarget, type Intent, type QuickQuestionKey } from "@/lib/assistant";
import { formatCount, formatScore } from "@/lib/format";
import { b } from "./theme";
import { focusSx } from "./ui";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; model: AiModel; blocks: AnswerBlock[]; suggest: boolean };

const THINKING_MS = 900;
const BLOCK_MS = 260;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-3px); opacity: 1; }
`;

/** The AIs as round-cornered buttons with their logos. */
function ModelButtons({ selected, onSelect, label }: { selected?: AiModel; onSelect: (model: AiModel) => void; label?: string }) {
  const t = useTranslations("Assistant");
  return (
    <Box role={selected ? "radiogroup" : undefined} aria-label={label} sx={{ display: "flex", flexWrap: selected ? "nowrap" : "wrap", gap: 1, overflowX: selected ? "auto" : "visible", scrollbarWidth: "none", mx: selected ? -2.5 : 0, px: selected ? 2.5 : 0 }}>
      {aiModels.map((model) => {
        const active = model === selected;
        return (
          <ButtonBase
            key={model}
            role={selected ? "radio" : undefined}
            aria-checked={selected ? active : undefined}
            aria-label={selected ? undefined : t("openWith", { model: t(`models.${model}`) })}
            onClick={() => onSelect(model)}
            sx={{
              flex: selected ? "0 0 auto" : { xs: "1 1 auto", md: "0 0 auto" },
              minHeight: 44,
              gap: 1,
              px: 2,
              borderRadius: 999,
              bgcolor: active ? b.ink : b.white,
              color: active ? b.white : b.ink,
              boxShadow: `inset 0 0 0 1px ${active ? b.ink : b.lineStrong}`,
              fontFamily: b.sans,
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              transition: "box-shadow 150ms ease, transform 150ms ease, background-color 150ms ease",
              "&:hover": { boxShadow: `inset 0 0 0 ${active ? 1 : 2}px ${b.ink}`, transform: "translateY(-1px)" },
              "& .MuiSvgIcon-root": active ? { color: `${b.white} !important` } : {},
              ...focusSx,
            }}
          >
            <AiLogo model={model} sx={{ fontSize: 18 }} />
            {t(`models.${model}`)}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/** "Demander à l'IA" card. */
export function AskAiCard() {
  const t = useTranslations("Assistant");
  const { openAssistant } = useCertificate();
  return (
    <Box component="section" aria-labelledby="b-ai-title" sx={{ position: "relative", overflow: "hidden", borderRadius: "28px", p: { xs: 2.5, md: 3.5 }, bgcolor: b.sand, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box aria-hidden sx={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${b.accentTint} 0%, rgba(253,238,233,0) 70%)` }} />
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "14px", bgcolor: b.white, display: "grid", placeItems: "center", boxShadow: b.shadow, flexShrink: 0 }}>
          <AutoAwesome sx={{ color: b.accent }} />
        </Box>
        <Box>
          <Typography id="b-ai-title" component="h2" sx={{ fontFamily: b.serif, fontVariationSettings: '"SOFT" 100', fontWeight: 600, fontSize: { xs: 21, md: 24 }, lineHeight: 1.2 }}>
            {t("cardHeading").replace(" ?", "00a0?")}
          </Typography>
          <Typography sx={{ fontSize: 14, color: b.muted }}>{t("cardText")}</Typography>
        </Box>
      </Box>
      <Box sx={{ position: "relative" }}>
        <ModelButtons onSelect={openAssistant} />
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
          sx={{ minHeight: 40, px: 1.75, borderRadius: 999, bgcolor: b.white, boxShadow: `inset 0 0 0 1px ${b.lineStrong}`, fontFamily: b.sans, fontSize: 14, fontWeight: 500, color: b.ink, textAlign: "left", whiteSpace: row ? "nowrap" : "normal", flexShrink: 0, "&:hover": { boxShadow: `inset 0 0 0 1px ${b.ink}` }, ...focusSx }}
        >
          {t(key)}
        </ButtonBase>
      ))}
    </Box>
  );
}

const bubbleSx = { px: 2, py: 1.5, borderRadius: "20px", fontSize: 15, lineHeight: 1.55, maxWidth: "88%" } as const;

/** The simulated chat, answered from the agency's own reviews. Bottom sheet on phones, side panel from 900 px. */
export function AssistantB() {
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
  const rich = (key: string, values?: Record<string, string | number>) => t.rich(`answers.${key}`, { ...values, b: (chunks) => <Box component="b" sx={{ fontWeight: 700 }}>{chunks}</Box> });
  const renderBlock = (block: AnswerBlock, index: number) => {
    if (block.type === "text") return <Typography key={index} sx={{ font: "inherit" }}>{rich(block.key, block.values)}</Typography>;
    if (block.type === "bullets") {
      return (
        <Box key={index} component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {block.items.map((item, i) => <li key={i}>{rich(item.key, item.values)}</li>)}
        </Box>
      );
    }
    return (
      <ButtonBase key={index} onClick={() => follow(block.target)} sx={{ alignSelf: "flex-start", gap: 0.25, mt: 0.5, minHeight: 36, px: 1.5, borderRadius: 999, bgcolor: b.white, boxShadow: `inset 0 0 0 1px ${b.lineStrong}`, fontFamily: b.sans, fontSize: 14, fontWeight: 600, color: b.ink, "&:hover": { boxShadow: `inset 0 0 0 1px ${b.ink}` }, ...focusSx }}>
        {rich(block.key, block.values)}
        <ChevronRightRounded sx={{ fontSize: 18 }} />
      </ButtonBase>
    );
  };
  const latest = messages.at(-1);
  const fallbackShown = latest?.role === "assistant" && latest.suggest;
  const modelTag = (model: AiModel) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 13, fontWeight: 600, color: b.muted }}>
      <AiLogo model={model} sx={{ fontSize: 16 }} />
      {t(`models.${model}`)}
    </Box>
  );

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, bgcolor: b.white, fontFamily: b.sans, color: b.ink }}>
      {!desktop && (
        <Box sx={{ pt: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: b.lineStrong }} />
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, minHeight: 60, borderBottom: `1px solid ${b.line}`, flexShrink: 0 }}>
        <IconButton onClick={() => setPanel(null)} aria-label={t("close")} sx={{ width: 44, height: 44, color: b.ink, ...focusSx }}>
          <CloseRounded />
        </IconButton>
        <AutoAwesome sx={{ color: b.accent, fontSize: 20 }} />
        <Typography id={titleId} component="h2" sx={{ flex: 1, fontSize: 17, fontWeight: 700 }}>{t("title")}</Typography>
        {messages.length > 0 && (
          <IconButton onClick={restart} aria-label={t("restart")} sx={{ width: 44, height: 44, color: b.ink, ...focusSx }}>
            <RestartAltRounded />
          </IconButton>
        )}
      </Box>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${b.line}`, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: b.muted, mb: 1 }}>{t("answerWith")}</Typography>
        <ModelButtons selected={assistantModel} onSelect={setAssistantModel} label={t("answerWith")} />
      </Box>
      <Box ref={scrollRef} aria-live="polite" sx={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", px: 2.5, py: 2.5, display: "flex", flexDirection: "column", gap: 1.5, bgcolor: b.ivory }}>
        {modelTag(assistantModel)}
        <Box sx={{ ...bubbleSx, bgcolor: b.white, boxShadow: `inset 0 0 0 1px ${b.line}`, borderTopLeftRadius: "6px" }}>
          {t.rich("welcome", { count: formatCount(reviews.length), name: `${agency.name} · ${agency.city}`, b: (chunks) => <b>{chunks}</b> })}
        </Box>
        {messages.length === 0 && <QuestionChips questions={remaining} onAsk={askQuick} />}
        {messages.map((message) =>
          message.role === "user" ? (
            <Box key={message.id} sx={{ ...bubbleSx, alignSelf: "flex-end", background: b.gradient, color: b.white, borderTopRightRadius: "6px" }}>
              {message.text}
            </Box>
          ) : (
            <Box key={message.id} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {modelTag(message.model)}
              <Box sx={{ ...bubbleSx, bgcolor: b.white, boxShadow: `inset 0 0 0 1px ${b.line}`, borderTopLeftRadius: "6px", display: "flex", flexDirection: "column", gap: 1 }}>
                {message.blocks.slice(0, message.id === latest?.id ? revealed : undefined).map(renderBlock)}
              </Box>
              {message.suggest && message.id === latest?.id && revealed >= message.blocks.length && <QuestionChips questions={quickQuestions.map((question) => question.key)} onAsk={askQuick} />}
            </Box>
          ),
        )}
        {thinking && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {modelTag(assistantModel)}
            <Box role="status" aria-label={t("typing", { model: t(`models.${assistantModel}`) })} sx={{ ...bubbleSx, alignSelf: "flex-start", display: "flex", gap: 0.5, py: 2, bgcolor: b.white, boxShadow: `inset 0 0 0 1px ${b.line}`, borderTopLeftRadius: "6px" }}>
              {[0, 1, 2].map((dot) => (
                <Box key={dot} sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: b.accent, animation: `${bounce} 1s ${dot * 0.15}s infinite ease-in-out` }} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
      <Box sx={{ flexShrink: 0, px: 2.5, pt: 1.25, pb: desktop ? 1.5 : "calc(12px + env(safe-area-inset-bottom))", borderTop: `1px solid ${b.line}` }}>
        {messages.length > 0 && remaining.length > 0 && !thinking && !fallbackShown && (
          <Box sx={{ overflowX: "auto", pb: 1.25, mx: -2.5, px: 2.5, scrollbarWidth: "none" }}>
            <QuestionChips questions={remaining} onAsk={askQuick} row />
          </Box>
        )}
        <Box
          component="form"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
            ask(draft);
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1, pl: 2.5, pr: 0.75, py: 0.75, borderRadius: 999, boxShadow: `inset 0 0 0 1px ${b.lineStrong}`, "&:focus-within": { boxShadow: `inset 0 0 0 2px ${b.ink}` } }}
        >
          <InputBase inputRef={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t("placeholder")} inputProps={{ "aria-label": t("placeholder"), enterKeyHint: "send", maxLength: 300 }} sx={{ flex: 1, fontSize: 16, fontFamily: b.sans }} />
          <IconButton type="submit" aria-label={t("send")} disabled={!draft.trim() || thinking} sx={{ width: 40, height: 40, background: b.gradient, color: b.white, "&.Mui-disabled": { background: b.sandDeep, color: b.white }, ...focusSx }}>
            <ArrowUpwardRounded fontSize="small" />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 1, fontSize: 12, color: b.muted, textAlign: "center", lineHeight: 1.4 }}>{t("disclaimer")}</Typography>
      </Box>
    </Box>
  );

  if (desktop) {
    return (
      <Drawer anchor="right" open={open} onClose={() => setPanel(null)} keepMounted slotProps={{ backdrop: { sx: { bgcolor: "rgba(34, 24, 10, 0.35)" } }, paper: { role: "dialog", "aria-labelledby": titleId, sx: { width: 460, maxWidth: "100vw", overflow: "hidden", borderRadius: "24px 0 0 24px" } } }}>
        {body}
      </Drawer>
    );
  }
  return (
    <SwipeableDrawer anchor="bottom" open={open} onClose={() => setPanel(null)} onOpen={() => {}} disableSwipeToOpen keepMounted slotProps={{ paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { height: "92dvh", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", maxWidth: 720, mx: "auto" } } }}>
      {body}
    </SwipeableDrawer>
  );
}
