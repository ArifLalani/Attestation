"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useTranslations } from "next-intl";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import type { Review } from "@/data/types";
import { tokens } from "@/theme/theme";

export type HelpGroup = "levels" | "breakdown" | "details";
/** Which block to explain, the item to bring into view, and what was tapped (the desktop window opens under it). */
export interface HelpRequest {
  group: HelpGroup;
  focus?: string;
  anchor: HTMLElement;
}

interface HelpEntry {
  key: string;
  label: string;
  value?: string;
  text: string;
}

/** The explanations of one block, written for this review's values (rules from Opinion System, 2026-11-02). */
function useHelpEntries(review: Review, group: HelpGroup): { title: string; entries: HelpEntry[] } {
  const t = useTranslations("VarianteFinale.help");
  const td = useTranslations("Reviews.detail");
  const tr = useTranslations("Reviews");
  const ts = useTranslations("SourceNames");
  const tp = useTranslations("Platforms");
  const ta = useTranslations("Activities");
  const { team } = useCertificate();
  const survey = review.survey;
  const activity = ta(review.product);

  if (group === "levels") {
    return {
      title: t("levelsTitle"),
      entries: survey
        ? [
            { key: "recommendation", label: td("recommendationLevel"), value: `${survey.recommendation} %`, text: t("recommendation") },
            { key: "satisfaction", label: td("satisfactionLevel"), value: `${survey.satisfaction} %`, text: t("satisfaction") },
          ]
        : [],
    };
  }
  if (group === "breakdown") {
    return {
      title: t("breakdownTitle"),
      entries: [
        { key: "scores", label: t("scoresLabel"), text: t("scores") },
        { key: "criteria", label: t("criteriaLabel"), value: activity, text: t("criteria", { activity: activity.toLowerCase() }) },
      ],
    };
  }

  const person = team.find((member) => member.id === review.collaboratorId);
  const sourceName = review.platform ? tp(review.platform) : ts(review.source);
  const imported = review.source === "import_iso" || review.source === "import_other";
  const entries: HelpEntry[] = [
    { key: "status", label: tr(review.status === "controle" ? "controle" : "nonControle"), text: t(`status.${review.source}`) },
    { key: "source", label: td("source"), value: survey ? ts("os_certified") : sourceName, text: imported ? t(`source.${review.source}`, { source: sourceName }) : t("source.os") },
  ];
  if (survey) {
    entries.push({
      key: "questionnaire",
      label: td("questionnaire"),
      value: td(survey.questionnaire === "controle" ? "questionnaireControle" : "questionnaireSimple"),
      text: t(`questionnaire.${survey.questionnaire}`),
    });
  }
  if (person) entries.push({ key: "collaborator", label: td("collaborator"), value: person.name, text: t("collaborator", { name: person.name }) });
  entries.push({ key: "activity", label: td("activity"), value: activity, text: t(survey ? "activity" : "activityImport") });
  entries.push({ key: "number", label: td("number"), value: review.reviewNumber, text: t("number") });
  return { title: t("detailsTitle"), entries };
}

/** Scrolls only the sheet (never the page) so the tapped item sits at the top of the list. */
function bringIntoView(node: HTMLElement | null) {
  if (!node) return;
  requestAnimationFrame(() => {
    let scroller = node.parentElement;
    while (scroller && getComputedStyle(scroller).overflowY !== "auto") scroller = scroller.parentElement;
    if (!scroller) return;
    scroller.scrollTop += node.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 8;
  });
}

/** The ⓘ of a block: one per block (levels, répartition, détails) instead of one per line. */
export function HelpButton({ title, onOpen }: { title: string; onOpen: (anchor: HTMLElement) => void }) {
  const t = useTranslations("VarianteFinale.reviews");
  return (
    <IconButton
      onClick={(event) => onOpen(event.currentTarget)}
      aria-haspopup="dialog"
      aria-label={t("explain", { title })}
      sx={{ width: 32, height: 32, m: -0.75, color: tokens.bleu600, "&:hover": { bgcolor: tokens.bleu10 } }}
    >
      <InfoOutlined sx={{ fontSize: 20 }} />
    </IconButton>
  );
}

/**
 * The explanations of a block: a bottom sheet on phones, a small window under what was tapped on desktop.
 * Opened from an item, that item is brought into view and highlighted.
 */
export function ReviewHelpSheet({ review, request, open, onClose }: { review: Review; request: HelpRequest | null; open: boolean; onClose: () => void }) {
  const t = useTranslations("VarianteFinale.reviews");
  const { title, entries } = useHelpEntries(review, request?.group ?? "details");

  return (
    <ResponsiveSheet open={open && Boolean(request)} onClose={onClose} title={title} closeLabel={t("close")} anchorEl={request?.anchor} dropdownWidth={380}>
      <Box component="dl" sx={{ m: 0, px: 1, py: 1 }}>
        {entries.map((entry) => {
          const focused = entry.key === request?.focus;
          return (
            <Box
              key={entry.key}
              ref={focused ? bringIntoView : undefined}
              sx={{
                px: 1,
                py: 1.25,
                borderRadius: "10px",
                bgcolor: focused ? tokens.bleu5 : "transparent",
                boxShadow: focused ? `inset 0 0 0 1px ${tokens.bleu20}` : "none",
                "& + &": { mt: 0.25 },
              }}
            >
              <Box component="dt" sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1.5 }}>
                <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleuFonce }}>{entry.label}</Typography>
                {entry.value && <Typography component="span" sx={{ fontSize: 13, fontWeight: 500, color: tokens.gris, textAlign: "right" }}>{entry.value}</Typography>}
              </Box>
              <Typography component="dd" sx={{ m: 0, mt: 0.25, fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce, opacity: 0.85 }}>{entry.text}</Typography>
            </Box>
          );
        })}
      </Box>
    </ResponsiveSheet>
  );
}
