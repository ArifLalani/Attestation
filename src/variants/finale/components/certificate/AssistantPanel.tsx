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
import RestartAlt from "@mui/icons-material/RestartAlt";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AiLogo, aiModels, type AiModel } from "@/variants/finale/components/ui/AiLogo";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import type { Criterion, Product } from "@/data/types";
import { buildAnswer, detectIntent, quickQuestions, type AnswerBlock, type AnswerContext, type AnswerTarget, type Intent, type QuickQuestionKey } from "@/lib/assistant";
import { formatCount, formatScore } from "@/lib/format";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; model: AiModel; blocks: AnswerBlock[]; suggest: boolean };

/** Delay before the answer starts, then between each paragraph, so it reads like a reply being written. */
const THINKING_MS = 900;
const BLOCK_MS = 260;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-3px); opacity: 1; }
`;

/** Ready-made questions as chips. */
function QuestionChips({ questions, onAsk, row }: { questions: QuickQuestionKey[]; onAsk: (key: QuickQuestionKey) => void; row?: boolean }) {
  const t = useTranslations("Assistant.quick");
  return (
    <Box sx={{ display: "flex", flexWrap: row ? "nowrap" : "wrap", gap: 1 }}>
      {questions.map((key) => (
        <ButtonBase
          key={key}
          onClick={() => onAsk(key)}
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: "999px",
            border: `1px solid ${tokens.bleu30}`,
            bgcolor: tokens.blanc,
            color: tokens.bleu600,
            fontSize: 13,
            fontWeight: 500,
            textAlign: "left",
            whiteSpace: row ? "nowrap" : "normal",
            flexShrink: 0,
            "&:hover": { bgcolor: tokens.bleu5 },
          }}
        >
          {t(key)}
        </ButtonBase>
      ))}
    </Box>
  );
}

/**
 * The AIs, each with its logo. "chips": the pill selector inside the chat.
 * "buttons": the "Assistant IA" card, styled like the outlined CTA (45 px, 8 px corners).
 */
export function AiModelChips({ selected, onSelect, label, row, variant = "chips" }: { selected?: AiModel; onSelect: (model: AiModel) => void; label?: string; row?: boolean; variant?: "chips" | "buttons" }) {
  const t = useTranslations("Assistant");
  const buttons = variant === "buttons";
  return (
    <Box
      role={selected ? "radiogroup" : undefined}
      aria-label={label}
      sx={row ? { display: "flex", gap: 1, overflowX: "auto", mx: -2, px: 2, scrollbarWidth: "none" } : { display: "flex", flexWrap: "wrap", gap: 1 }}
    >
      {aiModels.map((model) => {
        const active = model === selected;
        return (
          <ButtonBase
            key={model}
            role={selected ? "radio" : undefined}
            aria-checked={selected ? active : undefined}
            aria-label={selected ? undefined : t("openWith", { model: t(`models.${model}`) })}
            onClick={() => onSelect(model)}
            sx={buttons ? {
              // Phones: the buttons share each row's width. Desktop: natural width, in one row.
              flex: { xs: "1 1 auto", md: "0 0 auto" },
              minHeight: 45,
              gap: 1,
              px: 1.5,
              py: "11px",
              borderRadius: "8px",
              bgcolor: tokens.blanc,
              border: `1px solid ${tokens.grisMoyen1}`,
              color: tokens.bleuFonce,
              fontSize: 14,
              fontWeight: 600,
              lineHeight: "normal",
              whiteSpace: "nowrap",
              transition: "background-color 150ms ease, border-color 150ms ease",
              "&:hover": { bgcolor: tokens.grisClair1, borderColor: tokens.bleu30 },
              "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 },
            } : {
              gap: 0.75,
              px: 1.25,
              py: 0.75,
              borderRadius: "999px",
              bgcolor: active ? tokens.grisClair2 : tokens.blanc,
              border: `1px solid ${active ? tokens.bleuFonce : tokens.grisMoyen1}`,
              boxShadow: active ? `inset 0 0 0 0.5px ${tokens.bleuFonce}` : "none",
              color: tokens.bleuFonce,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              lineHeight: "normal",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "border-color 150ms ease, background-color 150ms ease",
              "&:hover": { borderColor: active ? tokens.bleuFonce : tokens.gris },
            }}
          >
            <AiLogo model={model} sx={buttons ? { fontSize: 20 } : undefined} />
            {t(`models.${model}`)}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

function ModelTag({ model }: { model: AiModel }) {
  const t = useTranslations("Assistant.models");
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 12, color: tokens.gris, fontWeight: 500 }}>
      <AiLogo model={model} sx={{ fontSize: 14 }} />
      {t(model)}
    </Box>
  );
}

const bubbleSx = { px: 1.5, py: 1.25, borderRadius: "14px", fontSize: 14, lineHeight: 1.5, maxWidth: "88%" } as const;

/** "Demander à l'IA": simulated chat, answered from the agency's own reviews. Bottom sheet on phones, side panel from 900 px. */
export function AssistantPanel() {
  const t = useTranslations("Assistant");
  const tc = useTranslations("Criteria");
  const tq = useTranslations("Assistant.quick");
  const { agency, team, reviews, panel, setPanel, assistantModel, setAssistantModel, setFilters, goToSection } = useCertificate();
  const open = panel === "assistant";
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const titleId = useId();

  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  /** Paragraphs of the latest answer shown so far. */
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

  // Keep the newest message in view while the answer is written.
  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, revealed, thinking]);

  // Desktop: ready to type as soon as the panel opens. Phones: no keyboard until the user taps the field.
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
        for (let shown = 2; shown <= blocks.length; shown++) {
          timers.current.push(window.setTimeout(() => setRevealed(shown), (shown - 1) * BLOCK_MS));
        }
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
    t.rich(`answers.${key}`, { ...values, b: (chunks) => <Box component="b" sx={{ fontWeight: 600 }}>{chunks}</Box> });

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
      <ButtonBase
        key={index}
        onClick={() => follow(block.target)}
        sx={{ alignSelf: "flex-start", gap: 0.25, mt: 0.5, color: tokens.bleu600, fontSize: 13, fontWeight: 600, borderRadius: "4px", "&:hover": { textDecoration: "underline" } }}
      >
        {rich(block.key, block.values)}
        <FigmaIcon name="chevron-right" />
      </ButtonBase>
    );
  };

  const latest = messages.at(-1);
  const latestId = latest?.id;
  const fallbackShown = latest?.role === "assistant" && latest.suggest;

  const body = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, bgcolor: tokens.blanc }}>
      {!desktop && (
        <Box sx={{ py: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 60, height: 5, borderRadius: 2.5, bgcolor: tokens.grisMoyen1 }} />
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, borderBottom: `1px solid ${tokens.grisMoyen1}`, flexShrink: 0 }}>
        <AutoAwesome sx={{ fontSize: 22, color: tokens.vertOs }} />
        <Typography id={titleId} component="h2" sx={{ flex: 1, fontSize: 20, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
          {t("title")}
        </Typography>
        {messages.length > 0 && (
          <Tooltip title={t("restart")}>
            <IconButton onClick={restart} aria-label={t("restart")} sx={{ color: tokens.bleuFonce }}>
              <RestartAlt />
            </IconButton>
          </Tooltip>
        )}
        <IconButton onClick={() => setPanel(null)} aria-label={t("close")} sx={{ p: 1.5, m: -1.5, ml: 0 }}>
          <FigmaIcon name="close" />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${tokens.grisMoyen1}`, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: tokens.gris, mb: 1 }}>{t("answerWith")}</Typography>
        <AiModelChips selected={assistantModel} onSelect={setAssistantModel} label={t("answerWith")} row={!desktop} />
      </Box>

      <Box ref={scrollRef} aria-live="polite" sx={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <ModelTag model={assistantModel} />
        <Box sx={{ ...bubbleSx, bgcolor: tokens.grisClair2, borderTopLeftRadius: "4px", color: tokens.bleuFonce }}>
          {t.rich("welcome", { count: formatCount(reviews.length), name: `${agency.name} · ${agency.city}`, b: (chunks) => <b>{chunks}</b> })}
        </Box>
        {messages.length === 0 && <QuestionChips questions={remaining} onAsk={askQuick} />}

        {messages.map((message) =>
          message.role === "user" ? (
            <Box key={message.id} sx={{ ...bubbleSx, alignSelf: "flex-end", bgcolor: tokens.bleuFonce, color: tokens.blanc, borderTopRightRadius: "4px" }}>
              {message.text}
            </Box>
          ) : (
            <Box key={message.id} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <ModelTag model={message.model} />
              <Box sx={{ ...bubbleSx, bgcolor: tokens.grisClair2, color: tokens.bleuFonce, borderTopLeftRadius: "4px", display: "flex", flexDirection: "column", gap: 1 }}>
                {message.blocks.slice(0, message.id === latestId ? revealed : undefined).map(renderBlock)}
              </Box>
              {message.suggest && message.id === latestId && revealed >= message.blocks.length && (
                <QuestionChips questions={quickQuestions.map((question) => question.key)} onAsk={askQuick} />
              )}
            </Box>
          ),
        )}

        {thinking && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <ModelTag model={assistantModel} />
            <Box role="status" aria-label={t("typing", { model: t(`models.${assistantModel}`) })} sx={{ ...bubbleSx, bgcolor: tokens.grisClair2, borderTopLeftRadius: "4px", display: "flex", gap: 0.5, alignSelf: "flex-start", py: 1.75 }}>
              {[0, 1, 2].map((dot) => (
                <Box key={dot} sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: tokens.bleuFonce, animation: `${bounce} 1s ${dot * 0.15}s infinite ease-in-out` }} />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ flexShrink: 0, minWidth: 0, px: 2, pt: 1, pb: desktop ? 1.5 : "calc(12px + env(safe-area-inset-bottom))", borderTop: `1px solid ${tokens.grisMoyen1}` }}>
        {messages.length > 0 && remaining.length > 0 && !thinking && !fallbackShown && (
          <Box sx={{ overflowX: "auto", pb: 1, mx: -2, px: 2, scrollbarWidth: "none" }}>
            <QuestionChips questions={remaining} onAsk={askQuick} row />
          </Box>
        )}
        <Box
          component="form"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
            ask(draft);
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1, pl: 2, pr: 0.5, py: 0.5, border: `1px solid ${tokens.grisMoyen1}`, borderRadius: "999px", "&:focus-within": { borderColor: tokens.bleu400 } }}
        >
          <InputBase
            inputRef={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("placeholder")}
            inputProps={{ "aria-label": t("placeholder"), enterKeyHint: "send", maxLength: 300 }}
            sx={{ flex: 1, fontSize: 16, color: tokens.bleuFonce }}
          />
          <IconButton
            type="submit"
            aria-label={t("send")}
            disabled={!draft.trim() || thinking}
            sx={{ width: 36, height: 36, bgcolor: tokens.bleuFonce, color: tokens.blanc, "&:hover": { bgcolor: tokens.bleu600 }, "&.Mui-disabled": { bgcolor: tokens.grisMoyen1, color: tokens.blanc } }}
          >
            <ArrowUpward fontSize="small" />
          </IconButton>
        </Box>
        <Typography sx={{ mt: 1, fontSize: 11, color: tokens.gris, textAlign: "center", lineHeight: 1.4 }}>{t("disclaimer")}</Typography>
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
          backdrop: { sx: { bgcolor: "rgba(4,27,68,0.2)" } },
          paper: { role: "dialog", "aria-labelledby": titleId, sx: { width: 440, maxWidth: "100vw", overflow: "hidden", boxShadow: tokens.elevation6 } },
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
        paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { height: "92dvh", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden", maxWidth: 640, mx: "auto" } },
      }}
    >
      {body}
    </SwipeableDrawer>
  );
}
