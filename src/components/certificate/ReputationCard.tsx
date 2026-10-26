"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { StaffAvatar } from "@/components/ui/StaffAvatar";
import { formatCount, formatScore } from "@/lib/format";
import { useCountUp } from "@/lib/hooks";
import { displayScore, headingFor, isPublic, reviewsForScore, summarize, type ScoreView, type StarBucket } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "./CertificateContext";
import { AiModelChips } from "./AssistantPanel";
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

/** "Demandez à l'IA": tapping an AI opens the chat answered "by" that AI. */
function AskAiStrip() {
  const t = useTranslations("Assistant");
  const { openAssistant } = useCertificate();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "center" },
        justifyContent: "space-between",
        gap: 1.5,
        p: 1.5,
        borderRadius: "12px",
        bgcolor: tokens.grisClair1,
        border: `1px solid ${tokens.grisMoyen1}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AutoAwesome sx={{ fontSize: 20, color: tokens.vertOs }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: "normal", color: tokens.bleuFonce }}>{t("stripTitle")}</Typography>
      </Box>
      <AiModelChips onSelect={openAssistant} label={t("stripTitle")} />
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

  return (
    <Box component="section" aria-labelledby="reputation-heading" sx={cardSx}>
      <CardTitle id="reputation-heading" eyebrow={t("eyebrow")} heading={t(`heading.${visible ? headingFor(summary.average!) : "start"}`)} />

      {/* Phones: selector, then the switch. Desktop: the switch on the left half, "Score affiché pour" on the right half. */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "flex-end" }, gap: 2 }}>
        <Box sx={{ order: { md: 2 }, flex: { md: "1 1 0" }, minWidth: 0 }}>
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
              gap: 1,
              px: 2,
              py: person ? 0.5 : 1.5,
              minHeight: { xs: 45, md: 50 },
              bgcolor: tokens.blanc,
              border: `1px solid ${tokens.grisMoyen1}`,
              borderRadius: "8px",
              textAlign: "left",
              "&:hover": { borderColor: tokens.bleu30 },
            }}
          >
            {person && <StaffAvatar person={person} />}
            <Typography component="span" sx={{ flex: 1, fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, lineHeight: "normal" }}>
              {person ? person.name : t("wholeTeam")}
            </Typography>
            <FigmaIcon name={person ? "arrows-clockwise" : "expand-more"} alt={person ? t("changeCollaborator") : ""} />
          </ButtonBase>
        </Box>
  
        <Box sx={{ order: { md: 1 }, flex: { md: "1 1 0" }, minWidth: 0 }}>
          <ViewToggle view={scoreView} onChange={setScoreView} />
        </Box>
      </Box>

      {visible ? (
        <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>
          {/* Desktop: score and rating bars split the card 50/50. */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", flex: { xs: "0 0 auto", md: "1 1 0" } }}>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <ScoreNumber value={summary.average!} color={controle ? tokens.vertOs : tokens.bleuFonce} />
              <Rating
                value={summary.average}
                precision={0.1}
                readOnly
                aria-label={t("scoreAria", { score: formatScore(summary.average!) })}
                sx={{ fontSize: "26.667px" }}
              />
            </Box>
            <Box
              sx={{
                width: { xs: "100%", md: "auto" },
                textAlign: "center",
                px: { xs: "10px", md: 2 },
                py: "2px",
                borderRadius: "4px",
                bgcolor: controle ? tokens.successLight2 : tokens.grisClair2,
                border: controle ? "1px solid transparent" : `1px solid ${tokens.grisMoyen1}`,
                transition: "background-color 200ms ease",
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: "normal", color: controle ? tokens.vertOs : tokens.bleuFonce, whiteSpace: "nowrap" }}>
                {t("reviewCount", { count: formatCount(summary.count) })}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: "1px", bgcolor: tokens.grisMoyen1, flexShrink: 0 }} />

          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
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
        </Box>
      ) : (
        <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("notPublic")}</Typography>
      )}

      <Box>
        <Typography sx={{ fontSize: 14, lineHeight: "normal", color: tokens.bleuFonce, "& b": { fontWeight: 700 } }}>
          {controle
            ? t.rich("explainControle", { b: (chunks) => <b>{chunks}</b>, since: agency.memberSince })
            : t.rich("explainGlobal", { b: (chunks) => <b>{chunks}</b> })}
        </Typography>
        <Link
          component="button"
          onClick={() => setLearnMoreOpen((value) => !value)}
          aria-expanded={desktop ? learnMoreOpen : undefined}
          aria-controls={desktop ? "learn-more-inline" : undefined}
          sx={{ fontSize: 14, fontWeight: 500, lineHeight: "normal", color: tokens.bleu600, textDecorationColor: "currentColor", verticalAlign: "baseline" }}
        >
          {desktop && learnMoreOpen ? t("learnLess") : t("learnMore")}
        </Link>
      </Box>

      {desktop && (
        <Collapse in={learnMoreOpen} unmountOnExit timeout={250}>
          <Box id="learn-more-inline">
            <LearnMoreContent view={scoreView} inline />
          </Box>
        </Collapse>
      )}

      <AskAiStrip />

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
