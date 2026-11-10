"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import type { Review } from "@/data/types";
import { tokens } from "@/theme/theme";
import { LearnMoreContent } from "./LearnMoreSheet";

/** Every definition of the page, in the order of the list. */
export const definitionGroups = {
  scores: ["global", "controle"],
  details: ["source", "type", "questionnaire", "activity", "levels", "breakdown", "collaborator", "number"],
  filters: ["product", "criterion"],
} as const;
export type DefinitionKey = (typeof definitionGroups)[keyof typeof definitionGroups][number];
const allKeys = Object.values(definitionGroups).flat() as DefinitionKey[];

/** "Voir aussi" under a definition. */
const related: Partial<Record<DefinitionKey, DefinitionKey[]>> = {
  global: ["controle", "source"],
  controle: ["type", "questionnaire"],
  type: ["controle", "questionnaire"],
  source: ["type"],
  questionnaire: ["type", "controle"],
  levels: ["breakdown"],
  breakdown: ["activity"],
};

/** A new page of the sheet starts at the top (the sheet keeps one scroll for all its pages). */
function startAtTop(node: HTMLElement | null) {
  let scroller = node?.parentElement;
  while (scroller && getComputedStyle(scroller).overflowY !== "auto") scroller = scroller.parentElement;
  if (scroller) scroller.scrollTop = 0;
}

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: -2 } } as const;

/** This review's value for a definition (« Pour cet avis »), when the sheet was opened from a review. */
function useReviewValue(review: Review | undefined, key: DefinitionKey): { value: string; note?: string; rows?: { label: string; value: string }[] } | null {
  const t = useTranslations("VarianteFinale.help");
  const tr = useTranslations("Reviews");
  const ts = useTranslations("SourceNames");
  const tp = useTranslations("Platforms");
  const ta = useTranslations("Activities");
  const td = useTranslations("VarianteFinale.definitions");
  const { team } = useCertificate();
  if (!review) return null;
  const survey = review.survey;
  const activity = ta(review.product);
  const sourceName = review.platform ? tp(review.platform) : ts(review.source);
  const imported = review.source === "import_iso" || review.source === "import_other";
  const person = team.find((member) => member.id === review.collaboratorId);
  switch (key) {
    case "type":
      return { value: tr(review.status === "controle" ? "controle" : "nonControle"), note: t(`status.${review.source}`) };
    case "source":
      return { value: survey ? ts("os_certified") : sourceName, note: imported ? t(`source.${review.source}`, { source: sourceName }) : t("source.os") };
    case "questionnaire":
      if (!survey) return null;
      return { value: td(`questionnaireTypes.${survey.questionnaire}`), note: t(`questionnaire.${survey.questionnaire}`) };
    case "activity":
      return { value: activity, note: survey ? undefined : t("activityImport") };
    case "levels":
      return survey ? { value: "", rows: [{ label: td("levels.recommendationLabel"), value: `${survey.recommendation} %` }, { label: td("levels.satisfactionLabel"), value: `${survey.satisfaction} %` }] } : null;
    case "breakdown":
      return survey ? { value: activity, note: t("criteria", { activity: activity.toLowerCase() }) } : null;
    case "collaborator":
      return person ? { value: person.name, note: t("collaborator", { name: person.name }) } : null;
    case "number":
      return { value: review.reviewNumber };
    default:
      return null;
  }
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: tokens.bleuFonce }}>{children}</Typography>;
}

