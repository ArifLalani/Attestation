"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Rating from "@mui/material/Rating";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import ChevronRight from "@mui/icons-material/ChevronRight";
import StarRounded from "@mui/icons-material/StarRounded";
import Verified from "@mui/icons-material/Verified";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { formatCount, formatScore } from "@/lib/format";
import { displayScore, isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { appGradientTall } from "@/variants/finale/appGradient";
import { OpenStatus } from "./OpenStatus";
import { useRelativeDate } from "@/variants/finale/components/reviews/ReviewCard";
import { useNoPhotoPreview } from "@/variants/presentation";
import { AgencySheet } from "./ActionWidget";

export const cardSx = {
  bgcolor: tokens.blanc,
  borderRadius: "20px",
  boxShadow: tokens.shadowCard,
} as const;

/** Secondary text on the frosted sign: full navy, as in the Figma (1742:88885), so it reads over the blurred photo. */
const glassMuted = tokens.bleuFonce;

/** The hero without a photo (option C2, « Aurore »): the blue → green gradient with a light sweep and a glow at the top. */
const auroraBackground =
  "linear-gradient(112deg, transparent 28%, rgba(255,255,255,0.13) 42%, rgba(255,255,255,0.04) 50%, transparent 62%), radial-gradient(60% 55% at 72% 0%, rgba(255,255,255,0.22), transparent 70%), linear-gradient(125deg, #041b44 0%, #08306b 34%, #0b5a86 62%, #1a8f8c 84%, #3fb59f 100%)";
/** A fine sparkle grain over the lights. */
const sparkles = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">${Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 37) % 120}" cy="${(i * 53) % 120}" r=".7" fill="rgba(255,255,255,.25)"/>`).join("")}</svg>`)}")`;

/** www.la-boite-immo.com → la-boite-immo.com, for the website line on desktop. */
const websiteHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www./, "");
  } catch {
    return url;
  }
};

/**
 * Desktop: the info lines (hours, address, website, directions) one per line, with a thin divider between them and a chevron
 * at the end; the grey details (domain, Google Maps) only show here. Phones keep the compact list.
 */
const infoLinesSx = {
  "& .line-chevron, & .line-detail": { display: { xs: "none", md: "inline" } },
  "& .line-detail": { color: "#456379" },
  "& .line-chevron": { ml: "auto", flexShrink: 0, color: "#456379", fontSize: "20px !important" },
  "& > a, & > div > a": {
    display: { md: "flex" }, width: { md: "100%" }, gap: { md: 1.25 }, py: { md: 1.5 },
    borderBottom: { md: "1px solid #c3d3e3" }, fontSize: { md: 15 }, "& .MuiSvgIcon-root": { fontSize: { md: 20 } },
  },
  "& > div > a:last-of-type": { borderBottom: { md: "none" }, pb: { md: 0 } },
  "& > a:first-of-type": { pt: { md: 0 } },
} as const;

const metaLinkSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  fontSize: 14,
  lineHeight: "normal",
  color: glassMuted,
  textDecoration: "none",
  textUnderlineOffset: "3px",
  "&:hover": { textDecoration: "underline" },
  "& .MuiSvgIcon-root": { fontSize: 19 },
} as const;

