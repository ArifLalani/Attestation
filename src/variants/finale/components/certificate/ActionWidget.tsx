"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Collapse from "@mui/material/Collapse";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import Snackbar from "@mui/material/Snackbar";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import IosShareRounded from "@mui/icons-material/IosShareRounded";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import StarRounded from "@mui/icons-material/StarRounded";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { formatCount, formatScore } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { openingStatus } from "@/lib/hours";
import { isPublic, reviewsForScore, summarize, type ScoreView } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { openHoursEvent } from "./AgenciesSection";
import { OpenStatus } from "./OpenStatus";

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } } as const;
const ease = "300ms cubic-bezier(0.2, 0, 0, 1)";

function directionsUrl(address: string) {
  const destination = encodeURIComponent(address);
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** The score shown on the button: the one chosen on the page (Avis global or Avis Contrôlés, and the selected advisor). */
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

/** Native share sheet on phones, otherwise the link is copied. */
function useShare() {
  const tb = useTranslations("Business");
  const { agency } = useCertificate();
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
  const snackbar = <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={tb("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />;
  return { share, snackbar };
}

/** The closed button: ★ 4,3 · ● Ouvert, and the yellow arrow (turned over when open). */
function PillContent({ open }: { open: boolean }) {
  const t = useTranslations("VarianteFinale.widget");
  const th = useTranslations("Hours");
  const { agency } = useCertificate();
  const { summary, visible, controle } = useActiveScore();
  const now = useNow();
  const status = now ? openingStatus(agency.hours, now) : null;
  const statusColor = status?.open ? "#6dd3c1" : tokens.error3;
  return (
    <>
      {visible && (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 16, fontWeight: 700, color: tokens.blanc }}>
          {controle ? <VerifiedRounded sx={{ fontSize: 18, color: tokens.vertOs }} /> : <StarRounded sx={{ fontSize: 19, color: tokens.rating }} />}
          {formatScore(summary.average!)}
        </Box>
      )}
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: 13, fontWeight: 600, color: statusColor, visibility: status ? "visible" : "hidden" }}>
        <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: statusColor, boxShadow: `0 0 0 3px ${status?.open ? "rgba(67, 182, 163, 0.3)" : "rgba(252, 101, 48, 0.3)"}` }} />
        {status?.open ? t("open") : th("closed")}
      </Box>
      <Box component="span" sx={{ ml: "auto", width: 40, height: 40, flexShrink: 0, borderRadius: "50%", bgcolor: tokens.jaune400, color: tokens.bleuFonce, display: "grid", placeItems: "center" }}>
        <ExpandLessRounded sx={{ transform: open ? "rotate(180deg)" : "none", transition: `transform ${ease}` }} />
      </Box>
    </>
  );
}

/** One of the two scores in the card; shows that view in the score card (Réputation), not the reviews list. */
function ScoreTile({ view, onDone }: { view: ScoreView; onDone: () => void }) {
  const t = useTranslations("VarianteFinale.widget");
  const tr = useTranslations("Reputation");
  const { agency, reviews, scoreCollaboratorId, setScoreView } = useCertificate();
  const summary = useMemo(() => summarize(reviewsForScore(reviews, view, scoreCollaboratorId)), [reviews, view, scoreCollaboratorId]);
  const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
  const controle = view === "controle";
  const count = t("count", { count: formatCount(summary.count) });
  return (
    <ButtonBase
      disabled={!visible}
      onClick={() => {
        onDone();
        setScoreView(view);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById("note")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
      }}
      aria-label={visible ? t("scoreAria", { view: tr(`views.${view}`), score: formatScore(summary.average!), count }) : undefined}
      sx={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", gap: 0.25, p: 1.5, borderRadius: "12px", bgcolor: controle ? "rgba(67, 182, 163, 0.12)" : tokens.bleu10, textAlign: "left", fontFamily: "inherit", "&:hover": { filter: "brightness(0.97)" }, ...focusSx }}
    >
      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: controle ? "#2a8f7e" : tokens.bleu600 }}>
        {controle && <VerifiedRounded sx={{ fontSize: 15 }} />}
        {tr(`views.${view}`)}
      </Box>
      <Box component="span" sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography component="span" sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, color: tokens.bleuFonce }}>{visible ? formatScore(summary.average!) : "–"}</Typography>
        <Typography component="span" sx={{ fontSize: 13, color: tokens.gris }}>/5</Typography>
      </Box>
      {visible && <Rating readOnly value={summary.average} precision={0.1} sx={{ fontSize: 15, "& .MuiRating-iconFilled": { color: controle ? tokens.vertOs : tokens.rating } }} />}
      {visible && <Typography component="span" sx={{ fontSize: 12, color: tokens.bleuFonce, textDecoration: "underline", textUnderlineOffset: "3px" }}>{count}</Typography>}
    </ButtonBase>
  );
}