/** Label + text pairs (the filter explanations). */
function Items({ items }: { items: { label: string; text: string }[] }) {
  return (
    <Box component="dl" sx={{ m: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((item) => (
        <Box key={item.label}>
          <Typography component="dt" sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: tokens.bleuFonce }}>{item.label}</Typography>
          <Typography component="dd" sx={{ m: 0, mt: 0.25, fontSize: 14, lineHeight: 1.6, color: tokens.bleuFonce, opacity: 0.85 }}>{item.text}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/** The text of one definition. */
function DefinitionBody({ name, view }: { name: DefinitionKey; view: "global" | "controle" }) {
  const t = useTranslations("VarianteFinale.definitions");
  const th = useTranslations("VarianteFinale.help");
  const tf = useTranslations("VarianteFinale.filters");
  if (name === "global" || name === "controle") return <LearnMoreContent view={name} />;
  if (name === "type" || name === "source" || name === "product" || name === "criterion") {
    // The filter explanations of Type and Source also define them in a review.
    return <Items items={(tf.raw(`help.${name}`) as { items: { label: string; text: string }[] }).items} />;
  }
  switch (name) {
    case "breakdown":
      return <Items items={[{ label: t("breakdown.reviewLabel"), text: `${th("scores")} ${t("breakdown.criteria")}` }, { label: t("breakdown.reputationLabel"), text: t("breakdown.reputation", { view: view === "controle" ? t("label.controle") : t("label.global") }) }]} />;
    case "questionnaire":
      return <Items items={[{ label: t("questionnaireTypes.controleName"), text: t("questionnaireControle") }, { label: t("questionnaireTypes.simpleName"), text: th("questionnaire.simple") }]} />;
    case "activity":
      return <Items items={[{ label: t("activity.osLabel"), text: th("activity") }, { label: t("activity.importLabel"), text: th("activityImport") }]} />;
    case "levels":
      return <Items items={[{ label: t("levels.recommendationName"), text: th("recommendation") }, { label: t("levels.satisfactionName"), text: th("satisfaction") }]} />;
    case "collaborator":
      return <Paragraph>{t("collaborator")}</Paragraph>;
    case "number":
      return <Paragraph>{th("number")}</Paragraph>;
  }
}

/** One definition: this review's value first (when opened from a review), the text, then « Voir aussi ». */
function DefinitionPage({ name, review, view, heading, onGo }: { name: DefinitionKey; review?: Review; view: "global" | "controle"; heading: boolean; onGo: (key: DefinitionKey) => void }) {
  const t = useTranslations("VarianteFinale.definitions");
  const own = useReviewValue(review, name);
  const links = related[name] ?? [];
  return (
    <Box ref={startAtTop} sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {heading && <Typography component="h3" sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>{t(`label.${name}`)}</Typography>}
      {own && (
        <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: tokens.bleu5, border: `1px solid ${tokens.bleu20}` }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.gris }}>{t("forReview")}</Typography>
            {own.value && <Typography sx={{ fontSize: 15, fontWeight: 700, color: tokens.bleuFonce, textAlign: "right" }}>{own.value}</Typography>}
          </Box>
          {own.rows?.map((row) => (
            <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1.5, mt: 0.5 }}>
              <Typography sx={{ fontSize: 14, color: tokens.bleuFonce }}>{row.label}</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: tokens.bleuFonce }}>{row.value}</Typography>
            </Box>
          ))}
          {own.note && <Typography sx={{ mt: 0.75, fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce }}>{own.note}</Typography>}
        </Box>
      )}
      <DefinitionBody name={name} view={view} />
      {links.length > 0 && (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.gris, mb: 0.5 }}>{t("seeAlso")}</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {links.map((key) => (
              <ButtonBase
                key={key}
                onClick={() => onGo(key)}
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, minHeight: 36, pl: 1.5, pr: 1, borderRadius: "18px", border: `1px solid ${tokens.grisMoyen1}`, fontFamily: "inherit", fontSize: 14, fontWeight: 500, color: tokens.bleuFonce, "&:hover": { bgcolor: tokens.grisClair1 }, ...focusSx }}
              >
                {t(`label.${key}`)}
                <ChevronRight sx={{ fontSize: 18 }} />
              </ButtonBase>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

/** The list of every definition, in 3 groups; the one last read is highlighted. */
function DefinitionList({ current, onGo, compact }: { current: DefinitionKey | null; onGo: (key: DefinitionKey) => void; compact: boolean }) {
  const t = useTranslations("VarianteFinale.definitions");
  return (
    <Box component="nav" ref={startAtTop} aria-label={t("title")} sx={{ p: compact ? 1.5 : 2, display: "flex", flexDirection: "column", gap: compact ? 2 : 2.5 }}>
      {(Object.keys(definitionGroups) as (keyof typeof definitionGroups)[]).map((group) => (
        <Box key={group}>
          <Typography component="h3" sx={{ px: 1, mb: 0.5, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: tokens.vertOs }}>{t(`group.${group}`)}</Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {definitionGroups[group].map((key) => {
              const on = key === current;
              return (
                <Box component="li" key={key} sx={{ "& + &": { borderTop: compact ? "none" : `1px solid ${tokens.grisClair1}` } }}>
                  <ButtonBase
                    onClick={() => onGo(key)}
                    aria-current={on ? "true" : undefined}
                    sx={{
                      width: "100%",
                      justifyContent: "space-between",
                      gap: 1,
                      minHeight: compact ? 36 : 48,
                      px: 1,
                      borderRadius: "10px",
                      fontFamily: "inherit",
                      fontSize: compact ? 14 : 15,
                      fontWeight: on ? 600 : 400,
                      textAlign: "left",
                      color: tokens.bleuFonce,
                      bgcolor: on ? tokens.bleu5 : "transparent",
                      boxShadow: on ? `inset 0 0 0 1px ${tokens.bleu20}` : "none",
                      "&:hover": { bgcolor: on ? tokens.bleu5 : tokens.grisClair1 },
                      ...focusSx,
                    }}
                  >
                    {t(`label.${key}`)}
                    {!compact && <ChevronRight sx={{ fontSize: 20, color: tokens.gris }} />}
                  </ButtonBase>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * One sheet for every explanation of the page (En savoir plus, the ⓘ of the reviews and of the filters).
 * It opens on the definition that was tapped. Phones: the back arrow in the title bar shows the list of all the definitions.
 * Desktop: a wide side sheet with the list on the left and the definition on the right.
 * Opened from a review, each definition also shows that review's value.
 */
export function DefinitionsSheet({ open, onClose, initial, review, view = "global" }: { open: boolean; onClose: () => void; initial: DefinitionKey; review?: Review; view?: "global" | "controle" }) {
  const t = useTranslations("VarianteFinale.definitions");
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const [current, setCurrent] = useState<DefinitionKey>(initial);
  const [listShown, setListShown] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  // Each opening starts on the definition that was tapped.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setCurrent(initial);
      setListShown(false);
    }
  }
  const go = (key: DefinitionKey) => {
    setCurrent(key);
    setListShown(false);
  };

  if (desktop) {
    return (
      <ResponsiveSheet open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} dialogWidth={760}>
        <Box sx={{ display: "flex", height: "100%", minHeight: 0 }}>
          <Box sx={{ width: 250, flexShrink: 0, borderRight: `1px solid ${tokens.grisMoyen1}`, overflowY: "auto" }}>
            <DefinitionList current={current} onGo={go} compact />
          </Box>
          <Box key={current} sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
            <DefinitionPage name={current} review={review} view={view} heading onGo={go} />
          </Box>
        </Box>
      </ResponsiveSheet>
    );
  }

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={listShown ? t("title") : t(`label.${current}`)}
      closeLabel={t("close")}
      onBack={listShown ? undefined : () => setListShown(true)}
      backLabel={t("all", { count: allKeys.length })}
    >
      {listShown ? <DefinitionList key="list" current={current} onGo={go} compact={false} /> : <DefinitionPage key={current} name={current} review={review} view={view} heading={false} onGo={go} />}
    </ResponsiveSheet>
  );
}
