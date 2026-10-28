"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import Verified from "@mui/icons-material/Verified";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { AiLogo, aiModels } from "@/components/ui/AiLogo";
import type { ReviewSource } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import type { ScoreView, StarBucket } from "@/lib/scoring";
import { CollaboratorPickerA } from "./CollaboratorPicker";
import { a, viewColor, viewText } from "./theme";
import { PersonAvatar, Sheet, StarTiles, TeamAvatarA, cardSx, focusRing } from "./ui";
import { useScore } from "./useScore";

/** Avis global / Avis Contrôlés, with the number of reviews behind each. */
function ViewSwitch({ view, counts, onChange }: { view: ScoreView; counts: Record<ScoreView, number>; onChange: (view: ScoreView) => void }) {
  const t = useTranslations("Reputation.views");
  const tr = useTranslations("Reputation");
  const segments = [
    { value: "global" as const, icon: <LanguageOutlined sx={{ fontSize: 18 }} /> },
    { value: "controle" as const, icon: <Verified sx={{ fontSize: 18 }} /> },
  ];
  return (
    <Box role="radiogroup" aria-label={tr("eyebrow")} sx={{ position: "relative", display: "flex", p: 0.5, bgcolor: a.band, border: `1px solid ${a.line}`, borderRadius: "14px" }}>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 4,
          width: "calc(50% - 4px)",
          borderRadius: "10px",
          bgcolor: a.white,
          border: `1px solid ${a.line}`,
          boxShadow: "0 2px 6px rgba(4,27,68,0.10)",
          transform: view === "global" ? "translateX(0)" : "translateX(100%)",
          transition: `transform 280ms ${a.ease}`,
        }}
      />
      {segments.map((segment) => {
        const active = segment.value === view;
        return (
          <ButtonBase
            key={segment.value}
            role="radio"
            aria-checked={active}
            aria-label={tr("viewCountAria", { view: t(segment.value), count: formatCount(counts[segment.value]) })}
            onClick={() => onChange(segment.value)}
            sx={{
              position: "relative",
              flex: "1 1 0",
              minWidth: 0,
              minHeight: 56,
              px: 1,
              gap: 1,
              borderRadius: "10px",
              color: active ? viewText[segment.value] : a.muted,
              transition: "color 200ms ease",
              ...focusRing,
            }}
          >
            {segment.icon}
            <Box component="span" sx={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0, lineHeight: 1.2 }}>
              <Box component="span" sx={{ fontSize: 14, fontWeight: 800, color: active ? a.navy : a.muted, whiteSpace: "nowrap" }}>{t(segment.value)}</Box>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{tr("reviewCount", { count: formatCount(counts[segment.value]) })}</Box>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

const globalSources: ReviewSource[] = ["os_certified", "import_iso", "os_simple", "import_other"];
const controleSources: ReviewSource[] = ["os_certified", "import_iso"];

/** "En savoir plus": where the reviews behind this score come from, and how they are checked. */
function LearnMore({ open, onClose, view }: { open: boolean; onClose: () => void; view: ScoreView }) {
  const t = useTranslations("LearnMore");
  const ts = useTranslations("Sources");
  const tp = useTranslations("Platforms");
  const { reviews } = useCertificate();
  const controle = view === "controle";
  const counts = useMemo(() => {
    const result: Partial<Record<ReviewSource, number>> = {};
    for (const review of reviews) result[review.source] = (result[review.source] ?? 0) + 1;
    return result;
  }, [reviews]);
  const platforms = useMemo(() => [...new Set(reviews.flatMap((review) => (review.platform ? [review.platform] : [])))], [reviews]);
  const sources = controle ? controleSources : globalSources;
  const largest = Math.max(1, ...sources.map((source) => counts[source] ?? 0));
  const steps = t.raw("controlSteps") as string[];

  return (
    <Sheet open={open} onClose={onClose} title={t(controle ? "titleControle" : "titleGlobal")} closeLabel={t("close")} maxWidth="md">
      <Box sx={{ p: { xs: 2.5, md: 3 }, display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1fr) minmax(0,1fr)" }, columnGap: 4, rowGap: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: 16, lineHeight: 1.6 }}>{t(controle ? "introControle" : "introGlobal")}</Typography>
          {controle && (
            <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5, counterReset: "step" }}>
              {steps.map((step, index) => (
                <Box component="li" key={step} sx={{ display: "flex", gap: 1.5, fontSize: 14, lineHeight: 1.55 }}>
                  <Box aria-hidden sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", bgcolor: a.tealTint, color: a.tealText, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>{index + 1}</Box>
                  <Box sx={{ pt: "4px" }}>{step}</Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 800, mb: 2 }}>{t("sourcesTitle")}</Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {sources.map((source) => {
              const count = counts[source] ?? 0;
              const verified = source === "os_certified" || source === "import_iso";
              return (
                <li key={source}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", mb: 0.75 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{ts(source)}</Typography>
                      {source === "import_other" && platforms.length > 0 && <Typography sx={{ fontSize: 12, color: a.muted }}>{platforms.map((platform) => tp(platform)).join(", ")}</Typography>}
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{t("count", { count: formatCount(count) })}</Typography>
                  </Box>
                  <Box sx={{ height: 8, borderRadius: 4, bgcolor: a.band, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${(count / largest) * 100}%`, borderRadius: 4, bgcolor: verified ? a.teal : a.blue }} />
                  </Box>
                </li>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Sheet>
  );
}

/** The Réputation panel: who the score is for, which reviews, the score and the star rows (filters). */
export function ReputationPanel() {
  const t = useTranslations("Reputation");
  const tv = useTranslations("VarianteA");
  const { agency, scoreView, setScoreView, scoreCollaboratorId, setScoreCollaboratorId, filters, setFilters, goToSection } = useCertificate();
  const { summary, visible, heading, person, counts } = useScore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerEl, setPickerEl] = useState<HTMLButtonElement | null>(null);
  const [learnMore, setLearnMore] = useState(false);
  const controle = scoreView === "controle";
  const color = viewColor[scoreView];

  const toggleBucket = (stars: StarBucket) => {
    const active = filters.note?.exact && filters.note.stars === stars;
    if (active) {
      setFilters({ ...filters, note: undefined });
      return;
    }
    setFilters({ ...emptyFilters, note: { stars, exact: true }, type: controle ? "controle" : undefined, collaboratorId: scoreCollaboratorId });
    goToSection("avis");
  };

  return (
    <Box component="section" aria-labelledby="a-reputation-title" sx={{ ...cardSx, p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0, textTransform: "none", color: a.tealText, mb: 0.5 }}>{t("eyebrow")}</Typography>
        <Typography id="a-reputation-title" component="h2" sx={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.015em", lineHeight: 1.25 }}>{t(`heading.${heading}`)}</Typography>
      </Box>

      <Box>
        <Typography component="label" htmlFor="a-score-for" sx={{ display: "block", fontSize: 13, fontWeight: 700, color: a.muted, mb: 0.75 }}>{t("scoreFor")}</Typography>
        <ButtonBase
          id="a-score-for"
          ref={setPickerEl}
          onClick={() => setPickerOpen(true)}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            gap: 1.5,
            pl: 1,
            pr: 1.5,
            minHeight: 56,
            borderRadius: "14px",
            border: `1px solid ${a.lineStrong}`,
            bgcolor: a.white,
            textAlign: "left",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            "&:hover": { borderColor: a.navy },
            ...focusRing,
          }}
        >
          {person ? <PersonAvatar person={person} /> : <TeamAvatarA />}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>{person ? person.name : t("wholeTeam")}</Typography>
            <Typography sx={{ fontSize: 13, color: a.muted, lineHeight: 1.3 }}>{person ? person.role : tv("reputation.teamOf", { name: agency.name })}</Typography>
          </Box>
          {person ? <SwapHoriz aria-label={t("changeCollaborator")} sx={{ color: a.navy }} /> : <ExpandMore sx={{ color: a.navy }} />}
        </ButtonBase>
      </Box>

      <ViewSwitch view={scoreView} counts={counts} onChange={setScoreView} />

      {visible ? (
        <>
          {/* Desktop sidebar: a compact score, since the big one stays in the hero. */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 1.5 }}>
            <Box component="span" sx={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: controle ? a.tealText : a.navy, fontVariantNumeric: "tabular-nums" }}>{formatScore(summary.average!)}</Box>
            <Box>
              <StarTiles value={summary.average!} size={18} color={color} label={t("scoreAria", { score: formatScore(summary.average!) })} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: a.muted, mt: 0.25 }}>{t("reviewCount", { count: formatCount(summary.count) })}</Typography>
            </Box>
          </Box>

          <Box component="ul" aria-label={tv("reputation.distribution")} sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
            {([5, 4, 3, 2, 1] as StarBucket[]).map((stars) => {
              const count = summary.buckets[stars];
              const share = summary.count ? Math.round((count / summary.count) * 100) : 0;
              const active = Boolean(filters.note?.exact && filters.note.stars === stars);
              return (
                <li key={stars}>
                  <ButtonBase
                    onClick={() => toggleBucket(stars)}
                    aria-pressed={active}
                    aria-label={t("bucketLabel", { stars, count: formatCount(count) })}
                    sx={{
                      width: "100%",
                      minHeight: 40,
                      px: 1,
                      mx: -1,
                      boxSizing: "content-box",
                      gap: 1.5,
                      borderRadius: "10px",
                      bgcolor: active ? a.blueTint : "transparent",
                      "&:hover": { bgcolor: active ? a.blueTint : a.band },
                      "&:hover .a-bucket-label": { textDecoration: "underline" },
                      ...focusRing,
                    }}
                  >
                    <Box component="span" aria-hidden sx={{ width: 20, height: 20, flexShrink: 0, borderRadius: "6px", border: `1.5px solid ${active ? a.navy : a.lineStrong}`, bgcolor: active ? a.navy : a.white, display: "grid", placeItems: "center", color: a.white, fontSize: 13, fontWeight: 800 }}>
                      {active ? "✓" : ""}
                    </Box>
                    <Typography className="a-bucket-label" component="span" sx={{ width: 64, flexShrink: 0, textAlign: "left", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {tv("reputation.stars", { stars })}
                    </Typography>
                    <Box sx={{ flex: 1, minWidth: 0, height: 10, borderRadius: 5, bgcolor: a.band, border: `1px solid ${a.line}`, overflow: "hidden" }}>
                      <Box sx={{ height: "100%", width: `${Math.max(count ? 2 : 0, share)}%`, borderRadius: 5, bgcolor: color, transition: `width 600ms ${a.ease}, background-color 250ms ease` }} />
                    </Box>
                    <Typography component="span" sx={{ width: 44, flexShrink: 0, textAlign: "right", fontSize: 14, fontWeight: 700, color: a.muted, fontVariantNumeric: "tabular-nums" }}>
                      {share} %
                    </Typography>
                  </ButtonBase>
                </li>
              );
            })}
          </Box>
        </>
      ) : (
        <Typography sx={{ fontSize: 14, color: a.muted }}>{t("notPublic")}</Typography>
      )}

      <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: a.muted, pt: 2, borderTop: `1px solid ${a.line}` }}>
        {controle ? t("explainControle", { since: agency.memberSince }) : t("explainGlobal")}{" "}
        <Link component="button" onClick={() => setLearnMore(true)} sx={{ fontSize: "inherit", fontWeight: 700, color: a.blueText, verticalAlign: "baseline", textUnderlineOffset: "3px", ...focusRing }}>
          {t("learnMore")}
        </Link>
      </Typography>

      <CollaboratorPickerA open={pickerOpen} onClose={() => setPickerOpen(false)} selectedId={scoreCollaboratorId} onSelect={setScoreCollaboratorId} view={scoreView} anchorEl={pickerOpen ? pickerEl : null} />
      <LearnMore open={learnMore} onClose={() => setLearnMore(false)} view={scoreView} />
    </Box>
  );
}

/** "Demander à l'IA": one button per assistant, each opening the chat. */
export function AskAiCard() {
  const t = useTranslations("Assistant");
  const { openAssistant } = useCertificate();
  return (
    <Box
      component="section"
      aria-labelledby="a-ai-title"
      sx={{
        ...cardSx,
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: `linear-gradient(160deg, ${a.white} 40%, ${a.tealTint} 140%)`,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <Box aria-hidden sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: "12px", bgcolor: a.navy, display: "grid", placeItems: "center" }}>
          <AutoAwesome sx={{ color: "#7fd9c9", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography id="a-ai-title" component="h2" sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{t("cardHeading")}</Typography>
          <Typography sx={{ fontSize: 14, color: a.muted, lineHeight: 1.5, mt: 0.25 }}>{t("cardText")}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))", lg: "repeat(2, minmax(0,1fr))" }, gap: 1 }}>
        {aiModels.map((model) => (
          <ButtonBase
            key={model}
            onClick={() => openAssistant(model)}
            aria-label={t("openWith", { model: t(`models.${model}`) })}
            sx={{
              minHeight: 44,
              justifyContent: "flex-start",
              gap: 1,
              px: 1.5,
              borderRadius: "10px",
              border: `1px solid ${a.lineStrong}`,
              bgcolor: a.white,
              fontSize: 14,
              fontWeight: 700,
              color: a.navy,
              transition: `border-color 150ms ease, transform 150ms ${a.ease}`,
              "&:hover": { borderColor: a.navy, transform: "translateY(-1px)" },
              ...focusRing,
            }}
          >
            <AiLogo model={model} sx={{ fontSize: 20 }} />
            {t(`models.${model}`)}
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}
