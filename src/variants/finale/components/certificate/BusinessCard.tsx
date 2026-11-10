"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import ChevronRight from "@mui/icons-material/ChevronRight";
import StarOutlineRounded from "@mui/icons-material/StarOutlineRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import Verified from "@mui/icons-material/Verified";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { openHoursEvent } from "./AgenciesSection";
import { OpenStatus } from "./OpenStatus";

export const cardSx = {
  bgcolor: tokens.blanc,
  borderRadius: "20px",
  boxShadow: tokens.shadowCard,
} as const;

/** Secondary text on the frosted sign: full navy, as in the Figma (1742:88885), so it reads over the blurred photo. */
const glassMuted = tokens.bleuFonce;

/** Faint diagonal light reflection across the frosted sign. */
const sheen = "linear-gradient(115deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.28) 72%, rgba(255,255,255,0) 84%)";

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
 * white card, navy text, yellow CTA, Poppins. The score follows the Avis global / Avis Contrôlés switch and the advisor.
 */
export function BusinessCard() {
  const t = useTranslations("Business");
  const th = useTranslations("VarianteFinale.hero");
  const { agency, reviews, scoreView, scoreCollaboratorId, setPanel, goToSection } = useCertificate();
  const [copied, setCopied] = useState(false);
  const summary = useMemo(() => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)), [reviews, scoreView, scoreCollaboratorId]);
  const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
  const countLabel = th(scoreView === "controle" ? "reviewsControle" : "reviews", { count: formatCount(summary.count) });

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
      sx={{
        ...cardSx,
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        // Large bottom-right curve, as in option D.
        borderRadius: { xs: "20px 20px 72px 20px", md: "20px 20px 140px 20px" },
        display: "grid",
        // Phone: the photo shows above the sign, which overlaps its lower part. Desktop: the sign floats on the left.
        gridTemplateAreas: { xs: '"caption" "sign"', md: '"sign caption"' },
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.05fr) minmax(0, 1fr)" },
        // Desktop: tall enough that the big Réputation score starts below the first screen (only the switch shows under the hero).
        minHeight: { md: "clamp(460px, calc(100svh - 345px), 720px)" },
        p: { xs: 1.5, sm: 2, md: 3 },
        columnGap: 4,
        background: { xs: tokens.bleuFonce, md: "linear-gradient(147.875deg, rgb(143,178,219) 0%, rgb(201,219,240) 71.429%)" },
      }}
    >
      {/* The team photo runs behind the whole hero on desktop; on phones and tablets it fills the top and fades into navy under the sign. */}
      <Box sx={{ position: "absolute", zIndex: -1, inset: { xs: "-70px 0 auto 0", sm: "0 0 auto 0", md: 0 }, height: { xs: 330, sm: 470, md: "auto" }, "& img": { objectPosition: { xs: "50% center", sm: "70% center" } } }}>
        <Image src={agency.coverPhoto} alt={t("coverAlt", { name: agency.name })} fill priority sizes="(min-width: 1200px) 1100px, 100vw" style={{ objectFit: "cover" }} />
        <Box aria-hidden sx={{ position: "absolute", inset: { xs: "72px 0 0 0", sm: 0 }, background: { xs: "linear-gradient(rgba(4,27,68,0.25) 0%, rgba(4,27,68,0.6) 30%, rgba(4,27,68,0.78) 55%, #041b44 100%)", md: "linear-gradient(rgba(4,27,68,0) 30%, rgba(4,27,68,0.45) 65%, rgba(4,27,68,0.8) 100%)" } }} />
      </Box>

      <Box
        sx={{
          gridArea: "sign",
          // Desktop: the card sits at the bottom of the hero, level with the caption on the right.
          alignSelf: { xs: "center", md: "end" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: { xs: 2, sm: 3, lg: 3.5 },
          minWidth: 0,
          borderRadius: "16px",
          // On phones and tablets the sign reaches the curved corner, so its own corner follows it (72 px minus the padding).
          borderBottomRightRadius: { xs: "60px", sm: "56px", md: "16px" },
          // Frosted plastic: mostly white, a strong blur of the photo behind, and a faint diagonal sheen.
          // A little whiter on phones and tablets, where the lower part of the sign sits on navy instead of the photo.
          background: {
            xs: `${sheen}, rgba(255,255,255,0.72)`,
            md: `${sheen}, rgba(255,255,255,0.58)`,
          },
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          boxShadow: "0 32px 64px -16px rgba(4,27,68,0.45), 0 12px 24px -8px rgba(4,27,68,0.25)",
        }}
      >
        {/*
          Every size (Figma 1742:88885): the name next to the logo with the sector under it, the share icon top right.
          The name is 24 px on phones, 28 px from 900 px.
        */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "48px minmax(0, 1fr) auto",
            gridTemplateAreas: '"logo name share" "logo sector share"',
            gridTemplateRows: "auto 1fr",
            columnGap: 1.5,
            rowGap: 0,
            alignItems: "start",
          }}
        >
          <Box sx={{ gridArea: "logo", width: 48, height: 48, borderRadius: "12px", overflow: "hidden", flexShrink: 0, bgcolor: tokens.blanc, border: `1px solid ${tokens.grisMoyen1}`, display: "grid", placeItems: "center" }}>
            {/* Crop of the logo image as set in Figma ("image 4"). */}
            <Box sx={{ position: "relative", width: 40, height: 36, overflow: "hidden" }}>
              <Box sx={{ position: "absolute", width: "133.24%", height: "145.41%", left: "-14.28%", top: "-22.96%" }}>
                <Image src={agency.logo} alt={t("logoAlt", { name: agency.name })} fill sizes="80px" />
              </Box>
            </Box>
          </Box>
          <Typography component="h1" sx={{ gridArea: "name", fontSize: { xs: 24, md: 28 }, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", color: tokens.bleuFonce, textWrap: "balance" }}>
            {agency.name}
          </Typography>
          <Typography sx={{ gridArea: "sector", fontSize: 14, color: glassMuted, lineHeight: 1.5 }}>{th("sector", { sector: agency.sector, city: agency.city })}</Typography>
          <IconButton onClick={share} aria-label={t("share")} sx={{ gridArea: "share", alignSelf: "start", p: 1, m: -1, borderRadius: "8px" }}>
            <FigmaIcon name="share" />
          </IconButton>
        </Box>

        {visible && (
          <ButtonBase
            // Opens the Réputation score card (#note), not the reviews list.
            onClick={() => {
              const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              document.getElementById("note")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
            }}
            aria-label={th("scoreAria", { score: formatScore(summary.average!), count: countLabel })}
            sx={{ width: "100%", maxWidth: { sm: 400 }, alignSelf: { xs: "stretch", sm: "flex-start" }, containerType: "inline-size", alignItems: "center", gap: 1.25, px: 2, py: 3.5, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.75)", border: "1px solid #b8c2cc", textAlign: "left", fontFamily: "inherit", "&:hover": { bgcolor: tokens.blanc }, "&:hover .score-chevron": { transform: "translateX(2px)" }, "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } }}
          >
            {/* The score out of 5, a divider, the stars (green for Avis Contrôlés) over the number of reviews, an arrow to the detail. */}
            <Box component="span" sx={{ display: "flex", alignItems: "baseline", flexShrink: 0, color: tokens.bleuFonce, lineHeight: 1 }}>
              <Box component="span" sx={{ fontSize: "min(54px, 15.5cqi)", fontWeight: 700, letterSpacing: "-0.03em" }}>{formatScore(summary.average!)}</Box>
              <Box component="span" sx={{ fontSize: "min(22px, 6.5cqi)", fontWeight: 400, color: "#5d7387", ml: 0.25 }}>/5</Box>
            </Box>
            <Box aria-hidden sx={{ alignSelf: "stretch", width: "1px", bgcolor: "rgba(4, 27, 68, 0.14)", flexShrink: 0 }} />
            <Box component="span" sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
              <Box component="span" aria-hidden sx={{ display: "flex", gap: 0.25 }}>
                {[1, 2, 3, 4, 5].map((star) => star <= Math.round(summary.average!)
                  ? <StarRounded key={star} sx={{ fontSize: "min(30px, 8.6cqi)", color: scoreView === "controle" ? tokens.vertOs : "#ffb400" }} />
                  : <StarOutlineRounded key={star} sx={{ fontSize: "min(30px, 8.6cqi)", color: "#8ea1b2" }} />)}
              </Box>
              <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "min(18px, 4.8cqi)", lineHeight: 1.3, fontWeight: 400, color: tokens.bleuFonce, whiteSpace: "nowrap" }}>
                {/* Only the number is bold. */}
                <span>{th.rich(scoreView === "controle" ? "scoreCountControle" : "scoreCount", { count: formatCount(summary.count), b: (chunks) => <b>{chunks}</b> })}</span>
              </Box>
            </Box>
            <ChevronRight className="score-chevron" sx={{ ml: "auto", flexShrink: 0, fontSize: 26, color: tokens.bleuFonce, transition: "transform 150ms ease" }} />
          </ButtonBase>
        )}

        {/* Side by side on every width; on phones the text is 13 px and the padding tighter so both fit on one line. */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, "& > .MuiButton-root": { width: "auto", minWidth: 0, flex: { xs: "1 1 0", sm: "0 0 auto" }, px: { xs: 1.25, sm: 3 }, fontSize: { xs: 13, sm: 14 }, whiteSpace: { xs: "nowrap", sm: "normal" } } }}>
          <CtaButton onClick={() => setPanel("contact")}>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>{th("talkShort")}</Box>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{th("talk")}</Box>
          </CtaButton>
          <CtaButton variant="secondary" icon="icon-right-arrow" onClick={() => goToSection("avis")}>{th("read")}</CtaButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
          {/* The status opens this agency's week of hours in Nos Agences. */}
          <Link
            href="#nos-agences"
            onClick={(event) => {
              event.preventDefault();
              window.dispatchEvent(new Event(openHoursEvent));
              scrollToAgencies();
            }}
            sx={{ ...metaLinkSx, "&:hover p": { textDecoration: "underline", textUnderlineOffset: "3px" } }}
          >
            <OpenStatus hours={agency.hours} boxed />
            <Box component="span" sx={visuallyHidden}>{th("hoursLink")}</Box>
          </Link>
          <Box aria-hidden sx={{ height: 8 }} />
          {/* Jumps to the map and hours in Nos Agences. */}
          <Link
            href="#nos-agences"
            aria-label={t("addressLink", { address: agency.address })}
            onClick={(event) => {
              event.preventDefault();
              scrollToAgencies();
            }}
            sx={metaLinkSx}
          >
            <PlaceOutlined />
            {agency.address}
          </Link>
          <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 2.5, rowGap: 1 }}>
            <Link href={agency.website} target="_blank" rel="noopener noreferrer" sx={metaLinkSx}>
              <LanguageOutlined />
              {t("website")}
            </Link>
            <Link
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(agency.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.currentTarget.setAttribute("href", directionsUrl(agency.address))}
              sx={metaLinkSx}
            >
              <DirectionsOutlined />
              {t("directions")}
            </Link>
          </Box>
        </Box>
      </Box>

      <Box sx={{ gridArea: "caption", containerType: "inline-size", alignSelf: "end", minHeight: { xs: 170, sm: 220, md: 0 }, display: "flex", flexDirection: "column", justifyContent: "flex-end", px: { xs: 1, md: 0 }, pr: { md: "64px" }, pb: { xs: 2, md: 0 }, color: tokens.blanc, textShadow: "0 1px 12px rgba(4,27,68,0.45)" }}>
        <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75, fontSize: 13, lineHeight: "normal" }}>
          <Verified sx={{ fontSize: 18, color: tokens.vertOs }} />
          {th("photoKicker")}
        </Typography>
        {/* Always one line: the size follows the width of the photo (up to 20 px on phones, 26 px on desktop). Desktop keeps clear of the curved corner. */}
        <Typography sx={{ whiteSpace: "nowrap", fontSize: { xs: "min(20px, 4.1cqi)", md: "min(26px, 4.1cqi)" }, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em" }}>{th("photoTitle")}</Typography>
      </Box>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={t("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
