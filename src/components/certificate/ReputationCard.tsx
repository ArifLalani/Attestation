"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { StaffAvatar, TeamAvatar } from "@/components/ui/StaffAvatar";
import { formatCount, formatScore } from "@/lib/format";
import { useCountUp } from "@/lib/hooks";
import { displayScore, headingFor, isPublic, reviewsForScore, summarize, type ScoreView, type StarBucket } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "./CertificateContext";
import { CollaboratorPicker } from "./CollaboratorPicker";
import { LearnMoreContent, LearnMoreSheet } from "./LearnMoreSheet";

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

function ViewToggle({ view, onChange }: { view: ScoreView; onChange: (view: ScoreView) => void }) {
  const t = useTranslations("Reputation.views");
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
            onClick={() => onChange(segment.value)}
            sx={{
              position: "relative",
              flex: "1 1 0",
              minHeight: 44,
              px: 1.5,
              borderRadius: "9px",
              gap: 0,
              color: active ? tokens.blanc : tokens.bleuFonce,
              transition: "color 200ms ease",
            }}
          >
            <Box sx={{ p: `${segment.iconBox}px`, display: "flex" }}>{segment.icon}</Box>
            <Typography component="span" sx={{ fontSize: 14, lineHeight: "normal", fontWeight: active || segment.value === "global" ? 600 : 500, whiteSpace: "nowrap" }}>
              {t(segment.value)}
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
    <Box component="p" sx={{ m: 0, fontWeight: 700, color, whiteSpace: "nowrap", lineHeight: 0.74, display: "flex", alignItems: "flex-end" }}>
      <Box component="span" sx={{ fontSize: 68 }}>{whole}</Box>
      <Box component="span" sx={{ fontSize: 32, lineHeight: 0.6 }}>,</Box>
      <Box component="span" sx={{ fontSize: 68 }}>{decimal}</Box>
      <Box component="span" sx={{ fontSize: 24, color: tokens.gris, lineHeight: 0.8 }}>/5</Box>
    </Box>
  );
}

