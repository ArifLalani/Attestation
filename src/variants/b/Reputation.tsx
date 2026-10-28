"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import BoltOutlined from "@mui/icons-material/BoltOutlined";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import EuroRounded from "@mui/icons-material/EuroRounded";
import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import TipsAndUpdatesOutlined from "@mui/icons-material/TipsAndUpdatesOutlined";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import WavingHandOutlined from "@mui/icons-material/WavingHandOutlined";
import WorkspacePremiumOutlined from "@mui/icons-material/WorkspacePremiumOutlined";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import type { Criterion, ReviewSource } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { useCountUp } from "@/lib/hooks";
import { displayScore, headingFor, type ScoreView, type StarBucket } from "@/lib/scoring";
import { Laurel } from "./Laurel";
import { PickerB } from "./Picker";
import { b } from "./theme";
import { focusSx, Hairline, HEADER_VAR, PersonAvatar, Sheet, Stars, TeamAvatarB, TextLink } from "./ui";
import { useScore } from "./useScore";

const criterionIcons: Record<Criterion, React.ReactNode> = {
  accueil: <WavingHandOutlined />,
  conseil: <TipsAndUpdatesOutlined />,
  competence: <WorkspacePremiumOutlined />,
  reactivite: <BoltOutlined />,
  suivi: <RouteOutlined />,
  transparence: <VisibilityOutlined />,
  honoraires: <EuroRounded />,
};
const criteria = Object.keys(criterionIcons) as Criterion[];

