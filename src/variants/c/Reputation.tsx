"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/material/styles";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Public from "@mui/icons-material/Public";
import StarRounded from "@mui/icons-material/StarRounded";
import Verified from "@mui/icons-material/Verified";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import type { ReviewSource } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { useCountUp } from "@/lib/hooks";
import { displayScore, headingFor, isPublic, reviewsForScore, summarize, type ScoreView, type StarBucket } from "@/lib/scoring";
import { CollaboratorField, CollaboratorPickerC } from "./CollaboratorPickerC";
import { Sheet, Stars } from "./ui";
import { focusRing, pc } from "./theme";

export const grow = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

/** Bar that grows from the left when it appears, and slides when its value changes. */
export function Bar({ value, color, height = 8, track = pc.outline }: { value: number; color: string; height?: number; track?: string }) {
  return (
    <Box aria-hidden sx={{ flex: 1, minWidth: 0, height, borderRadius: height / 2, bgcolor: track, overflow: "hidden" }}>
      <Box
        sx={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: "100%",
          borderRadius: height / 2,
          bgcolor: color,
          transformOrigin: "left center",
          animation: `${grow} 700ms cubic-bezier(0.2, 0, 0, 1) both`,
          transition: "width 450ms cubic-bezier(0.2, 0, 0, 1), background-color 300ms ease",
          "@media (prefers-reduced-motion: reduce)": { animation: "none", transition: "none" },
        }}
      />
    </Box>
  );
}

const viewColor = (view: ScoreView) => (view === "controle" ? { fill: pc.emerald, text: pc.emeraldText, tint: pc.emeraldTint } : { fill: pc.indigo, text: pc.indigoDark, tint: pc.indigoTonal });

