"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Collapse from "@mui/material/Collapse";
import Grow from "@mui/material/Grow";
import Rating from "@mui/material/Rating";
import Slide from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import IosShareRounded from "@mui/icons-material/IosShareRounded";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import StarRounded from "@mui/icons-material/StarRounded";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import type { WeekHours } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { frenchTime, localClock } from "@/lib/hours";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { OpenStatus } from "./OpenStatus";

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleuFonce}`, outlineOffset: 2 } } as const;

function directionsUrl(address: string) {
  const destination = encodeURIComponent(address);
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** The active score (follows the Avis global / Avis Contrôlés switch and the selected advisor). */
function useActiveScore() {
  const { agency, reviews, scoreView, scoreCollaboratorId } = useCertificate();
  const summary = useMemo(() => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)), [reviews, scoreView, scoreCollaboratorId]);
  return { summary, visible: summary.average !== null && isPublic(summary.count, agency.publicThreshold), controle: scoreView === "controle" };
}

/** Shown once the hero card has scrolled out of view. */
function useAfterHero() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const hero = document.querySelector("#synthese article");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  return shown;
}

function WeekTable({ hours, today, id }: { hours: WeekHours; today: number; id: string }) {
  const t = useTranslations("Hours");
  return (
    <Box id={id} component="dl" sx={{ m: 0, display: "flex", flexDirection: "column" }}>
      {hours.map((ranges, day) => (
        <Box key={day} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, fontSize: 14, fontWeight: day === today ? 700 : 400, color: day === today ? tokens.bleuFonce : tokens.gris }}>
          <Box component="dt">{t(`daysTitle.${day}`)}</Box>
          <Box component="dd" sx={{ m: 0, textAlign: "right" }}>
            {ranges.length ? ranges.map(([start, end]) => `${frenchTime(start)} – ${frenchTime(end)}`).join(" · ") : t("closed")}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/** "Aujourd'hui 9 h – 19 h" with the open status; the arrow shows the whole week. */
function TodayHours() {
  const t = useTranslations("VarianteFinale.widget");
  const th = useTranslations("Hours");
  const { agency } = useCertificate();
  const now = useNow();
  const today = now ? localClock(now).weekday : -1;
  const ranges = today >= 0 ? agency.hours[today] : null;
  const [week, setWeek] = useState(false);
  const weekId = useId();
  return (
    <Box sx={{ borderRadius: "12px", border: `1px solid ${tokens.grisMoyen1}`, overflow: "hidden" }}>
      <ButtonBase
        onClick={() => setWeek((value) => !value)}
        aria-expanded={week}
        aria-controls={weekId}
        aria-label={t("hoursToggle")}
        sx={{ width: "100%", justifyContent: "space-between", gap: 1, px: 2, py: 1.25, textAlign: "left", "&:hover": { bgcolor: tokens.grisClair1 } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="span" sx={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: tokens.bleuFonce }}>
            {t("today")}
          </Typography>
          <Typography component="span" sx={{ display: "block", fontSize: 15, color: tokens.gris }}>
            {ranges === null ? " " : ranges.length ? ranges.map(([start, end]) => `${frenchTime(start)} – ${frenchTime(end)}`).join(" · ") : th("closed")}
          </Typography>
        </Box>
        <ExpandMoreRounded sx={{ color: tokens.bleuFonce, transform: week ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
      </ButtonBase>
      <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${tokens.grisMoyen1}` }}>
        <OpenStatus hours={agency.hours} />
      </Box>
      <Collapse in={week}>
        <Box sx={{ px: 2, pb: 1.5 }}>
          <WeekTable hours={agency.hours} today={today} id={weekId} />
        </Box>
      </Collapse>
    </Box>
  );
}