const actionBoxSx = {
  flexDirection: "column",
  justifyContent: "center",
  gap: 0.5,
  minHeight: 76,
  px: 0.5,
  py: 1.25,
  borderRadius: "12px",
  border: `1px solid ${tokens.grisMoyen1}`,
  fontFamily: "inherit",
  fontSize: 12.5,
  fontWeight: 600,
  lineHeight: 1.2,
  textAlign: "center",
  color: tokens.bleuFonce,
  "& .MuiSvgIcon-root": { fontSize: 22 },
  "&:hover": { bgcolor: tokens.grisClair1, borderColor: "#c9d7e0" },
  ...focusSx,
} as const;

/** A box button (Déposer un avis, Partager…): icon over a short label; a link (new tab) when given an href. */
function ActionBox({ icon, label, onClick, href, onLinkClick }: { icon: React.ReactNode; label: string; onClick?: () => void; href?: string; onLinkClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return href ? (
    <ButtonBase component="a" href={href} target="_blank" rel="noopener noreferrer" onClick={onLinkClick} sx={actionBoxSx}>
      {icon}
      {label}
    </ButtonBase>
  ) : (
    <ButtonBase onClick={onClick} sx={actionBoxSx}>
      {icon}
      {label}
    </ButtonBase>
  );
}

/**
 * The card (phone bottom sheet / desktop unfolded box): the agency, both scores, the open status (→ the hours),
 * six box buttons, and Contacter l'agence pinned at the foot.
 */
function CardContent({ onDone, titleId }: { onDone: () => void; titleId: string }) {
  const t = useTranslations("VarianteFinale.widget");
  const th = useTranslations("VarianteFinale.hero");
  const tb = useTranslations("Business");
  const ta = useTranslations("Actions");
  const { agency, setPanel, openAssistant } = useCertificate();
  const { share, snackbar } = useShare();

  const showHours = () => {
    onDone();
    window.dispatchEvent(new Event(openHoursEvent));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("nos-agences")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ position: "relative", width: 44, height: 44, flexShrink: 0, borderRadius: "10px", overflow: "hidden", border: `1px solid ${tokens.grisMoyen1}`, bgcolor: tokens.blanc }}>
            <Image src={agency.logo} alt="" fill sizes="44px" style={{ objectFit: "contain", padding: 4 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography id={titleId} component="h2" sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25, color: tokens.bleuFonce }}>{agency.name}</Typography>
            <Typography sx={{ fontSize: 12.5, color: "#5d7387" }}>{th("sector", { sector: agency.sector, city: agency.city })}</Typography>
          </Box>
          <IconButton onClick={onDone} aria-label={t("close")} sx={{ width: 40, height: 40, bgcolor: tokens.grisClair2, color: tokens.bleuFonce, "&:hover": { bgcolor: tokens.grisMoyen1 } }}>
            <CloseRounded />
          </IconButton>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <ScoreTile view="global" onDone={onDone} />
          <ScoreTile view="controle" onDone={onDone} />
        </Box>

        <ButtonBase
          onClick={showHours}
          aria-label={t("hoursAria")}
          sx={{ width: "100%", justifyContent: "space-between", gap: 1, px: 1.5, py: 1.25, borderRadius: "12px", border: `1px solid ${tokens.grisMoyen1}`, fontFamily: "inherit", "&:hover": { bgcolor: tokens.grisClair1 }, ...focusSx }}
        >
          <OpenStatus hours={agency.hours} />
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", fontSize: 14, fontWeight: 600, color: tokens.bleu600 }}>
            {t("hours")}
            <ChevronRightRounded sx={{ fontSize: 20 }} />
          </Box>
        </ButtonBase>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1 }}>
          <ActionBox icon={<RateReviewOutlined />} label={ta("leaveReview")} onClick={() => { onDone(); setPanel("reviewRequest"); }} />
          <ActionBox icon={<IosShareRounded />} label={t("share")} onClick={share} />
          <ActionBox
            icon={<DirectionsOutlined />}
            label={tb("directions")}
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(agency.address)}`}
            onLinkClick={(event) => event.currentTarget.setAttribute("href", directionsUrl(agency.address))}
          />
          <ActionBox icon={<LanguageOutlined />} label={tb("website")} href={agency.website} />
          <ActionBox icon={<AutoAwesome sx={{ color: tokens.vertOs }} />} label={ta("askAi")} onClick={() => { onDone(); openAssistant(); }} />
          <ActionBox icon={<StorefrontOutlined />} label={ta("signup")} href={opinionSystemLinks.signup} />
        </Box>
      </Box>

      {/* Contacter l'agence stays at the foot, near the thumb and the button. */}
      <Box sx={{ flexShrink: 0, px: 2, pt: 1.25, pb: { xs: "calc(16px + env(safe-area-inset-bottom))", md: 2 }, borderTop: `1px solid ${tokens.grisMoyen1}`, bgcolor: tokens.blanc }}>
        <CtaButton icon={null} onClick={() => { onDone(); setPanel("contact"); }} aria-haspopup="dialog" sx={{ minHeight: 48, fontSize: 15 }}>
          {t("contact")}
        </CtaButton>
      </Box>
      {snackbar}
    </>
  );
}

/**
 * Desktop: one navy box. Closed, it is the pill (★ 4,3 · ● Ouvert); open, the white card unfolds upwards inside it
 * and the pill stays at the bottom as its base. It folds back on scroll, click outside or Échap.
 */
function DesktopWidget() {
  const t = useTranslations("VarianteFinale.widget");
  const shown = useAfterHero();
  const [expanded, setExpanded] = useState(false);
  const openedAt = useRef(0);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [pillWidth, setPillWidth] = useState<number>();
  const bodyId = useId();
  const titleId = useId();

  // Scrolling back up to the hero also folds it.
  const open = shown && expanded;

  // Width of the closed pill, so the width can animate between the pill and the open card.
  useEffect(() => {
    if (open) return;
    const measure = () => setPillWidth(Math.ceil((pillRef.current?.offsetWidth ?? 0) + 8));
    measure();
    const observer = new ResizeObserver(measure);
    if (pillRef.current) observer.observe(pillRef.current);
    return () => observer.disconnect();
  }, [open, shown]);

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

  return (
    <ClickAwayListener onClickAway={() => setExpanded(false)} mouseEvent={open ? "onClick" : false} touchEvent={open ? "onTouchEnd" : false}>
      <Box sx={{ display: { xs: "none", md: "block" }, position: "fixed", right: 24, bottom: 24, zIndex: (theme) => theme.zIndex.speedDial }}>
        <Grow in={shown} style={{ transformOrigin: "bottom right" }}>
          <Box sx={{ width: open ? 388 : pillWidth ?? "auto", p: "4px", bgcolor: tokens.bleuFonce, borderRadius: "30px", boxShadow: tokens.elevation6, overflow: "hidden", transition: `width ${ease}` }}>
            <Collapse in={open} timeout={300} easing={{ enter: "cubic-bezier(0.2, 0, 0, 1)", exit: "cubic-bezier(0.2, 0, 0, 1)" }}>
              <Box
                id={bodyId}
                role="region"
                aria-labelledby={titleId}
                sx={{ width: 380, maxHeight: "calc(100vh - 140px)", mb: "4px", bgcolor: tokens.blanc, borderRadius: "26px", overflow: "hidden", display: "flex", flexDirection: "column", opacity: open ? 1 : 0, transition: `opacity ${ease}` }}
              >
                <CardContent onDone={() => setExpanded(false)} titleId={titleId} />
              </Box>
            </Collapse>
            <ButtonBase
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={open}
              aria-controls={bodyId}
              aria-label={open ? t("collapse") : t("expand")}
              sx={{ width: "100%", height: 52, justifyContent: "flex-start", borderRadius: "26px", fontFamily: "inherit", ...focusSx }}
            >
              <Box ref={pillRef} component="span" sx={{ width: open ? "100%" : "max-content", display: "flex", alignItems: "center", gap: 1.25, pl: 2, pr: "6px", whiteSpace: "nowrap" }}>
                <PillContent open={open} />
              </Box>
            </ButtonBase>
          </Box>
        </Grow>
      </Box>
    </ClickAwayListener>
  );
}

/** Phones and tablets: the same pill, bottom right; tapping it (or swiping up on it) pulls up the card as a bottom sheet. */
function PhoneWidget() {
  const t = useTranslations("VarianteFinale.widget");
  const shown = useAfterHero();
  const [open, setOpen] = useState(false);
  const startY = useRef<number | null>(null);
  const titleId = useId();

  return (
    <>
      <Box sx={{ display: { xs: "block", md: "none" }, position: "fixed", right: 16, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: (theme) => theme.zIndex.speedDial }}>
        <Grow in={shown} style={{ transformOrigin: "bottom right" }}>
          <ButtonBase
            onClick={() => setOpen(true)}
            onTouchStart={(event) => { startY.current = event.touches[0].clientY; }}
            onTouchMove={(event) => {
              if (startY.current !== null && startY.current - event.touches[0].clientY > 24) {
                startY.current = null;
                setOpen(true);
              }
            }}
            onTouchEnd={() => { startY.current = null; }}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t("expand")}
            sx={{ height: 56, display: "flex", alignItems: "center", gap: 1.25, pl: 2, pr: 1, borderRadius: "28px", bgcolor: tokens.bleuFonce, boxShadow: "0 8px 24px rgba(4, 27, 68, 0.35)", fontFamily: "inherit", whiteSpace: "nowrap", ...focusSx }}
          >
            <PillContent open={open} />
          </ButtonBase>
        </Grow>
      </Box>

      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        disableSwipeToOpen
        sx={{ display: { md: "none" } }}
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(4, 27, 68, 0.4)" } },
          paper: { role: "dialog", "aria-modal": true, "aria-labelledby": titleId, sx: { maxWidth: 640, mx: "auto", maxHeight: "88dvh", borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column" } },
        }}
      >
        <Box sx={{ pt: 1, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 40, height: 5, borderRadius: 2.5, bgcolor: tokens.grisMoyen1 }} />
        </Box>
        <CardContent onDone={() => setOpen(false)} titleId={titleId} />
      </SwipeableDrawer>
    </>
  );
}

/** The floating button: ★ score · open status; opens the agency card with the scores, the hours and every action. */
export function ActionWidget() {
  return (
    <>
      <DesktopWidget />
      <PhoneWidget />
    </>
  );
}
