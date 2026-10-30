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

/** Grey text on the frosted sign: darker than tokens.gris so it stays readable over the blurred photo. */
const glassMuted = "rgba(4, 27, 68, 0.64)";

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
        display: "grid",
        // Phone: the photo shows above the sign, which overlaps its lower part. Desktop: the sign floats on the left.
        gridTemplateAreas: { xs: '"caption" "sign"', md: '"sign caption"' },
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.05fr) minmax(0, 1fr)" },
        minHeight: { md: 540 },
        p: { xs: 1.5, sm: 2, md: 4 },
        columnGap: 4,
        background: { xs: tokens.bleuFonce, md: "linear-gradient(147.875deg, rgb(143,178,219) 0%, rgb(201,219,240) 71.429%)" },
      }}
    >
      {/* The team photo runs behind the whole hero on desktop; on phones and tablets it fills the top and fades into navy under the sign. */}
      <Box sx={{ position: "absolute", zIndex: -1, inset: { xs: "0 0 auto 0", md: 0 }, height: { xs: 380, sm: 540, md: "auto" } }}>
        <Image src={agency.coverPhoto} alt={t("coverAlt", { name: agency.name })} fill priority sizes="(min-width: 1200px) 1100px, 100vw" style={{ objectFit: "cover", objectPosition: "70% center" }} />
        <Box aria-hidden sx={{ position: "absolute", inset: 0, background: { xs: "linear-gradient(rgba(4,27,68,0) 25%, rgba(4,27,68,0.55) 60%, #041b44 100%)", md: "linear-gradient(rgba(4,27,68,0) 40%, rgba(4,27,68,0.6) 100%)" } }} />
      </Box>

      <Box
        sx={{
          gridArea: "sign",
          alignSelf: "center",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, md: 2.5 },
          p: { xs: 2, sm: 3, lg: 4.5 },
          minWidth: 0,
          borderRadius: "16px",
          // Frosted plastic: mostly white, a strong blur of the photo behind, and a faint diagonal sheen.
          // A little whiter on phones and tablets, where the lower part of the sign sits on navy instead of the photo.
          background: {
            xs: `${sheen}, rgba(255,255,255,0.88)`,
            md: `${sheen}, rgba(255,255,255,0.8)`,
          },
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
          boxShadow: "0 32px 64px -16px rgba(4,27,68,0.45), 0 12px 24px -8px rgba(4,27,68,0.25)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: "12px", overflow: "hidden", flexShrink: 0, bgcolor: tokens.blanc, border: `1px solid ${tokens.grisMoyen1}`, display: "grid", placeItems: "center" }}>
            {/* Crop of the logo image as set in Figma ("image 4"). */}
            <Box sx={{ position: "relative", width: 40, height: 36, overflow: "hidden" }}>
              <Box sx={{ position: "absolute", width: "133.24%", height: "145.41%", left: "-14.28%", top: "-22.96%" }}>
                <Image src={agency.logo} alt={t("logoAlt", { name: agency.name })} fill sizes="80px" />
              </Box>
            </Box>
          </Box>
          <Typography sx={{ flex: 1, fontSize: 14, color: glassMuted, lineHeight: "normal" }}>{th("sector", { sector: agency.sector, city: agency.city })}</Typography>
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
            sx={{ alignSelf: "flex-start", gap: 1.5, py: 1.25, pl: 1.75, pr: 2, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.72)", border: `1px solid ${tokens.grisMoyen1}`, textAlign: "left", "&:hover": { bgcolor: tokens.blanc } }}
          >
            <Typography component="span" sx={{ fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", color: tokens.bleuFonce, whiteSpace: "nowrap" }}>
              {formatScore(summary.average!)}
              <Box component="span" sx={{ fontSize: 16, fontWeight: 500, letterSpacing: 0, color: glassMuted }}>/5</Box>
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Rating readOnly value={summary.average} precision={0.1} sx={{ fontSize: 20 }} />
              <Typography component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 13, color: glassMuted, lineHeight: "normal" }}>
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

      <Box sx={{ gridArea: "caption", alignSelf: "end", minHeight: { xs: 220, sm: 280, md: 0 }, display: "flex", flexDirection: "column", justifyContent: "flex-end", px: { xs: 1, md: 0 }, pb: { xs: 2, md: 0 }, color: tokens.blanc, textShadow: "0 1px 12px rgba(4,27,68,0.45)" }}>
        <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75, fontSize: 13, lineHeight: "normal" }}>
          <Verified sx={{ fontSize: 18, color: tokens.vertOs }} />
          {th("photoKicker")}
        </Typography>
        <Typography sx={{ maxWidth: 420, fontSize: { xs: 20, md: 26 }, fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", textWrap: "balance" }}>{th("photoTitle")}</Typography>
      </Box>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={t("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
