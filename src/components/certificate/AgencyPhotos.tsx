"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Close from "@mui/icons-material/Close";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Agency } from "@/data/types";
import { tokens } from "@/theme/theme";

const navButtonSx = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  bgcolor: "rgba(255, 255, 255, 0.9)",
  color: tokens.bleuFonce,
  "&:hover": { bgcolor: tokens.blanc },
} as const;

/** Full-screen viewer: arrows, keyboard and a "Photos Google" label. */
function PhotoGallery({ agency, index, onIndex, onClose }: { agency: Agency; index: number | null; onIndex: (index: number) => void; onClose: () => void }) {
  const t = useTranslations("Agencies.gallery");
  const total = agency.photos.length;
  const current = index ?? 0;
  const go = (step: number) => onIndex((current + step + total) % total);

  return (
    <Dialog
      open={index !== null}
      onClose={onClose}
      maxWidth={false}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(4, 27, 68, 0.96)" } },
        paper: { "aria-label": t("label", { name: agency.name, city: agency.city }), sx: { bgcolor: "transparent", boxShadow: "none", m: { xs: 1, md: 4 }, width: "min(1100px, 100%)", overflow: "visible" } },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: tokens.blanc, mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {agency.name} · {agency.city}
          </Typography>
          <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
            {t("source")} · {t("counter", { index: current + 1, total })}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label={t("close")} sx={{ color: tokens.blanc }}>
          <Close />
        </IconButton>
      </Box>
      <Box sx={{ position: "relative", height: { xs: "60vh", md: "72vh" }, borderRadius: "12px", overflow: "hidden", bgcolor: "rgba(255, 255, 255, 0.04)" }}>
        <Image key={agency.photos[current]} src={agency.photos[current]} alt={t("photoAlt", { index: current + 1, city: agency.city })} fill sizes="(min-width: 1100px) 1100px, 100vw" style={{ objectFit: "contain" }} />
        <IconButton onClick={() => go(-1)} aria-label={t("previous")} sx={{ ...navButtonSx, left: 12 }}>
          <ChevronLeft />
        </IconButton>
        <IconButton onClick={() => go(1)} aria-label={t("next")} sx={{ ...navButtonSx, right: 12 }}>
          <ChevronRight />
        </IconButton>
      </Box>
    </Dialog>
  );
}

/** Figma "Images" (1463:21163): a sideways strip of the agency's Google photos; a click opens the gallery. */
export function AgencyPhotos({ agency }: { agency: Agency }) {
  const t = useTranslations("Agencies.gallery");
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <Box
        component="ul"
        aria-label={t("label", { name: agency.name, city: agency.city })}
        sx={{ listStyle: "none", m: 0, p: 0, display: "flex", gap: 1, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
      >
        {agency.photos.map((photo, index) => (
          <Box component="li" key={photo} sx={{ flexShrink: 0, scrollSnapAlign: "start" }}>
            <ButtonBase
              onClick={() => setOpen(index)}
              aria-label={t("open", { index: index + 1, total: agency.photos.length })}
              sx={{ position: "relative", display: "block", width: 130, height: 108, borderRadius: "8px", overflow: "hidden", "&:hover img": { transform: "scale(1.04)" } }}
            >
              <Image src={photo} alt="" fill sizes="130px" style={{ objectFit: "cover", transition: "transform 200ms ease" }} />
            </ButtonBase>
          </Box>
        ))}
      </Box>
      <PhotoGallery agency={agency} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