/** Segmented switch with a sliding white thumb. */
function ViewSwitch({ view, counts, onChange }: { view: ScoreView; counts: Record<ScoreView, number>; onChange: (view: ScoreView) => void }) {
  const t = useTranslations("Reputation");
  const segments = [
    { value: "global" as const, icon: <LanguageRounded /> },
    { value: "controle" as const, icon: <VerifiedRounded /> },
  ];
  return (
    <Box role="radiogroup" aria-label={`${t("views.global")} / ${t("views.controle")}`} sx={{ position: "relative", display: "flex", p: 0.5, borderRadius: 999, bgcolor: b.sand }}>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 4,
          width: "calc(50% - 4px)",
          borderRadius: 999,
          bgcolor: b.white,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08)",
          transform: view === "global" ? "none" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.2, 0, 0, 1)",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      />
      {segments.map((segment) => {
        const active = segment.value === view;
        return (
          <ButtonBase
            key={segment.value}
            role="radio"
            aria-checked={active}
            aria-label={t("viewCountAria", { view: t(`views.${segment.value}`), count: formatCount(counts[segment.value]) })}
            onClick={() => onChange(segment.value)}
            sx={{
              position: "relative",
              flex: "1 1 0",
              minWidth: 0,
              minHeight: 48,
              px: 1,
              gap: 0.75,
              borderRadius: 999,
              color: active ? b.ink : b.muted,
              fontFamily: b.sans,
              transition: "color 200ms ease",
              "& svg": { fontSize: 18, flexShrink: 0, color: active && segment.value === "controle" ? b.sage : "inherit" },
              ...focusSx,
            }}
          >
            {segment.icon}
            <Box component="span" sx={{ minWidth: 0, display: "inline-flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: 0.5, fontSize: 15, fontWeight: active ? 700 : 500, lineHeight: 1.2 }}>
              <span>{t(`views.${segment.value}`)}</span>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 500 }}>({formatCount(counts[segment.value])})</Box>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

function BigScore({ value, color }: { value: number; color: string }) {
  const animated = useCountUp(value, 800);
  return (
    <Typography component="p" sx={{ m: 0, fontFamily: b.serif, fontVariationSettings: '"SOFT" 100, "opsz" 144', fontWeight: 600, fontSize: { xs: 72, md: 88 }, lineHeight: 0.9, letterSpacing: "-0.03em", color, transition: "color 250ms ease", fontVariantNumeric: "tabular-nums" }}>
      {formatScore(displayScore(animated))}
    </Typography>
  );
}

const globalSources: ReviewSource[] = ["os_certified", "import_iso", "os_simple", "import_other"];
const controleSources: ReviewSource[] = ["os_certified", "import_iso"];

/** "En savoir plus": where the reviews come from and, for Avis Contrôlés, how they are checked. */
function LearnMoreB({ open, onClose, view }: { open: boolean; onClose: () => void; view: ScoreView }) {
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
    <Sheet open={open} onClose={onClose} title={t(controle ? "titleControle" : "titleGlobal")} closeLabel={t("close")} width={600}>
      <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography sx={{ fontSize: 16, lineHeight: 1.6 }}>{t(controle ? "introControle" : "introGlobal")}</Typography>
        <Box>
          <Typography component="h3" sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: 20, mb: 2 }}>{t("sourcesTitle")}</Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {sources.map((source) => {
              const count = counts[source] ?? 0;
              const verified = source === "os_certified" || source === "import_iso";
              return (
                <li key={source}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
                    <Box>
                      <Typography sx={{ fontSize: 15 }}>{ts(source)}</Typography>
                      {source === "import_other" && <Typography sx={{ fontSize: 13, color: b.muted }}>{platforms.map((platform) => tp(platform)).join(", ")}</Typography>}
                    </Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}>{t("count", { count: formatCount(count) })}</Typography>
                  </Box>
                  <Box sx={{ height: 8, borderRadius: 4, bgcolor: b.sand, overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${(count / largest) * 100}%`, borderRadius: 4, bgcolor: verified ? b.sage : b.ink }} />
                  </Box>
                </li>
              );
            })}
          </Box>
        </Box>
        {controle && (
          <Box>
            <Typography component="h3" sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: 20, mb: 2 }}>{t("controlTitle")}</Typography>
            <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {steps.map((step, index) => (
                <Box component="li" key={step} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box aria-hidden sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: b.sageTint, color: b.sageText, display: "grid", placeItems: "center", fontWeight: 700, flexShrink: 0 }}>{index + 1}</Box>
                  <Typography sx={{ fontSize: 15, lineHeight: 1.55, pt: 0.5 }}>{step}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Sheet>
  );
}

/** Réputation: who the score is for, the switch, the big laurel score, the star rows and the criteria. */
export function Reputation() {
  const t = useTranslations("Reputation");
  const tb = useTranslations("VarianteB.reputation");
  const tc = useTranslations("Criteria");
  const { agency, team, scoreView, setScoreView, scoreCollaboratorId, setScoreCollaboratorId, setFilters, goToSection } = useCertificate();
  const { scored, summary, counts, visible, controle } = useScore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [learnMore, setLearnMore] = useState(false);
  const person = team.find((member) => member.id === scoreCollaboratorId);
  const color = controle ? b.sage : b.ink;
  const maxBucket = Math.max(1, ...Object.values(summary.buckets));

  const byCriterion = useMemo(
    () =>
      criteria.map((criterion) => {
        const matching = scored.filter((review) => review.criteria.includes(criterion));
        return { criterion, count: matching.length, average: matching.length ? matching.reduce((sum, review) => sum + review.rating, 0) / matching.length : null };
      }),
    [scored],
  );
  const recommendation = useMemo(() => {
    const surveys = scored.filter((review) => review.survey);
    return surveys.length ? Math.round(surveys.reduce((sum, review) => sum + review.survey!.recommendation, 0) / surveys.length) : null;
  }, [scored]);

  const showReviews = (patch: Partial<typeof emptyFilters>) => {
    setFilters({ ...emptyFilters, type: controle ? "controle" : undefined, collaboratorId: scoreCollaboratorId, ...patch });
    goToSection("avis");
  };

  return (
    <Box component="section" id="b-reputation" aria-labelledby="b-reputation-title" sx={{ scrollMarginTop: `calc(${HEADER_VAR} + 16px)`, bgcolor: b.white, borderRadius: "28px", boxShadow: b.shadow, p: { xs: 2, sm: 3, md: 4 }, display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}>
      <Typography id="b-reputation-title" component="h2" sx={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
        {tb("title")}
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1.25fr)" }, gap: 1.5 }}>
        <ButtonBase
          onClick={() => setPickerOpen(true)}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          aria-label={`${t("scoreFor")} : ${person ? person.name : t("wholeTeam")}`}
          sx={{ justifyContent: "flex-start", gap: 1.5, pl: 1, pr: 2, minHeight: 56, borderRadius: 999, textAlign: "left", boxShadow: `inset 0 0 0 1px ${b.lineStrong}`, transition: "box-shadow 150ms ease", "&:hover": { boxShadow: `inset 0 0 0 2px ${b.ink}` }, ...focusSx }}
        >
          {person ? <PersonAvatar person={person} size={40} /> : <TeamAvatarB size={40} />}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="span" sx={{ display: "block", fontSize: 12, fontWeight: 700, color: b.muted, lineHeight: 1.3 }}>{t("scoreFor")}</Typography>
            <Typography component="span" sx={{ display: "block", fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{person ? person.name : t("wholeTeam")}</Typography>
          </Box>
          <KeyboardArrowDownRounded />
        </ButtonBase>
        <ViewSwitch view={scoreView} counts={counts} onChange={setScoreView} />
      </Box>

      {visible ? (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
              <Laurel side="left" color={color} height={104} />
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <BigScore value={summary.average!} color={color} />
                <Stars value={summary.average!} size={20} color={color} label={t("scoreAria", { score: formatScore(summary.average!) })} />
              </Box>
              <Laurel side="right" color={color} height={104} />
            </Box>
            <Typography component="p" sx={{ fontFamily: b.serif, fontVariationSettings: '"SOFT" 100', fontWeight: 600, fontSize: { xs: 22, md: 26 }, lineHeight: 1.2 }}>
              {t(`heading.${headingFor(summary.average!)}`)}
            </Typography>
            <Typography sx={{ maxWidth: 420, fontSize: 15, color: b.muted, lineHeight: 1.5 }}>
              {t(`scoreSource.${scoreView}`)} · {tb("basedOn", { count: formatCount(summary.count) })}
            </Typography>
          </Box>

          <Hairline />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, columnGap: 5, rowGap: 3 }}>
            <Box>
              <Typography component="h3" sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>{tb("distribution")}</Typography>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column" }}>
                {([5, 4, 3, 2, 1] as StarBucket[]).map((stars) => {
                  const count = summary.buckets[stars];
                  return (
                    <li key={stars}>
                      <ButtonBase
                        onClick={() => showReviews({ note: { stars, exact: true } })}
                        aria-label={t("bucketLabel", { stars, count: formatCount(count) })}
                        sx={{ width: "100%", minHeight: 44, gap: 1.5, px: 1, mx: -1, borderRadius: "12px", "&:hover": { bgcolor: b.ivory }, "&:hover .b-count": { textDecoration: "underline" }, ...focusSx }}
                      >
                        <Typography component="span" sx={{ width: 12, fontSize: 14, fontWeight: 600 }}>{stars}</Typography>
                        <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: b.sand, overflow: "hidden" }}>
                          <Box sx={{ height: "100%", borderRadius: 3, bgcolor: color, width: `${Math.max(count ? 2 : 0, (count / maxBucket) * 100)}%`, transition: "width 600ms cubic-bezier(0.2, 0, 0, 1), background-color 250ms ease" }} />
                        </Box>
                        <Typography className="b-count" component="span" sx={{ width: 44, textAlign: "right", fontSize: 14, fontWeight: 600, textUnderlineOffset: "3px" }}>
                          {formatCount(count)}
                        </Typography>
                        <ChevronRightRounded sx={{ fontSize: 18, color: b.muted }} />
                      </ButtonBase>
                    </li>
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography component="h3" sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>{tb("criteria")}</Typography>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
                {byCriterion.map(({ criterion, average, count }) => (
                  <li key={criterion}>
                    <ButtonBase
                      disabled={!count}
                      onClick={() => showReviews({ criteria: [criterion] })}
                      aria-label={average !== null ? tb("criterionLink", { criterion: tc(criterion), score: formatScore(average), count: formatCount(count) }) : tc(criterion)}
                      sx={{ width: "100%", height: "100%", minHeight: 64, justifyContent: "flex-start", alignItems: "center", gap: 1.25, px: 1.5, py: 1, borderRadius: "16px", boxShadow: `inset 0 0 0 1px ${b.line}`, textAlign: "left", transition: "box-shadow 150ms ease, transform 150ms ease", "&:hover": { boxShadow: `inset 0 0 0 1px ${b.ink}` }, "& svg": { fontSize: 22, color: b.ink }, ...focusSx }}
                    >
                      {criterionIcons[criterion]}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography component="span" sx={{ display: "block", fontSize: 13, color: b.muted, lineHeight: 1.3 }}>{tc(criterion)}</Typography>
                        <Typography component="span" sx={{ display: "block", fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{average !== null ? formatScore(average) : "—"}</Typography>
                      </Box>
                    </ButtonBase>
                  </li>
                ))}
                {recommendation !== null && (
                  <Box component="li" sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1, minHeight: 64, borderRadius: "16px", bgcolor: b.accentTint, "& svg": { fontSize: 22, color: b.accentDark } }}>
                    <FavoriteBorderRounded />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, color: b.accentDark, lineHeight: 1.3 }}>{tb("recommendation")}</Typography>
                      <Typography sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, color: b.accentDark }}>{recommendation}&nbsp;%</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Typography sx={{ fontSize: 15, color: b.muted, textAlign: "center", py: 2 }}>{t("notPublic")}</Typography>
      )}

      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", p: 2, borderRadius: "16px", bgcolor: controle ? b.sageTint : b.ivory, transition: "background-color 250ms ease" }}>
        <VerifiedRounded sx={{ color: controle ? b.sage : b.muted, mt: 0.25 }} />
        <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: controle ? b.sageText : b.ink }}>
          {controle ? t("explainControle", { since: agency.memberSince }) : t("explainGlobal")}{" "}
          <TextLink onClick={() => setLearnMore(true)} aria-haspopup="dialog" sx={{ minHeight: 0, p: 0, fontSize: 14, color: "inherit", verticalAlign: "baseline" }}>
            {t("learnMore")}
          </TextLink>
        </Typography>
      </Box>

      <PickerB open={pickerOpen} onClose={() => setPickerOpen(false)} selectedId={scoreCollaboratorId} onSelect={setScoreCollaboratorId} view={scoreView} />
      <LearnMoreB open={learnMore} onClose={() => setLearnMore(false)} view={scoreView} />
    </Box>
  );
}
