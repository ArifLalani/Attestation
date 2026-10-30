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
import { OpenStatus } from "./OpenStatus";

export const cardSx = {
  bgcolor: tokens.blanc,
  borderRadius: "20px",
  boxShadow: tokens.shadowCard,
} as const;

const metaLinkSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  fontSize: 14,
  lineHeight: "normal",
  color: tokens.gris,
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
      sx={{ ...cardSx, overflow: "hidden", display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.1fr) minmax(0, 1fr)" } }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: { xs: 2, md: 2.5 }, p: { xs: 2, sm: 3, lg: 5 }, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: "12px", overflow: "hidden", flexShrink: 0, bgcolor: tokens.blanc, border: `1px solid ${tokens.grisMoyen1}`, display: "grid", placeItems: "center" }}>
            {/* Crop of the logo image as set in Figma ("image 4"). */}
            <Box sx={{ position: "relative", width: 40, height: 36, overflow: "hidden" }}>
              <Box sx={{ position: "absolute", width: "133.24%", height: "145.41%", left: "-14.28%", top: "-22.96%" }}>
                <Image src={agency.logo} alt={t("logoAlt", { name: agency.name })} fill sizes="80px" />
              </Box>
            </Box>
          </Box>
          <Typography sx={{ flex: 1, fontSize: 14, color: tokens.gris, lineHeight: "normal" }}>{th("sector", { sector: agency.sector, city: agency.city })}</Typography>
          <IconButton onClick={share} aria-label={t("share")} sx={{ p: 1, borderRadius: "8px" }}>
            <FigmaIcon name="share" />
          </IconButton>
        </Box>

        <Box>
          <Typography component="h1" sx={{ fontSize: { xs: 34, sm: 44, lg: 54 }, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", color: tokens.bleuFonce, textWrap: "balance" }}>
            {agency.name}
          </Typography>
          <Typography sx={{ mt: 1, fontSize: { xs: 20, sm: 24, lg: 28 }, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-0.02em", color: tokens.bleuFonce, textWrap: "balance" }}>
            {th("tagline")}
          </Typography>
        </Box>

        {visible && (
          <ButtonBase
            onClick={() => goToSection("avis")}
            aria-label={th("scoreAria", { score: formatScore(summary.average!), count: countLabel })}
            sx={{ alignSelf: "flex-start", gap: 1.5, py: 1.25, pl: 1.75, pr: 2, borderRadius: "12px", bgcolor: tokens.grisClair2, border: `1px solid ${tokens.grisMoyen1}`, textAlign: "left", "&:hover": { borderColor: tokens.gris } }}
          >
            <Typography component="span" sx={{ fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", color: tokens.bleuFonce, whiteSpace: "nowrap" }}>
              {formatScore(summary.average!)}
              <Box component="span" sx={{ fontSize: 16, fontWeight: 500, letterSpacing: 0, color: tokens.gris }}>/5</Box>
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Rating readOnly value={summary.average} precision={0.1} sx={{ fontSize: 20 }} />
              <Typography component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 13, color: tokens.gris, lineHeight: "normal" }}>
                {scoreView === "controle" && <Verified sx={{ fontSize: 15, color: tokens.vertOs }} />}
                {countLabel}
              </Typography>
            </Box>
          </ButtonBase>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, "& > .MuiButton-root": { width: "auto", flex: { xs: "1 1 auto", sm: "0 0 auto" }, px: 3 } }}>
          <CtaButton onClick={() => setPanel("contact")}>{th("talk")}</CtaButton>
          <CtaButton variant="secondary" icon={null} onClick={() => goToSection("avis")}>{th("read")}</CtaButton>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 2.5, rowGap: 1 }}>
          <OpenStatus hours={agency.hours} />
          {/* Jumps to the map and hours in Nos Agences. */}
          <Link
            href="#nos-agences"
            aria-label={t("addressLink", { address: agency.address })}
            onClick={(event) => {
              const target = document.getElementById("nos-agences");
              if (!target) return;
              event.preventDefault();
              const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              target.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
            }}
            sx={metaLinkSx}
          >
            <FigmaIcon name="map-pin" />
            {agency.address}
          </Link>
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

      <Box sx={{ position: "relative", minHeight: { xs: 240, sm: 320, md: 480 }, background: "linear-gradient(147.875deg, rgb(143,178,219) 0%, rgb(201,219,240) 71.429%)" }}>
        <Image src={agency.coverPhoto} alt={t("coverAlt", { name: agency.name })} fill priority sizes="(min-width: 1200px) 560px, (min-width: 900px) 46vw, (min-width: 640px) 616px, 100vw" style={{ objectFit: "cover" }} />
        <Box aria-hidden sx={{ position: "absolute", inset: "45% 0 0", background: "linear-gradient(rgba(4,27,68,0), rgba(4,27,68,0.72))" }} />
        <Box sx={{ position: "absolute", left: { xs: 16, md: 32 }, right: { xs: 16, md: 32 }, bottom: { xs: 16, md: 32 }, color: tokens.blanc }}>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75, fontSize: 13, lineHeight: "normal" }}>
            <Verified sx={{ fontSize: 18, color: tokens.vertOs }} />
            {th("photoKicker")}
          </Typography>
          <Typography sx={{ maxWidth: 420, fontSize: { xs: 20, md: 26 }, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", textWrap: "balance" }}>{th("photoTitle")}</Typography>
        </Box>
      </Box>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={t("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
