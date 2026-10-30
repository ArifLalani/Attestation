"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FigmaIcon } from "@/variants/f/components/ui/FigmaIcon";
import { poppins, tokens } from "@/variants/f/theme";
import Rating from "@mui/material/Rating";
import { useMemo } from "react";
import { formatCount, formatScore } from "@/lib/format";
import { displayScore, isPublic, summarize } from "@/lib/scoring";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { OpenStatus } from "./OpenStatus";

export const cardSx = {
  bgcolor: tokens.blanc,
  borderRadius: tokens.radiusCard,
  boxShadow: tokens.shadowCard,
} as const;

const chipButtonSx = {
  flex: "1 1 0",
  minWidth: 0,
  height: 35,
  p: "7px",
  borderRadius: tokens.radiusButton,
  bgcolor: tokens.blanc,
  border: `1px solid ${tokens.bleuOs}`,
  color: tokens.bleuOs,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontSize: 14,
  fontWeight: 400,
  lineHeight: "normal",
  "&:hover": { bgcolor: tokens.grisClair1, borderColor: tokens.bleuOs },
} as const;

function directionsUrl(address: string) {
  const destination = encodeURIComponent(address);
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** Figma "Business card" (1353:11257). */
export function BusinessCard() {
  const t = useTranslations("Business");
  const { agency, setPanel } = useCertificate();
  const [copied, setCopied] = useState(false);

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

  const actionButtons = (
    <>
      <Button sx={chipButtonSx} onClick={() => setPanel("contact")}>
        {t("contact")}
      </Button>
      <Button sx={chipButtonSx} href={agency.website} target="_blank" rel="noopener noreferrer">
        {t("website")}
      </Button>
      <Button
        sx={chipButtonSx}
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(agency.address)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          event.currentTarget.setAttribute("href", directionsUrl(agency.address));
        }}
      >
        {t("directions")}
      </Button>
      </>
  );

  return (
    <Box component="article" sx={{ ...cardSx, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Live certificate header: logo tile, name in capitals, then the office illustration next to the navy score panel. */}
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 3 }, px: { xs: 1.5, md: 3 }, pt: { xs: 2, md: 2.5 } }}>
        <Box sx={{ width: { xs: 64, md: 120 }, height: { xs: 48, md: 80 }, flexShrink: 0, bgcolor: tokens.blanc, boxShadow: tokens.shadowCard, borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 0.75, md: 1.5 } }}>
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <Image src={agency.logo} alt={t("logoAlt", { name: agency.name })} fill sizes="120px" style={{ objectFit: "contain" }} />
          </Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Typography component="h1" sx={{ fontFamily: poppins, fontSize: { xs: 20, md: 26 }, fontWeight: 700, lineHeight: 1.15, color: tokens.titre, textTransform: "uppercase" }}>
            {agency.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 2, rowGap: 0.5 }}>
            <Typography sx={{ fontFamily: poppins, fontSize: 14, fontWeight: 300, color: tokens.texte, textTransform: "uppercase", lineHeight: "normal" }}>{agency.sector}</Typography>
            <OpenStatus hours={agency.hours} />
          </Box>
        </Box>
        <IconButton onClick={share} aria-label={t("share")} sx={{ p: 1, borderRadius: tokens.radiusButton, alignSelf: "flex-start" }}>
          <FigmaIcon name="share" />
        </IconButton>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.4fr) minmax(0, 1fr)" } }}>
        <Box sx={{ display: { xs: "none", md: "block" }, position: "relative", bgcolor: tokens.grisMoyen1, minHeight: 240 }}>
          <Image src="/variantes/f/office.svg" alt="" fill loading="eager" sizes="(min-width: 1100px) 620px, 60vw" style={{ objectFit: "cover", objectPosition: "center bottom" }} unoptimized />
        </Box>
        <ScorePanel />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: { xs: 1.5, md: 3 }, pb: { md: 2.5 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minHeight: 21 }}>
            <FigmaIcon name="map-pin" />
            <Typography component="address" sx={{ flex: 1, fontSize: 14, fontStyle: "normal", color: tokens.gris, lineHeight: "normal" }}>
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
                sx={{ color: "inherit", textDecoration: "none", textUnderlineOffset: "3px", "&:hover": { textDecoration: "underline" } }}
              >
                {agency.address}
              </Link>
            </Typography>
            {/* Desktop: the buttons sit on the address line, on the right, under the open/closed status. */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.5, "& > .MuiButton-root": { flex: "0 0 128px" } }}>{actionButtons}</Box>
          </Box>
        </Box>
      </Box>

      {/* Phones and tablets: the three buttons on their own row, as in the Figma. */}
      <Box sx={{ display: { xs: "flex", md: "none" }, gap: 2, px: 1.5, pb: 1.5 }}>
        {actionButtons}
      </Box>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={t("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}

/** Live page: navy panel with the stars and the big score, the counts underneath. */
function ScorePanel() {
  const t = useTranslations("VarianteF");
  const { agency, reviews } = useCertificate();
  const summary = useMemo(() => summarize(reviews), [reviews]);
  const controle = useMemo(() => reviews.filter((review) => review.status === "controle").length, [reviews]);
  const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
  const [whole, decimal] = visible ? displayScore(summary.average!).toFixed(1).split(".") : ["", ""];
  return (
    <Box sx={{ bgcolor: tokens.marine, color: tokens.blanc, px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 4 }, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, textAlign: "center" }}>
      {visible && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }} role="img" aria-label={t("scoreAria", { score: formatScore(summary.average!) })}>
          <Rating value={displayScore(summary.average!)} precision={0.1} readOnly sx={{ fontSize: { xs: 30, md: 36 }, "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.35)" } }} />
          <Typography component="span" aria-hidden sx={{ fontFamily: poppins, fontWeight: 500, fontSize: { xs: 44, md: 52 }, lineHeight: 1 }}>
            {whole}
            <Box component="span" sx={{ fontSize: "0.45em" }}>,{decimal}</Box>
          </Typography>
        </Box>
      )}
      <Typography sx={{ fontSize: 14, color: "#ecf3fb", lineHeight: 1.45, maxWidth: 340 }}>
        {t("scoreText", { total: formatCount(summary.count), controle: formatCount(controle) })}
      </Typography>
      <Link
        href="#synthese"
        onClick={(event) => {
          const target = document.querySelector('[aria-labelledby="reputation-heading"]');
          if (!target) return;
          event.preventDefault();
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
        }}
        sx={{ fontSize: 13, color: tokens.bleuClair, textDecorationColor: "currentColor", textUnderlineOffset: "3px" }}
      >
        {t("scoreDetails")}
      </Link>
    </Box>
  );
}