function directionsUrl(address: string) {
  const destination = encodeURIComponent(address);
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** Read by screen readers only. */
const visuallyHidden = { position: "absolute", width: 1, height: 1, p: 0, m: "-1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 } as const;

function scrollToAgencies() {
  const target = document.getElementById("nos-agences");
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
}

/**
 * Hero taken from option D (text on the left, team photo with a caption on the right), drawn in the prototype's look:
 * white card, navy text, yellow CTA, Poppins. The score follows the review mode and the advisor.
 */
export function BusinessCard() {
  const t = useTranslations("Business");
  const th = useTranslations("VarianteFinale.hero");
  const tr = useTranslations("Reputation.views");
  const { agency, reviews, scoreView, scoreCollaboratorId, setPanel, goToSection } = useCertificate();
  const [copied, setCopied] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const scoreRef = useRef<HTMLButtonElement>(null);
  const reflectionRef = useRef<HTMLSpanElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const signRef = useRef<HTMLDivElement>(null);

  // Phones: the first screen ends right under the Réputation switch (Tous les avis / Avis Contrôlés), whatever the phone's size and
  // fonts: measured once the page has its fonts, the extra height goes to the photo. Only recomputed when the width changes
  // (the address bar showing or hiding must not make the hero jump).
  useEffect(() => {
    const hero = heroRef.current;
    const sign = signRef.current;
    if (!hero || !sign) return;
    let width = 0;
    const fit = () => {
      if (window.innerWidth >= 600) {
        hero.style.removeProperty("--hero-fold-min");
        hero.style.removeProperty("--hero-photo-height");
        return;
      }
      const toggle = document.querySelector<HTMLElement>("#synthese [role=radiogroup]");
      if (!toggle) return;
      const heroBox = hero.getBoundingClientRect();
      const heroTop = heroBox.top + window.scrollY;
      const below = toggle.getBoundingClientRect().bottom - heroBox.bottom;
      const minHeight = Math.round(window.innerHeight - 12 - below - heroTop);
      hero.style.setProperty("--hero-fold-min", `${minHeight}px`);
      // The photo reaches 80 px under the top of the card (fading out there), and starts 70 px above the hero.
      requestAnimationFrame(() => hero.style.setProperty("--hero-photo-height", `${Math.round(sign.offsetTop + 150)}px`));
    };
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      fit();
    };
    onResize();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const summary = useMemo(() => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)), [reviews, scoreView, scoreCollaboratorId]);
  const average = isPublic(summary.count, agency.publicThreshold) ? summary.average : null;
  const visible = average !== null;
  const controlled = scoreView === "controle";
  const tp = useTranslations("Products");
  const relativeDate = useRelativeDate();
  // No photo (or the presentation's key 3): option 3, « La parole aux clients », a recent 5★ controlled review on the brand navy.
  const noPhoto = useNoPhotoPreview() || !agency.coverPhoto;
  const quote = useMemo(
    () =>
      reviews
        .filter((review) => review.status === "controle" && review.rating >= 5 && review.comment && review.comment.length >= 40 && review.comment.length <= 170)
        .sort((a, b) => a.daysAgo - b.daysAgo)[0],
    [reviews],
  );
  const quoteInitials = quote ? quote.authorName.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() : "";
  const quoteAuthor = quote ? (([first, last]) => (last ? `${first} ${last[0]}.` : first))(quote.authorName.split(" ")) : "";
  const modeLabel = tr(scoreView);
  const countLabel = th("reviews", { count: formatCount(summary.count) });


  useEffect(() => {
    const card = scoreRef.current;
    const reflection = reflectionRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!card || !reflection || reducedMotion.matches) return;

    let animation: Animation | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry || entry.intersectionRatio < 0.4) return;
      observer.disconnect();
      if (reducedMotion.matches) return;
      animation = reflection.animate([
        { opacity: 0, transform: "translateX(-78%)" },
        { opacity: 0.85, offset: 0.24 },
        { opacity: 0.72, offset: 0.7 },
        { opacity: 0, transform: "translateX(78%)" },
      ], { duration: 2100, easing: "cubic-bezier(.25,.6,.45,1)" });
    }, { threshold: 0.4 });
    observer.observe(card);

    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [visible, scoreView]);

  const share = async () => {
    const data = { title: agency.name, text: t("shareText", { name: agency.name }), url: window.location.href };
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

  return (
    <Box
      component="article"
      ref={heroRef}
      sx={{
        ...cardSx,
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        // Large bottom-right curve, as in option D: desktop only (phones and tablets: 20 px corners all round, 2026-11-25).
        borderRadius: { xs: "20px", md: "20px 20px 96px 20px" },
        display: "grid",
        // Phone: the photo shows above the sign, which overlaps its lower part. Desktop: the sign floats on the left.
        gridTemplateAreas: { xs: '"caption" "sign"', md: '"sign caption"' },
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.05fr) minmax(0, 1fr)" },
        // Desktop: tall enough that the big Réputation score starts below the first screen (only the switch shows under the hero).
        // 41 px more than V1, whose header was 41 px taller, so the page folds at the same place.
        minHeight: { md: "clamp(501px, calc(100svh - 304px), 761px)" },
        // Phones: the same idea, the first screen ends at the Réputation switch; the extra height goes to the photo (2026-11-25).
        ...{ "@media (max-width: 599.95px)": { minHeight: "var(--hero-fold-min, 0px)", gridTemplateRows: "1fr auto" } },
        p: { xs: 1.5, sm: 2, md: 3 },
        columnGap: 4,
        background: noPhoto ? auroraBackground : { xs: appGradientTall, md: "linear-gradient(147.875deg, rgb(143,178,219) 0%, rgb(201,219,240) 71.429%)" },
      }}
    >
      {/* No photo (option C2, « Aurore », 2026-11-25): soft teal, blue and mint lights over the blue → green gradient, with a fine sparkle grain. */}
      {noPhoto && (
        <Box aria-hidden sx={{ position: "absolute", zIndex: -1, inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <Box sx={{ position: "absolute", inset: "-20%", filter: "blur(30px)", background: "radial-gradient(40% 30% at 30% 20%, rgba(63,181,159,0.55), transparent 70%), radial-gradient(35% 40% at 75% 35%, rgba(44,149,255,0.5), transparent 70%), radial-gradient(45% 30% at 60% 85%, rgba(126,224,201,0.35), transparent 70%)" }} />
          <Box sx={{ position: "absolute", inset: 0, background: `${sparkles} 0 0/120px 120px` }} />
        </Box>
      )}
      {/* The team photo runs behind the whole hero on desktop; on phones and tablets it fills the top and fades into navy under the sign. */}
      {!noPhoto && <Box sx={{ position: "absolute", zIndex: -1, inset: { xs: "-70px 0 auto 0", sm: "0 0 auto 0", md: 0 }, height: { xs: "max(330px, var(--hero-photo-height, 330px))", sm: 470, md: "auto" }, maskImage: { xs: "linear-gradient(#000 70%, transparent 100%)", md: "none" }, "& img": { objectPosition: { xs: "50% center", sm: "70% center" } } }}>
        <Image src={agency.coverPhoto} alt={t("coverAlt", { name: agency.name })} fill priority sizes="(min-width: 1200px) 1100px, 100vw" style={{ objectFit: "cover" }} />
        <Box aria-hidden sx={{ position: "absolute", inset: { xs: "72px 0 0 0", sm: 0 }, background: { xs: "linear-gradient(rgba(4,27,68,0.1) 0%, rgba(4,27,68,0.18) 30%, rgba(4,27,68,0.62) 55%, rgba(4,27,68,0.85) 80%)", md: "linear-gradient(rgba(4,27,68,0) 30%, rgba(4,27,68,0.45) 65%, rgba(4,27,68,0.8) 100%)" } }} />
      </Box>}

      <Box
        ref={signRef}
        sx={{
          gridArea: "sign",
          // Desktop (option 3, 2026-11-25): the card runs the full height of the hero; its four blocks (heading, score, info lines,
          // buttons) share the spare height evenly.
          alignSelf: { xs: "center", md: "stretch" },
          justifySelf: { md: "start" },
          width: { md: 440 },
          display: "flex",
          flexDirection: "column",
          justifyContent: { md: "space-between" },
          // At least 16 px between every block: heading, score, info lines, buttons.
          gap: 2,
          p: { xs: 2, sm: 3, lg: 3.5 },
          minWidth: 0,
          borderRadius: "16px",
          bgcolor: "rgba(231, 238, 246, 0.84)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 32px 64px -16px rgba(4,27,68,0.45), 0 12px 24px -8px rgba(4,27,68,0.25)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            // The logo as tall as the company name and the line under it; the sector and city under the name.
            gridTemplateColumns: { xs: "42px minmax(0, 1fr) auto", md: "46px minmax(0, 1fr) auto" },
            gridTemplateAreas: '"logo name share" "logo sector share"',
            columnGap: 1.25,
            rowGap: 0,
            alignItems: "center",
          }}
        >
          <Box sx={{ gridArea: "logo", alignSelf: "center", width: { xs: 42, md: 46 }, height: { xs: 42, md: 46 }, borderRadius: "10px", overflow: "hidden", bgcolor: tokens.blanc, border: `1px solid ${tokens.grisMoyen1}`, display: "grid", placeItems: "center" }}>
            <Box sx={{ position: "relative", width: { xs: 36, md: 40 }, height: { xs: 32, md: 36 }, overflow: "hidden" }}>
              <Box sx={{ position: "absolute", width: "133.24%", height: "145.41%", left: "-14.28%", top: "-22.96%" }}>
                <Image src={agency.logo} alt="" fill sizes="48px" />
              </Box>
            </Box>
          </Box>
          <Box sx={{ gridArea: "name", position: "relative", alignSelf: "center", minWidth: 0, fontSize: { xs: 24, md: 28 } }}>
            <Typography ref={nameRef} component="h1" sx={{
              fontSize: "inherit", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.04em", color: tokens.bleuFonce,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", overflowWrap: "anywhere",
            }}>
              {agency.name}
            </Typography>
            {/* The name opens the agency card, the same as the floating button's (its full name too, when it is cut). */}
            <ButtonBase
              aria-haspopup="dialog"
              aria-label={th("showCompanyName")}
              onClick={() => setNameOpen(true)}
              sx={{ position: "absolute", inset: 0, borderRadius: "6px", "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}` } }}
            />
          </Box>
          <Typography sx={{ gridArea: "sector", fontSize: 12, color: "#405c74", lineHeight: 1.35 }}>{th("sector", { sector: agency.sector, city: agency.city })}</Typography>
          <IconButton onClick={share} aria-label={t("share")} sx={{ gridArea: "share", alignSelf: "center", p: 1, my: -1, mr: -1, borderRadius: "8px" }}>
            <FigmaIcon name="share" />
          </IconButton>
        </Box>

        {average !== null && (
          <ButtonBase
            ref={scoreRef}
            // Opens the Réputation score card (#note), not the reviews list.
            onClick={() => {
              const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              document.getElementById("note")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
            }}
            aria-label={th("scoreAria", { mode: modeLabel, score: formatScore(average), count: countLabel })}
            sx={{
              width: "100%", maxWidth: { sm: 400, md: "none" }, alignSelf: { xs: "stretch", sm: "flex-start", md: "stretch" },
              position: "relative", isolation: "isolate", overflow: "hidden", containerType: "inline-size",
              // Desktop: bigger, the score, the stars and the mode stacked and centred.
              justifyItems: { md: "center" },
              // Option 3 (2026-11-24): a big score on the left; big stars on the right with the mode and the count under them.
              display: "grid", gridTemplateColumns: { xs: "max-content minmax(0, 1fr) auto", md: "minmax(0, 1fr)" }, gridTemplateAreas: { xs: '"score stars chevron" "score caption caption"', md: '"score" "stars" "caption"' },
              columnGap: "clamp(10px, 4%, 16px)", rowGap: 0.5, alignItems: "center",
              px: { xs: 2, sm: 2.25 }, py: { xs: 1.75, sm: 2, md: 2.5 }, borderRadius: "8px",
              border: `1px solid ${controlled ? "#b8dacf" : "#ceddeb"}`,
              background: controlled
                ? "linear-gradient(117deg, #fff 6%, #f5fcfa 48%, #ddefe9)"
                : "linear-gradient(117deg, #fff 6%, #f7fbff 48%, #e2ecf8)",
              color: tokens.bleuFonce, textAlign: "left", fontFamily: "inherit",
              boxShadow: "0 4px 10px rgba(21,44,80,0.09)", transition: "box-shadow 180ms ease",
              "&:hover": { boxShadow: "0 7px 16px rgba(21,44,80,0.18)" },
              "&:hover .score-chevron": { transform: "translateX(2px)" },
              "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 },
              "@media (prefers-reduced-motion: reduce)": { "& .score-reflection": { display: "none" }, "&:hover .score-chevron": { transform: "none" } },
            }}
          >
            <Box ref={reflectionRef} component="span" className="score-reflection" aria-hidden sx={{
              position: "absolute", inset: "-55%", zIndex: -1, pointerEvents: "none", opacity: 0,
              background: "linear-gradient(108deg, transparent 22%, #b4e6f449 38%, #fffc 47%, #b3bdf744 54%, #d9ffff55 62%, transparent 78%)",
            }} />
            <Box component="span" sx={{ gridArea: "score", alignSelf: "center", display: "inline-flex", alignItems: "baseline", whiteSpace: "nowrap", lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>
              <Box component="span" sx={{ fontSize: { xs: "clamp(40px, 20cqi, 66px)", md: 80 }, fontWeight: 700, letterSpacing: "-0.07em" }}>{formatScore(average)}</Box>
              <Box component="span" sx={{ fontSize: { xs: "clamp(12px, 4.6cqi, 16px)", md: 18 }, color: "#456379", ml: "4px" }}>/5</Box>
            </Box>
            <Rating value={displayScore(average)} precision={0.1} readOnly aria-hidden
              icon={<StarRounded fontSize="inherit" />} emptyIcon={<StarRounded fontSize="inherit" />}
              sx={{ gridArea: "stars", alignSelf: "end", ml: { xs: "-2px", md: 0 }, mt: { md: 1 }, fontSize: { xs: "clamp(22px, 10cqi, 34px)", md: 34 }, "& .MuiRating-iconFilled": { color: tokens.rating }, "& .MuiRating-iconEmpty": { color: "#8ea6ba", opacity: 0.48 } }}
            />
            <ChevronRight aria-hidden className="score-chevron" sx={{ gridArea: { xs: "chevron", md: "auto" }, position: { md: "absolute" }, top: { md: 14 }, right: { md: 12 }, fontSize: 21, transition: "transform 150ms ease" }} />
            <Box component="span" sx={{ gridArea: "caption", alignSelf: "start", display: "flex", alignItems: "center", flexWrap: "nowrap", columnGap: 0.5, minWidth: 0, fontSize: { xs: "clamp(12px, 4cqi, 14px)", md: 14.5 }, lineHeight: 1.3, color: "#456379" }}>
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 600, color: tokens.bleuFonce, whiteSpace: "nowrap" }}>
                <FigmaIcon name={controlled ? "rv-controle" : "rv-all"} size={18} />
                {modeLabel}
              </Box>
              {/* "Tous les avis – 2 500" on one line; the full "2 500 avis" is in the button's label for screen readers. */}
              <Box component="span" aria-hidden sx={{ whiteSpace: "nowrap" }}>– {formatCount(summary.count)}</Box>
            </Box>
          </ButtonBase>
        )}

        {/* Phones: the status, the address, then the website and the directions side by side.
            Desktop: one line each, with a thin divider and a chevron, straight on the glass (no panel). */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", md: "stretch" }, gap: { xs: 1, md: 0 }, ...infoLinesSx }}>
          {/* The status opens the Horaires sheet (today, the week, holidays and other exceptions). */}
          <Link
            href="#nos-agences"
            onClick={(event) => {
              event.preventDefault();
              setPanel("hours");
            }}
            sx={{
              ...metaLinkSx,
              // The divider sits halfway: 8 px under the status, 8 px over the address.
              width: "100%", pb: 1, borderBottom: "1px solid #c3d3e3",
              "& > [role=status]": { flex: 1 },
            }}
          >
            <OpenStatus hours={agency.hours} split clock />
            <Box component="span" sx={visuallyHidden}>{th("hoursLink")}</Box>
            <ChevronRight aria-hidden className="line-chevron" />
          </Link>
          {/* Jumps to the map and hours in Nos Agences. */}
          <Link
            href="#nos-agences"
            aria-label={t("addressLink", { address: agency.address })}
            onClick={(event) => {
              event.preventDefault();
              scrollToAgencies();
            }}
            title={agency.address}
            // One line: the address is cut with … when it is too long (the full address is in the label and the tooltip).
            sx={{ ...metaLinkSx, maxWidth: "100%", minWidth: 0 }}
          >
            <PlaceOutlined sx={{ flexShrink: 0 }} />
            <Box component="span" sx={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agency.address}</Box>
            <ChevronRight aria-hidden className="line-chevron" />
          </Link>
          <Box sx={{ display: { xs: "flex", md: "contents" }, flexWrap: "wrap", columnGap: 2.5, rowGap: 1, mt: 1 }}>
            <Link href={agency.website} target="_blank" rel="noopener noreferrer" sx={metaLinkSx}>
              <LanguageOutlined />
              <span>
                {t("website")}
                <Box component="span" className="line-detail"> · {websiteHost(agency.website)}</Box>
              </span>
              <ChevronRight aria-hidden className="line-chevron" />
            </Link>
            <Link
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(agency.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.currentTarget.setAttribute("href", directionsUrl(agency.address))}
              sx={metaLinkSx}
            >
              <DirectionsOutlined />
              <span>
                {t("directions")}
                <Box component="span" className="line-detail"> · Google Maps</Box>
              </span>
              <ChevronRight aria-hidden className="line-chevron" />
            </Link>
          </Box>
        </Box>

        {/* At the foot of the card (2026-11-25). Side by side on every width, sharing the card width on phones and desktop; on phones the text is 13 px and the padding tighter so both fit on one line. */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, "& > .MuiButton-root": { width: "auto", minWidth: 0, flex: { xs: "1 1 0", sm: "0 0 auto", md: "1 1 0" }, px: { xs: 1.25, sm: 3 }, fontSize: { xs: 13, sm: 14 }, whiteSpace: { xs: "nowrap", sm: "normal" } } }}>
          <CtaButton onClick={() => setPanel("contact")}>{th("talkShort")}</CtaButton>
          <CtaButton variant="secondary" icon="icon-right-arrow" onClick={() => goToSection("avis")}>{th("read")}</CtaButton>
        </Box>
      </Box>

      {noPhoto && quote ? (
        // The review in a frosted glass bubble (white text, the lights show through), the client's initials and the controlled seal under it.
        <Box component="figure" aria-label={th("quoteLabel")} sx={{ gridArea: "caption", m: 0, alignSelf: { xs: "end", md: "center" }, display: "flex", flexDirection: "column", gap: { xs: 1, md: 1.75 }, maxWidth: { md: 540 }, px: { xs: 0.5, md: 0 }, pr: { md: 4 }, pt: { xs: 1, md: 0 }, pb: { xs: 2, md: 0 }, color: tokens.blanc }}>
          <Box sx={{
            borderRadius: { xs: "12px 12px 12px 4px", md: "18px 18px 18px 4px" }, px: { xs: 1.75, md: 3 }, py: { xs: 1.5, md: 2.75 },
            background: "linear-gradient(135deg, rgba(255,255,255,0.26), rgba(255,255,255,0.1))", border: "1px solid rgba(255,255,255,0.35)",
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 24px 50px -20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}>
            <Rating value={5} readOnly aria-hidden sx={{ fontSize: { xs: 15, md: 22 }, "& .MuiRating-iconFilled": { color: tokens.rating } }} />
            <Box component="blockquote" sx={{ m: 0, mt: { xs: 0.5, md: 1 }, fontSize: { xs: 14, md: 24 }, fontWeight: 600, lineHeight: 1.32, letterSpacing: "-0.02em", display: "-webkit-box", WebkitLineClamp: { xs: 3, md: 5 }, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              « {quote.comment} »
            </Box>
          </Box>
          <Box component="figcaption" sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
            <Box component="span" aria-hidden sx={{ flex: "none", width: { xs: 28, md: 42 }, height: { xs: 28, md: 42 }, borderRadius: "50%", bgcolor: "#7ee0c9", color: tokens.bleuFonce, display: "grid", placeItems: "center", fontWeight: 700, fontSize: { xs: 11, md: 15 }, boxShadow: "0 0 0 3px rgba(255,255,255,0.25)" }}>{quoteInitials}</Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: 12, md: 15 }, fontWeight: 600, lineHeight: 1.3 }}>{quoteAuthor}</Typography>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: { xs: 10.5, md: 12.5 }, lineHeight: 1.3, color: "rgba(255,255,255,0.88)" }}>
                <Verified sx={{ fontSize: { xs: 13, md: 15 }, color: "#7ee0c9" }} />
                {th("quoteDetails", { product: tp(quote.product), date: relativeDate(quote.daysAgo) })}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
      <Box sx={{ gridArea: "caption", containerType: "inline-size", alignSelf: "end", minHeight: { xs: 170, sm: 220, md: 0 }, display: "flex", flexDirection: "column", justifyContent: "flex-end", px: { xs: 1, md: 0 }, pr: { md: "64px" }, pb: { xs: 2, md: 0 }, color: tokens.blanc, textShadow: "0 1px 12px rgba(4,27,68,0.45)" }}>
        <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75, fontSize: 13, lineHeight: "normal" }}>
          <Verified sx={{ fontSize: 18, color: tokens.vertOs }} />
          {th("photoKicker")}
        </Typography>
        {/* Always one line: the size follows the width of the photo (up to 20 px on phones, 26 px on desktop). Desktop keeps clear of the curved corner. */}
        <Typography sx={{ whiteSpace: "nowrap", fontSize: { xs: "min(20px, 4.1cqi)", md: "min(26px, 4.1cqi)" }, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em" }}>{th("photoTitle")}</Typography>
      </Box>
      )}

      <AgencySheet open={nameOpen} onClose={() => setNameOpen(false)} />
      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={t("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