/** Material 3 segmented button: Avis global / Avis Contrôlés, each with its review count. */
function ViewSwitch({ view, counts, onChange }: { view: ScoreView; counts: Record<ScoreView, number>; onChange: (view: ScoreView) => void }) {
  const t = useTranslations("Reputation");
  return (
    <Box role="radiogroup" aria-label={t("views.global") + " / " + t("views.controle")} sx={{ display: "flex", borderRadius: 999, border: `1px solid ${pc.outlineStrong}`, overflow: "hidden" }}>
      {(["global", "controle"] as const).map((key, index) => {
        const active = key === view;
        const colors = viewColor(key);
        return (
          <ButtonBase
            key={key}
            role="radio"
            aria-checked={active}
            aria-label={t("viewCountAria", { view: t(`views.${key}`), count: formatCount(counts[key]) })}
            onClick={() => onChange(key)}
            sx={{
              flex: "1 1 0",
              minWidth: 0,
              minHeight: 48,
              px: { xs: 1, sm: 1.5 },
              gap: 0.75,
              borderLeft: index ? `1px solid ${pc.outlineStrong}` : "none",
              bgcolor: active ? colors.tint : "#fff",
              color: active ? colors.text : pc.ink,
              transition: "background-color 200ms ease, color 200ms ease",
              "&:hover": { bgcolor: active ? colors.tint : pc.surfaceDim },
              "&.Mui-focusVisible": { outline: `2px solid ${pc.indigo}`, outlineOffset: -3 },
            }}
          >
            {key === "controle" ? <Verified sx={{ fontSize: 18, flexShrink: 0 }} /> : <Public sx={{ fontSize: 18, flexShrink: 0 }} />}
            <Box component="span" sx={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", columnGap: 0.5, fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
              <span>{t(`views.${key}`)}</span>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 500, opacity: 0.85 }}>({formatCount(counts[key])})</Box>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/** Réputation: who the score is for, which reviews, the score and the star rows (each row lists its reviews). */
export function Reputation({ dense = false }: { dense?: boolean }) {
  const t = useTranslations("Reputation");
  const tv = useTranslations("VarianteC");
  const { agency, reviews, scoreView, setScoreView, scoreCollaboratorId, setScoreCollaboratorId, setFilters, goToSection } = useCertificate();
  const titleId = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const summary = useMemo(() => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)), [reviews, scoreView, scoreCollaboratorId]);
  const counts = useMemo(
    () => ({
      global: reviewsForScore(reviews, "global", scoreCollaboratorId).length,
      controle: reviewsForScore(reviews, "controle", scoreCollaboratorId).length,
    }),
    [reviews, scoreCollaboratorId],
  );
  const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
  const animated = useCountUp(visible ? displayScore(summary.average!) : 0);
  const colors = viewColor(scoreView);
  const maxBucket = Math.max(1, ...Object.values(summary.buckets));

  const openBucket = (stars: StarBucket) => {
    setFilters({ ...emptyFilters, note: { stars, exact: true }, type: scoreView === "controle" ? "controle" : undefined, collaboratorId: scoreCollaboratorId });
    goToSection("avis");
  };

  return (
    <Box component="section" aria-labelledby={titleId} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box>
        <Typography component="h2" id={titleId} sx={{ fontSize: dense ? 20 : { xs: 22, md: 24 }, fontWeight: 700, lineHeight: 1.25 }}>
          {tv("reputationTitle")}
        </Typography>
        {visible && <Typography sx={{ mt: 0.25, fontSize: 15, color: pc.muted }}>{t(`heading.${headingFor(summary.average!)}`)}</Typography>}
      </Box>

      <CollaboratorField onOpen={() => setPickerOpen(true)} />
      <ViewSwitch view={scoreView} counts={counts} onChange={setScoreView} />

      {visible ? (
        <Box sx={{ display: "flex", gap: { xs: 2, sm: 3 }, alignItems: "center" }}>
          <Box sx={{ width: { xs: 104, sm: 120 }, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 0.75 }}>
            <Typography aria-label={t("scoreAria", { score: formatScore(summary.average!) })} sx={{ fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: pc.ink }}>
              {formatScore(animated)}
            </Typography>
            <Stars value={summary.average!} size={18} />
            <Typography sx={{ fontSize: 13, color: pc.muted, fontWeight: 600 }}>{t("reviewCount", { count: formatCount(summary.count) })}</Typography>
          </Box>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {([5, 4, 3, 2, 1] as StarBucket[]).map((stars) => (
              <li key={stars}>
                <ButtonBase
                  onClick={() => openBucket(stars)}
                  aria-label={t("bucketLabel", { stars, count: formatCount(summary.buckets[stars]) })}
                  sx={{ width: "100%", minHeight: 32, gap: 1, px: 0.75, mx: -0.75, borderRadius: "8px", boxSizing: "content-box", "&:hover": { bgcolor: pc.surfaceDim }, "&.Mui-focusVisible": focusRing, "&:hover .vc-chev": { opacity: 1 } }}
                >
                  <Box component="span" sx={{ width: 26, display: "inline-flex", alignItems: "center", fontSize: 13, fontWeight: 700, color: pc.ink }}>
                    {stars}
                    <StarRounded sx={{ fontSize: 14, color: pc.star }} />
                  </Box>
                  <Bar value={(summary.buckets[stars] / maxBucket) * 100} color={colors.fill} />
                  <Box component="span" sx={{ minWidth: 40, textAlign: "right", fontSize: 13, fontWeight: 600, color: pc.muted, fontVariantNumeric: "tabular-nums" }}>
                    {formatCount(summary.buckets[stars])}
                  </Box>
                  <ChevronRight className="vc-chev" sx={{ fontSize: 18, color: pc.muted, opacity: 0.6, ml: -0.5 }} />
                </ButtonBase>
              </li>
            ))}
          </Box>
        </Box>
      ) : (
        <Typography sx={{ fontSize: 15, color: pc.muted }}>{t("notPublic")}</Typography>
      )}

      <Box sx={{ display: "flex", gap: 1.25, p: 1.5, borderRadius: "16px", bgcolor: colors.tint, color: colors.text }}>
        {scoreView === "controle" ? <Verified sx={{ fontSize: 20, mt: "1px" }} /> : <Public sx={{ fontSize: 20, mt: "1px" }} />}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>{t(`scoreSource.${scoreView}`)}</Typography>
          <Typography sx={{ fontSize: 13, lineHeight: 1.45, color: pc.ink, mt: 0.25 }}>
            {scoreView === "controle" ? t("explainControle", { since: agency.memberSince }) : t("explainGlobal")}{" "}
            <ButtonBase onClick={() => setLearnOpen(true)} sx={{ verticalAlign: "baseline", fontSize: 13, fontWeight: 700, color: colors.text, textDecoration: "underline", textUnderlineOffset: "3px", borderRadius: "4px", "&.Mui-focusVisible": focusRing }}>
              {t("learnMore")}
            </ButtonBase>
          </Typography>
        </Box>
      </Box>

      <CollaboratorPickerC open={pickerOpen} onClose={() => setPickerOpen(false)} selectedId={scoreCollaboratorId} onSelect={setScoreCollaboratorId} view={scoreView} />
      <LearnMoreSheetC open={learnOpen} onClose={() => setLearnOpen(false)} view={scoreView} />
    </Box>
  );
}

const globalSources: ReviewSource[] = ["os_certified", "import_iso", "os_simple", "import_other"];
const controleSources: ReviewSource[] = ["os_certified", "import_iso"];

/** "En savoir plus": what the score of the active view covers, where the reviews come from, how they are checked. */
function LearnMoreSheetC({ open, onClose, view }: { open: boolean; onClose: () => void; view: ScoreView }) {
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
    <Sheet open={open} onClose={onClose} title={t(controle ? "titleControle" : "titleGlobal")} closeLabel={t("close")}>
      <Box sx={{ px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography sx={{ fontSize: 15, lineHeight: 1.55 }}>{t(controle ? "introControle" : "introGlobal")}</Typography>
        <Box>
          <Typography component="h3" sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>{t("sourcesTitle")}</Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.75 }}>
            {sources.map((source) => {
              const count = counts[source] ?? 0;
              const verified = source === "os_certified" || source === "import_iso";
              return (
                <li key={source}>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.75 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{ts(source)}</Typography>
                      {source === "import_other" && platforms.length > 0 && <Typography sx={{ fontSize: 12, color: pc.muted }}>{platforms.map((platform) => tp(platform)).join(", ")}</Typography>}
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{t("count", { count: formatCount(count) })}</Typography>
                  </Box>
                  <Bar value={(count / largest) * 100} color={verified ? pc.emerald : pc.indigo} height={6} />
                </li>
              );
            })}
          </Box>
        </Box>
        {controle && (
          <Box>
            <Typography component="h3" sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>{t("controlTitle")}</Typography>
            <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5, counterReset: "step" }}>
              {steps.map((step, index) => (
                <Box component="li" key={step} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Box aria-hidden sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: pc.emeraldTint, color: pc.emeraldText, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{index + 1}</Box>
                  <Typography sx={{ fontSize: 14, lineHeight: 1.5, pt: 0.5 }}>{step}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Sheet>
  );
}