/** Body of the widget (layout from option F2): hours, Contacter l'agence, Site web / Itinéraire, then the other actions. */
function WidgetBody({ onDone }: { onDone: () => void }) {
  const t = useTranslations("VarianteFinale.widget");
  const tb = useTranslations("Business");
  const ta = useTranslations("Actions");
  const { agency, setPanel, openAssistant } = useCertificate();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const data = { title: agency.name, text: tb("shareText", { name: agency.name }), url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // Cancelled by the user.
      }
      return;
    }
    await navigator.clipboard?.writeText(data.url);
    setCopied(true);
  };

  const outlinedSx = {
    flex: "1 1 0",
    minWidth: 0,
    minHeight: 40,
    gap: 0.75,
    borderRadius: "8px",
    border: `1px solid ${tokens.grisMoyen1}`,
    color: tokens.bleuFonce,
    fontSize: 14,
    fontWeight: 600,
    "& .MuiSvgIcon-root": { fontSize: 18 },
    "&:hover": { bgcolor: tokens.grisClair1, borderColor: tokens.bleuFonce },
  } as const;

  const items = [
    { key: "review", icon: <RateReviewOutlined />, label: ta("leaveReview"), action: () => { onDone(); setPanel("reviewRequest"); } },
    { key: "ai", icon: <AutoAwesome sx={{ color: tokens.vertOs }} />, label: ta("askAi"), action: () => { onDone(); openAssistant(); } },
    { key: "share", icon: <IosShareRounded />, label: t("share"), action: share },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TodayHours />
      <CtaButton icon={null} onClick={() => { onDone(); setPanel("contact"); }} aria-haspopup="dialog">
        {t("contact")}
      </CtaButton>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button href={agency.website} target="_blank" rel="noopener noreferrer" sx={outlinedSx}>
          <LanguageOutlined />
          {tb("website")}
        </Button>
        <Button
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(agency.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.currentTarget.setAttribute("href", directionsUrl(agency.address))}
          sx={outlinedSx}
        >
          <DirectionsOutlined />
          {tb("directions")}
        </Button>
      </Box>
      <Typography sx={{ fontSize: 13, color: tokens.gris, textAlign: "center", lineHeight: 1.4 }}>{t("note")}</Typography>
      <Box sx={{ height: "1px", bgcolor: tokens.grisMoyen1 }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {items.map((item) => (
          <ButtonBase
            key={item.key}
            onClick={item.action}
            sx={{ justifyContent: "flex-start", gap: 1.5, minHeight: 44, px: 1, mx: -1, borderRadius: "8px", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: tokens.bleuFonce, "& .MuiSvgIcon-root": { fontSize: 20 }, "&:hover": { bgcolor: tokens.grisClair1 }, ...focusSx }}
          >
            {item.icon}
            <Box component="span" sx={{ flex: 1, textAlign: "left" }}>{item.label}</Box>
            <ChevronRightRounded sx={{ color: tokens.gris }} />
          </ButtonBase>
        ))}
      </Box>
      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={tb("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}

/** "★ 4,3 · 2 500 avis": goes to the reviews. */
function ScoreLink({ onDone }: { onDone: () => void }) {
  const t = useTranslations("VarianteFinale.widget");
  const { goToSection } = useCertificate();
  const { summary, visible, controle } = useActiveScore();
  if (!visible) return null;
  const count = t("count", { count: formatCount(summary.count) });
  return (
    <ButtonBase
      onClick={() => { onDone(); goToSection("avis"); }}
      aria-label={t("scoreLink", { score: formatScore(summary.average!), count })}
      sx={{ alignSelf: "flex-start", gap: 0.5, borderRadius: "4px", fontFamily: "inherit", fontSize: 14, color: tokens.bleuFonce, ...focusSx }}
    >
      <StarRounded sx={{ fontSize: 18, color: controle ? tokens.vertOs : tokens.rating }} />
      <Box component="span" sx={{ fontWeight: 700 }}>{formatScore(summary.average!)}</Box>
      <Box component="span" sx={{ color: tokens.gris }}>·</Box>
      <Box component="span" sx={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>{count}</Box>
    </ButtonBase>
  );
}

/**
 * Desktop: one navy element. Folded, it is the score pill; opened, the white widget unfolds upwards out of it while the
 * pill stays at the bottom as its base. It folds back on scroll, click outside or Échap.
 */
function DesktopWidget() {
  const t = useTranslations("VarianteFinale.widget");
  const ta = useTranslations("Actions");
  const shown = useAfterHero();
  const { summary, visible, controle } = useActiveScore();
  const [expanded, setExpanded] = useState(false);
  const openedAt = useRef(0);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const [pillWidth, setPillWidth] = useState<number>();
  const bodyId = useId();
  const titleId = useId();

  // Scrolling back up to the hero also folds it (any scroll past 48 px does).
  const open = shown && expanded;

  // Width of the folded pill, so the width can animate between the pill and the open widget.
  useEffect(() => {
    if (open) return;
    const measure = () => {
      const score = scoreRef.current?.offsetWidth ?? 0;
      const chip = chipRef.current?.offsetWidth ?? 0;
      setPillWidth(Math.ceil(score + chip + (score ? 8 + 16 : 0) + 8));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (scoreRef.current) observer.observe(scoreRef.current);
    if (chipRef.current) observer.observe(chipRef.current);
    return () => observer.disconnect();
  }, [open, shown, visible]);

  useEffect(() => {
    if (!open) return;
    openedAt.current = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAt.current) > 48) setExpanded(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ease = "300ms cubic-bezier(0.2, 0, 0, 1)";

  return (
    <ClickAwayListener onClickAway={() => setExpanded(false)} mouseEvent={open ? "onClick" : false} touchEvent={open ? "onTouchEnd" : false}>
      <Box sx={{ display: { xs: "none", md: "block" }, position: "fixed", right: 24, bottom: 24, zIndex: (theme) => theme.zIndex.speedDial }}>
        <Grow in={shown} style={{ transformOrigin: "bottom right" }}>
          <Box
            sx={{
              width: open ? 368 : pillWidth ?? "auto",
              p: "4px",
              bgcolor: tokens.bleuFonce,
              borderRadius: "28px",
              boxShadow: tokens.elevation6,
              overflow: "hidden",
              transition: `width ${ease}`,
            }}
          >
            <Collapse in={open} timeout={300} easing={{ enter: "cubic-bezier(0.2, 0, 0, 1)", exit: "cubic-bezier(0.2, 0, 0, 1)" }}>
              <Box
                id={bodyId}
                role="region"
                aria-labelledby={titleId}
                sx={{
                  width: 360,
                  maxHeight: "calc(100vh - 140px)",
                  overflowY: "auto",
                  mb: "4px",
                  p: 2.5,
                  bgcolor: tokens.blanc,
                  borderRadius: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  opacity: open ? 1 : 0,
                  transition: `opacity ${ease}`,
                }}
              >
                <Typography id={titleId} component="h2" sx={{ fontSize: 22, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em", color: tokens.bleuFonce }}>
                  {t("title")}
                </Typography>
                <WidgetBody onDone={() => setExpanded(false)} />
              </Box>
            </Collapse>

            {/* The pill: the score on the left, the yellow chip on the right. Opens and folds the widget. */}
            <ButtonBase
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={open}
              aria-controls={bodyId}
              aria-label={open ? t("collapse") : t("expand")}
              sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, pl: visible ? 2 : 0, borderRadius: "24px", fontFamily: "inherit", whiteSpace: "nowrap", ...focusSx }}
            >
              {visible && (
                <Box ref={scoreRef} component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                  <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: controle ? tokens.vertOs : tokens.blanc }}>
                    {formatScore(summary.average!)}
                  </Typography>
                  <Rating readOnly value={summary.average} precision={0.1} sx={{ fontSize: 16, "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.35)" } }} />
                  <Typography component="span" sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                    {t("count", { count: formatCount(summary.count) })}
                  </Typography>
                </Box>
              )}
              <Box
                ref={chipRef}
                component="span"
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 2, py: 1.25, borderRadius: "999px", bgcolor: tokens.jaune400, color: tokens.bleuFonce, fontSize: 14, fontWeight: 600 }}
              >
                {open ? t("collapse") : ta("contact")}
                <ExpandLessRounded sx={{ fontSize: 20, transform: open ? "rotate(180deg)" : "none", transition: `transform ${ease}` }} />
              </Box>
            </ButtonBase>
          </Box>
        </Grow>
      </Box>
    </ClickAwayListener>
  );
}

/** Phones and tablets: a bar pinned to the bottom (score + Contacter); tapping the score or ∧ slides the widget up as a sheet. */
function PhoneWidget() {
  const t = useTranslations("VarianteFinale.widget");
  const ta = useTranslations("Actions");
  const tr = useTranslations("Reputation");
  const shown = useAfterHero();
  const { setPanel, scoreView } = useCertificate();
  const { summary, visible, controle } = useActiveScore();
  const [sheet, setSheet] = useState(false);

  return (
    <>
      <Slide in={shown} direction="up">
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.speedDial,
            alignItems: "center",
            gap: 1,
            px: 2,
            pt: 1.25,
            pb: "calc(10px + env(safe-area-inset-bottom))",
            bgcolor: tokens.blanc,
            borderTop: `1px solid ${tokens.grisMoyen1}`,
            boxShadow: "0 -4px 16px rgba(4, 27, 68, 0.08)",
          }}
        >
          <ButtonBase
            onClick={() => setSheet(true)}
            aria-haspopup="dialog"
            aria-label={t("expand")}
            sx={{ flex: 1, minWidth: 0, justifyContent: "flex-start", gap: 1, textAlign: "left", borderRadius: "8px", fontFamily: "inherit", ...focusSx }}
          >
            {visible && (
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 16, color: tokens.bleuFonce }}>
                  <StarRounded sx={{ fontSize: 18, color: controle ? tokens.vertOs : tokens.rating }} />
                  <Box component="span" sx={{ fontWeight: 700 }}>{formatScore(summary.average!)}</Box>
                  <Box component="span" sx={{ whiteSpace: "nowrap", textDecoration: "underline", textUnderlineOffset: "3px" }}>· {t("count", { count: formatCount(summary.count) })}</Box>
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: controle ? tokens.vertOs : tokens.gris }}>{tr(`views.${scoreView}`)}</Typography>
              </Box>
            )}
            <ExpandLessRounded sx={{ ml: "auto", color: tokens.bleuFonce }} />
          </ButtonBase>
          <ButtonBase
            onClick={() => setPanel("contact")}
            aria-haspopup="dialog"
            sx={{ px: 2.5, minHeight: 44, borderRadius: "8px", bgcolor: tokens.jaune400, color: tokens.bleuFonce, fontFamily: "inherit", fontSize: 15, fontWeight: 600, "&:hover": { bgcolor: tokens.jaune600 }, ...focusSx }}
          >
            {ta("contact")}
          </ButtonBase>
        </Box>
      </Slide>

      <ResponsiveSheet open={sheet} onClose={() => setSheet(false)} title={t("title")} closeLabel={t("collapse")}>
        <Box sx={{ p: 2, pb: "calc(16px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 2 }}>
          <ScoreLink onDone={() => setSheet(false)} />
          <WidgetBody onDone={() => setSheet(false)} />
        </Box>
      </ResponsiveSheet>
    </>
  );
}

/**
 * The floating contact widget that replaces the FAB (content from option F2's "Parlons de votre projet" card).
 * Appears once the hero has scrolled away.
 */
export function ActionWidget() {
  return (
    <>
      <DesktopWidget />
      <PhoneWidget />
    </>
  );
}