/** Figma "Score Card" (1353:11747 page instance; variants 1355:71820). */
export function ReputationCard() {
  const t = useTranslations("Reputation");
  const { agency, team, reviews, scoreView, setScoreView, scoreCollaboratorId, setScoreCollaboratorId, setFilters, goToSection } = useCertificate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [scoreForEl, setScoreForEl] = useState<HTMLButtonElement | null>(null);

  // Desktop dropdown: make room under the selector first, so the list always opens downwards.
  const openPicker = () => {
    const DROPDOWN_HEIGHT = 470;
    const rect = scoreForEl?.getBoundingClientRect();
    const missing = rect && window.matchMedia("(min-width:900px)").matches ? rect.bottom + DROPDOWN_HEIGHT - window.innerHeight : 0;
    if (missing > 0) {
      window.scrollBy({ top: missing + 16, behavior: "smooth" });
      window.setTimeout(() => setPickerOpen(true), 350);
    } else {
      setPickerOpen(true);
    }
  };
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  // Desktop: "En savoir plus" expands under the text instead of opening a window.
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });

  const summary = useMemo(
    () => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)),
    [reviews, scoreView, scoreCollaboratorId],
  );
  const person = team.find((member) => member.id === scoreCollaboratorId);
  const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
  const controle = scoreView === "controle";
  const accent = controle ? tokens.vertOs : tokens.bleu400;
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

  const chipColor = controle ? tokens.vertOs : tokens.bleu400;
  const scoreBoxBackground = controle
    ? "linear-gradient(120deg, rgba(67, 182, 163, 0.01) 0%, rgba(38, 128, 112, 0.10) 100%)"
    : "linear-gradient(120deg, rgba(44, 149, 255, 0.01) 0%, rgba(26, 89, 153, 0.10) 100%)";
  // Phones: these parts flow into one grid (selector, switch, then score | bars). Desktop: two columns.
  const columnSx = { display: { xs: "contents", md: "flex" }, flexDirection: "column", gap: 2, flex: "1 1 0", minWidth: 0 } as const;

  return (
    <Box component="section" aria-labelledby="reputation-heading" sx={{ ...cardSx, px: { xs: 1.5, md: 2 }, gap: { xs: 2, md: 4 } }}>
      <CardTitle id="reputation-heading" eyebrow={t("eyebrow")} heading={t(`heading.${visible ? headingFor(summary.average!) : "start"}`)} />

      {/* Figma "Display" (1461:20671): switch and score on the left, "Score affiché pour" and the star rows on the right. */}
      <Box
        sx={{
          display: { xs: "grid", md: "flex" },
          gridTemplateColumns: "auto 1px minmax(0, 1fr)",
          gridTemplateAreas: `"select select select" "toggle toggle toggle" "score divider bars"`,
          gap: 2,
        }}
      >
        <Box sx={columnSx}>
          <Box sx={{ gridArea: "toggle" }}>
            <ViewToggle view={scoreView} onChange={setScoreView} />
          </Box>
          {visible ? (
            <Box
              sx={{
                gridArea: "score",
                flex: { md: 1 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                px: 1.5,
                py: 2,
                borderRadius: "12px",
                border: `1px solid ${tokens.grisMoyen1}`,
                background: scoreBoxBackground,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: { xs: 1, md: 2 } }}>
                <ScoreNumber value={summary.average!} color={controle ? tokens.vertOs : tokens.bleuFonce} />
                <Rating
                  value={summary.average}
                  precision={0.1}
                  readOnly
                  aria-label={t("scoreAria", { score: formatScore(summary.average!) })}
                  sx={{ fontSize: "26.667px" }}
                />
              </Box>
              <Typography
                sx={{
                  px: "10px",
                  py: "2px",
                  borderRadius: "4px",
                  border: `1px solid ${chipColor}`,
                  bgcolor: alpha(chipColor, 0.1),
                  color: chipColor,
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: "normal",
                  whiteSpace: "nowrap",
                }}
              >
                {t("scoreCount", { count: formatCount(summary.count) })}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ gridArea: "score", gridColumn: "1 / -1", fontSize: 14, color: tokens.gris }}>{t("notPublic")}</Typography>
          )}
        </Box>

        {visible && <Box sx={{ gridArea: "divider", width: "1px", bgcolor: tokens.grisMoyen1, alignSelf: "stretch", flexShrink: 0 }} />}

        <Box sx={columnSx}>
          <Box sx={{ gridArea: "select" }}>
            <Typography component="label" htmlFor="score-for" sx={{ display: "block", fontSize: 12, fontWeight: 600, color: tokens.gris, lineHeight: "normal" }}>
              {t("scoreFor")}
            </Typography>
            <ButtonBase
              id="score-for"
              ref={setScoreForEl}
              onClick={openPicker}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              sx={{
                width: "100%",
                justifyContent: "flex-start",
                gap: 1.5,
                pl: 1,
                pr: 2,
                py: 0.75,
                minHeight: 48,
                bgcolor: tokens.grisClair1,
                border: `1px solid ${tokens.grisMoyen1}`,
                borderRadius: "8px",
                textAlign: "left",
                transition: "border-color 150ms ease, background-color 150ms ease",
                "&:hover": { borderColor: tokens.bleu30, bgcolor: tokens.blanc },
              }}
            >
              {person ? <StaffAvatar person={person} /> : <TeamAvatar />}
              <Typography component="span" sx={{ flex: 1, fontSize: 16, fontWeight: 600, color: tokens.bleuFonce, lineHeight: "normal" }}>
                {person ? person.name : t("wholeTeam")}
              </Typography>
              <FigmaIcon name={person ? "arrows-clockwise" : "expand-more"} alt={person ? t("changeCollaborator") : ""} />
            </ButtonBase>
          </Box>

          {visible && (
            <Box component="ul" sx={{ gridArea: "bars", listStyle: "none", m: 0, p: 0, flex: { md: 1 }, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 1 }}>
              {([5, 4, 3, 2, 1] as StarBucket[]).map((stars) => {
                const count = summary.buckets[stars];
                return (
                  <li key={stars}>
                    <ButtonBase
                      onClick={() => openBucket(stars)}
                      aria-label={t("bucketLabel", { stars, count: formatCount(count) })}
                      sx={{ width: "100%", gap: 0.5, borderRadius: "4px", "&:hover .bucket-count": { textDecoration: "underline" } }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", fontWeight: 600, lineHeight: "normal", whiteSpace: "nowrap" }}>
                        <Box component="span" sx={{ fontSize: 14, color: tokens.bleuFonce }}>{stars}</Box>
                        <Box component="span" sx={{ fontSize: 16, color: tokens.jaune600 }}>★</Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0, height: 6, borderRadius: "3px", bgcolor: tokens.grisMoyen1, overflow: "hidden" }}>
                        <Box
                          sx={{
                            height: "100%",
                            borderRadius: "3px",
                            bgcolor: accent,
                            width: `${Math.max(count ? 3 : 0, (count / maxBucket) * 100)}%`,
                            transition: "width 500ms cubic-bezier(0.2, 0, 0, 1), background-color 200ms ease",
                          }}
                        />
                      </Box>
                      <Typography className="bucket-count" component="span" sx={{ width: 40, textAlign: "right", fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>
                        {formatCount(count)}
                      </Typography>
                      <FigmaIcon name="chevron-right" />
                    </ButtonBase>
                  </li>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* The explanation, with "En savoir plus." at the end of the sentence. */}
      <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.bleuFonce }}>
        {controle ? t("explainControle", { since: agency.memberSince }) : t("explainGlobal")}{" "}
        <Link
          component="button"
          onClick={() => setLearnMoreOpen((value) => !value)}
          aria-expanded={desktop ? learnMoreOpen : undefined}
          aria-controls={desktop ? "learn-more-inline" : undefined}
          sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.5, color: tokens.bleu600, textDecorationColor: "currentColor", verticalAlign: "baseline" }}
        >
          {desktop && learnMoreOpen ? t("learnLess") : t("learnMore")}
        </Link>
      </Typography>

      {/* Desktop: the grey band across the bottom of the card (Figma 1491:38099). */}
      {desktop && (
        <Collapse in={learnMoreOpen} unmountOnExit timeout={250} sx={{ mx: -2, mt: -2, mb: -2 }}>
          <Box id="learn-more-inline">
            <LearnMoreContent view={scoreView} inline />
          </Box>
        </Collapse>
      )}

      <CollaboratorPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={scoreCollaboratorId}
        onSelect={setScoreCollaboratorId}
        view={scoreView}
        anchorEl={pickerOpen ? scoreForEl : null}
      />
      <LearnMoreSheet open={!desktop && learnMoreOpen} onClose={() => setLearnMoreOpen(false)} view={scoreView} />
    </Box>
  );
}
