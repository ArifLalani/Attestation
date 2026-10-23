"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { tokens } from "@/theme/theme";
import { useCertificate } from "./CertificateContext";
import { ContactSheet } from "./ContactSheet";
import { OpenStatus } from "./OpenStatus";

export const cardSx = {
  bgcolor: tokens.blanc,
  borderRadius: "20px",
  boxShadow: tokens.shadowCard,
} as const;

const chipButtonSx = {
  flex: "1 1 0",
  minWidth: 0,
  height: 35,
  p: "7px",
  borderRadius: "8px",
  bgcolor: tokens.grisClair1,
  border: `1px solid ${tokens.grisMoyen1}`,
  color: tokens.bleuFonce,
  fontSize: 14,
  fontWeight: 400,
  lineHeight: "normal",
  "&:hover": { bgcolor: tokens.grisClair2, borderColor: tokens.grisMoyen1 },
} as const;

function directionsUrl(address: string) {
  const destination = encodeURIComponent(address);
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** Figma "Business card" (1353:11257). */
export function BusinessCard() {
  const t = useTranslations("Business");
  const { agency } = useCertificate();
  const [contactOpen, setContactOpen] = useState(false);
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

  return (
    <Box component="article" sx={{ ...cardSx, overflow: "hidden", display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ position: "relative", height: 150, background: "linear-gradient(147.875deg, rgb(143,178,219) 0%, rgb(201,219,240) 71.429%)" }}>
        <Image src={agency.coverPhoto} alt={t("coverAlt", { name: agency.name })} fill priority sizes="(min-width: 640px) 640px, 100vw" style={{ objectFit: "cover" }} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "100px", overflow: "hidden", flexShrink: 0, py: "2px" }}>
            {/* Crop of the logo image as set in Figma ("image 4"). */}
            <Box sx={{ position: "relative", width: 40, height: 36, overflow: "hidden" }}>
              <Box sx={{ position: "absolute", width: "133.24%", height: "145.41%", left: "-14.28%", top: "-22.96%" }}>
                <Image src={agency.logo} alt={t("logoAlt", { name: agency.name })} fill sizes="80px" />
              </Box>
            </Box>
          </Box>
          <Typography component="h1" sx={{ flex: 1, fontSize: 20, fontWeight: 700, lineHeight: "20px", color: tokens.bleuFonce }}>
            {agency.name}
          </Typography>
          <IconButton onClick={share} aria-label={t("share")} sx={{ p: 1, borderRadius: "8px" }}>
            <FigmaIcon name="share" />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 0.5 }}>
          {/* Status sits right of the sector as in Figma; longer "Fermé · Ouvre lundi à 9 h" wraps under it on narrow phones. */}
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1, rowGap: 1, minHeight: 21 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: "1 0 auto" }}>
              <FigmaIcon name="buildings" />
              <Typography sx={{ fontSize: 14, color: tokens.gris, lineHeight: "normal", whiteSpace: "nowrap" }}>{agency.sector}</Typography>
            </Box>
            <OpenStatus hours={agency.hours} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minHeight: 21 }}>
            <FigmaIcon name="map-pin" />
            <Typography component="address" sx={{ fontSize: 14, fontStyle: "normal", color: tokens.gris, lineHeight: "normal" }}>
              {agency.address}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, px: 1.5, pb: 1.5 }}>
        <Button sx={chipButtonSx} onClick={() => setContactOpen(true)}>
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
      </Box>

      <ContactSheet agency={agency} open={contactOpen} onClose={() => setContactOpen(false)} />
      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={t("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
