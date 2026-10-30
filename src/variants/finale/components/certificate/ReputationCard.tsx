"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { Laurel } from "@/variants/finale/components/ui/Laurel";
import { StaffAvatar, TeamAvatar } from "@/variants/finale/components/ui/StaffAvatar";
import { formatCount, formatScore } from "@/lib/format";
import { useCountUp } from "@/lib/hooks";
import { displayScore, headingFor, isPublic, reviewsForScore, summarize, type ScoreView, type StarBucket } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { CollaboratorPicker } from "./CollaboratorPicker";
import { LearnMoreSheet } from "./LearnMoreSheet";

const cardSx = {
  bgcolor: tokens.blanc,
  borderRadius: "20px",
  boxShadow: tokens.shadowCardSoft,
  px: 1.5,
  py: 2,
  display: "flex",
  flexDirection: "column",
  gap: 2,
} as const;

/** Figma "Card Title": green eyebrow + heading. Shared by every section card. */
export function CardTitle({ eyebrow, heading, id }: { eyebrow: string; heading: string; id?: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: tokens.vertOs, letterSpacing: "0.8px", textTransform: "uppercase", lineHeight: "normal" }}>
        {eyebrow}
      </Typography>
      <Typography id={id} component="h2" sx={{ fontSize: 20, fontWeight: 600, lineHeight: "22.8px", letterSpacing: "-0.475px", color: tokens.bleuFonce }}>
        {heading}
      </Typography>
    </Box>
  );
}

