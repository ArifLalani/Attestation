"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Close from "@mui/icons-material/Close";
import PhotoLibraryOutlined from "@mui/icons-material/PhotoLibraryOutlined";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { focusRing, pc } from "./theme";

/** Desktop Présentation: a Google-style photo mosaic; any photo opens the viewer. */
export function Photos() {
  const t = useTranslations("Agencies.gallery");
  const tv = useTranslations("VarianteC");
  const { agency } = useCertificate();
  const photos = agency.photos;
  const [index, setIndex] = useState<number | null>(null);
  const total = photos.length;
  const step = (delta: number) => setIndex((current) => (current === null ? null : (current + delta + total) % total));

  return (
    <Box component="section" aria-label={t("label", { name: agency.name, city: agency.city })}>
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "150px 150px", gap: 1, borderRadius: "24px", overflow: "hidden" }}>
        {photos.slice(0, 5).map((src, position) => (
          <ButtonBase
            key={src}
            onClick={() => setIndex(position)}
            aria-label={t("open", { index: position + 1, total })}
            sx={{ position: "relative", gridRow: position === 0 ? "1 / span 2" : undefined, overflow: "hidden", bgcolor: pc.outline, "& img": { transition: "transform 400ms ease" }, "&:hover img": { transform: "scale(1.04)" }, "&.Mui-focusVisible": { outline: `3px solid ${pc.indigo}`, outlineOffset: -3 } }}
          >
            <Image src={src} alt={t("photoAlt", { index: position + 1, city: agency.city })} fill sizes={position === 0 ? "480px" : "240px"} style={{ objectFit: "cover" }} />
            {position === 4 && total > 5 && (
              <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(27,31,42,0.45)", color: "#fff", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700 }}>+{total - 5}</Box>
            )}
          </ButtonBase>
        ))}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1, color: pc.muted }}>
        <PhotoLibraryOutlined sx={{ fontSize: 18 }} />
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{tv("photosCount", { count: total })} · {t("source")}</Typography>
      </Box>

      <Dialog open={index !== null} onClose={() => setIndex(null)} fullScreen slotProps={{ paper: { sx: { bgcolor: "rgba(12,14,20,0.96)" } } }} onKeyDown={(event) => {
        if (event.key === "ArrowRight") step(1);
        if (event.key === "ArrowLeft") step(-1);
      }}>
        {index !== null && (
          <Box sx={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2, md: 8 } }}>
            <Box sx={{ position: "relative", width: "100%", height: "100%", maxWidth: 1100 }}>
              <Image src={photos[index]} alt={t("photoAlt", { index: index + 1, city: agency.city })} fill sizes="100vw" style={{ objectFit: "contain" }} />
            </Box>
            <Typography aria-live="polite" sx={{ position: "absolute", top: 20, left: 24, color: "#fff", fontSize: 15, fontWeight: 600 }}>{t("counter", { index: index + 1, total })}</Typography>
            <IconButton onClick={() => setIndex(null)} aria-label={t("close")} sx={{ position: "absolute", top: 12, right: 12, width: 48, height: 48, color: "#fff", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, "&.Mui-focusVisible": focusRing }}><Close /></IconButton>
            <IconButton onClick={() => step(-1)} aria-label={t("previous")} sx={{ position: "absolute", left: 16, width: 52, height: 52, color: "#fff", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><ChevronLeft /></IconButton>
            <IconButton onClick={() => step(1)} aria-label={t("next")} sx={{ position: "absolute", right: 16, width: 52, height: 52, color: "#fff", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><ChevronRight /></IconButton>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