function ViewToggle({ view, counts, onChange }: { view: ScoreView; counts: Record<ScoreView, number>; onChange: (view: ScoreView) => void }) {
  const t = useTranslations("Reputation.views");
  const tr = useTranslations("Reputation");
  const segments: { value: ScoreView; icon: React.ReactNode; iconBox: number }[] = [
    { value: "global", icon: <FigmaIcon name={view === "global" ? "globe-white" : "globe-navy"} />, iconBox: 4 },
    { value: "controle", icon: <FigmaIcon name={view === "controle" ? "check-badge-white" : "check-badge-navy"} />, iconBox: 3.429 },
  ];
  return (
    <Box
      role="radiogroup"
      sx={{
        position: "relative",
        display: "flex",
        p: "2px",
        bgcolor: tokens.grisClair2,
        border: `1px solid ${tokens.grisMoyen1}`,
        borderRadius: "8px",
      }}
    >
      {/* Sliding navy pill behind the active segment. */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 2,
          bottom: 2,
          left: 2,
          width: "calc(50% - 2px)",
          borderRadius: "9px",
          bgcolor: tokens.bleuFonce,
          filter: "drop-shadow(0px 2px 3px rgba(4,27,68,0.18))",
          transform: view === "global" ? "translateX(0)" : "translateX(100%)",
          transition: "transform 260ms cubic-bezier(0.2, 0, 0, 1)",
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
              minHeight: 44,
              px: { xs: 1, sm: 1.5 },
              borderRadius: "9px",
              gap: 0,
              color: active ? tokens.blanc : tokens.bleuFonce,
              transition: "color 200ms ease",
            }}
          >
            <Box sx={{ p: `${segment.iconBox}px`, display: "flex", flexShrink: 0 }}>{segment.icon}</Box>
            {/* The count is smaller than the name, so the name still leads; on narrow phones it drops under the name. */}
            <Typography component="span" sx={{ minWidth: 0, display: "inline-flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: 0.5, fontSize: 14, lineHeight: "normal", fontWeight: active || segment.value === "global" ? 600 : 500, whiteSpace: "nowrap" }}>
              <span>{t(segment.value)}</span>
              <Box component="span" sx={{ fontSize: 12, fontWeight: 400 }}>({formatCount(counts[segment.value])})</Box>
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

function ScoreNumber({ value, color }: { value: number; color: string }) {
  const animated = useCountUp(value);
  const [whole, decimal] = displayScore(animated).toFixed(1).split(".");
  return (
    <Box component="p" sx={{ m: 0, fontWeight: 700, color, whiteSpace: "nowrap", lineHeight: 0.74, display: "flex", alignItems: "flex-end", transition: "color 250ms ease" }}>
      <Box component="span" sx={{ fontSize: 68 }}>{whole}</Box>
      <Box component="span" sx={{ fontSize: 32, lineHeight: 0.6 }}>,</Box>
      <Box component="span" sx={{ fontSize: 68 }}>{decimal}</Box>
      <Box component="span" sx={{ fontSize: 24, color: tokens.gris, lineHeight: 0.8 }}>/5</Box>
    </Box>
  );
}

/**
 * Réputation, rebuilt from option F2 in the prototype's style: the advisor selector (label inside) above the switch,
 * the score in its tinted box between two laurels with the verdict under it, the star rows on the right (desktop),
 * and the explanation in an info box whose "En savoir plus" opens a window (desktop) or a sheet (phones).
 */
export function ReputationCard() {
  const t = useTranslations("Reputation");
  const tf = useTranslations("VarianteFinale.reputation");
  const { agency, team, reviews, scoreView, setScoreView, scoreCollaboratorId, setScoreCollaboratorId, setFilters, goToSection } = useCertificate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  const summary = useMemo(
    () => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)),
    [reviews, scoreView, scoreCollaboratorId],
  );
  const counts = useMemo(
    () => ({
      global: reviewsForScore(reviews, "global", scoreCollaboratorId).length,
      controle: reviewsForScore(reviews, "controle", scoreCollaboratorId).length,
    }),
    [reviews, scoreCollaboratorId],
  );
  const person = team.find((member) => member.id === scoreCollaboratorId);
  const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
  const controle = scoreView === "controle";
  const accent = controle ? tokens.vertOs : tokens.bleu400;
  const ink = controle ? tokens.vertOs : tokens.bleuFonce;
  const maxBucket = Math.max(1, ...Object.values(summary.buckets));

  const openBucket = (stars: StarBucket) => {
    setFilters({
      ...emptyFilters,
      note: { stars, exact: true },
      type: controle ? "controle" : undefined,
      collaboratorId: scoreCollaboratorId,
    });
    goToSection("avis");
  };
  const scoreBoxBackground = controle
    ? "linear-gradient(120deg, rgba(67, 182, 163, 0.01) 0%, rgba(38, 128, 112, 0.10) 100%)"
    : "linear-gradient(120deg, rgba(44, 149, 255, 0.01) 0%, rgba(26, 89, 153, 0.10) 100%)";

  return (
    <Box component="section" aria-labelledby="reputation-heading" sx={{ ...cardSx, px: { xs: 1.5, md: 2 }, gap: { xs: 2, md: 3 } }}>
      <Typography id="reputation-heading" component="h2" sx={{ fontSize: 14, fontWeight: 700, color: tokens.vertOs, letterSpacing: "0.8px", textTransform: "uppercase", lineHeight: "normal" }}>
        {t("eyebrow")}
      </Typography>

      {/* Phones: one column. Desktop: selector, switch and score on the left, the star rows on the right. */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 1px minmax(0, 1fr)" }, gap: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
          <ButtonBase
            onClick={() => setPickerOpen(true)}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            aria-label={`${t("scoreFor")} : ${person ? person.name : t("wholeTeam")}`}
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              gap: 1.5,
              pl: 1,
              pr: 2,
              minHeight: 56,
              bgcolor: tokens.grisClair1,
              border: `1px solid ${tokens.grisMoyen1}`,
              borderRadius: "12px",
              textAlign: "left",
              transition: "border-color 150ms ease, background-color 150ms ease",
              "&:hover": { borderColor: tokens.bleu30, bgcolor: tokens.blanc },
            }}
          >
            {person ? <StaffAvatar person={person} size={40} /> : <TeamAvatar size={40} color={tokens.bleuFonce} />}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography component="span" sx={{ display: "block", fontSize: 12, fontWeight: 500, color: tokens.gris, lineHeight: 1.3 }}>
                {t("scoreFor")}
              </Typography>
              <Typography component="span" sx={{ display: "block", fontSize: 16, fontWeight: 600, color: tokens.bleuFonce, lineHeight: 1.3 }}>
                {person ? person.name : t("wholeTeam")}
              </Typography>
            </Box>
            <FigmaIcon name={person ? "arrows-clockwise" : "expand-more"} alt={person ? t("changeCollaborator") : ""} />
          </ButtonBase>
          <ViewToggle view={scoreView} counts={counts} onChange={setScoreView} />

          {visible ? (
            <Box
              sx={{
                flex: { md: 1 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                px: 1.5,
                py: 2.5,
                borderRadius: "12px",
                border: `1px solid ${tokens.grisMoyen1}`,
                background: scoreBoxBackground,
                textAlign: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                <Laurel side="left" color={ink} height={96} />
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                  <ScoreNumber value={summary.average!} color={ink} />
                  <Rating value={summary.average} precision={0.1} readOnly aria-label={t("scoreAria", { score: formatScore(summary.average!) })} sx={{ fontSize: 24 }} />
                </Box>
                <Laurel side="right" color={ink} height={96} />
              </Box>
              <Typography component="p" sx={{ mt: 0.5, fontSize: { xs: 20, md: 22 }, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", color: tokens.bleuFonce }}>
                {t(`heading.${headingFor(summary.average!)}`)}
              </Typography>
              <Typography sx={{ fontSize: 14, color: tokens.gris, lineHeight: 1.4 }}>
                {t(`scoreSource.${scoreView}`)} · {tf("basedOn", { count: formatCount(summary.count) })}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("notPublic")}</Typography>
          )}
        </Box>

        {visible && (
          <>
            <Box aria-hidden sx={{ bgcolor: tokens.grisMoyen1, width: { xs: "100%", md: "1px" }, height: { xs: "1px", md: "auto" } }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
              <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, color: tokens.bleuFonce, lineHeight: "normal" }}>
                {tf("distribution")}
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, flex: { md: 1 }, display: "flex", flexDirection: "column", justifyContent: "space-around", gap: 1 }}>
                {([5, 4, 3, 2, 1] as StarBucket[]).map((stars) => {
                  const count = summary.buckets[stars];
                  return (
                    <li key={stars}>
                      <ButtonBase
                        onClick={() => openBucket(stars)}
                        aria-label={t("bucketLabel", { stars, count: formatCount(count) })}
                        sx={{ width: "100%", minHeight: 36, gap: 1, px: 0.5, mx: -0.5, borderRadius: "8px", "&:hover": { bgcolor: tokens.grisClair1 }, "&:hover .bucket-count": { textDecoration: "underline" } }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", fontWeight: 600, lineHeight: "normal", whiteSpace: "nowrap" }}>
                          <Box component="span" sx={{ fontSize: 14, color: tokens.bleuFonce }}>{stars}</Box>
                          <Box component="span" sx={{ fontSize: 16, color: tokens.jaune600 }}>★</Box>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0, height: 8, borderRadius: "4px", bgcolor: tokens.grisMoyen1, overflow: "hidden" }}>
                          <Box
                            sx={{
                              height: "100%",
                              borderRadius: "4px",
                              bgcolor: accent,
                              width: `${Math.max(count ? 3 : 0, (count / maxBucket) * 100)}%`,
                              transition: "width 500ms cubic-bezier(0.2, 0, 0, 1), background-color 200ms ease",
                            }}
                          />
                        </Box>
                        <Typography className="bucket-count" component="span" sx={{ width: 44, textAlign: "right", fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
                          {formatCount(count)}
                        </Typography>
                        <FigmaIcon name="chevron-right" />
                      </ButtonBase>
                    </li>
                  );
                })}
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* The explanation stands out in an info box; "En savoir plus" opens a window on desktop, a sheet on phones. */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
          p: 2,
          borderRadius: "12px",
          bgcolor: controle ? tokens.successLight2 : tokens.bleu5,
          border: `1px solid ${controle ? "rgba(67, 182, 163, 0.35)" : tokens.bleu20}`,
          transition: "background-color 250ms ease, border-color 250ms ease",
        }}
      >
        <VerifiedRounded sx={{ fontSize: 22, mt: "1px", color: controle ? tokens.vertOs : tokens.bleu600, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: tokens.bleuFonce }}>
          {controle ? t("explainControle", { since: agency.memberSince }) : t("explainGlobal")}{" "}
          <Link
            component="button"
            onClick={() => setLearnMoreOpen(true)}
            aria-haspopup="dialog"
            sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.6, color: tokens.bleu600, textDecorationColor: "currentColor", verticalAlign: "baseline" }}
          >
            {t("learnMore")}
          </Link>
        </Typography>
      </Box>

      <CollaboratorPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={scoreCollaboratorId}
        onSelect={setScoreCollaboratorId}
        view={scoreView}
      />
      <LearnMoreSheet open={learnMoreOpen} onClose={() => setLearnMoreOpen(false)} view={scoreView} />
    </Box>
  );
}
