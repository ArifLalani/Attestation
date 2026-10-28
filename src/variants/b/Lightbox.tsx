"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { b } from "./theme";
import { focusSx } from "./ui";

const roundButtonSx = {
  width: 44,
  height: 44,
  bgcolor: b.white,
  color: b.ink,
  boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
  "&:hover": { bgcolor: b.white, transform: "scale(1.06)" },
  transition: "transform 150ms ease",
  ...focusSx,
} as const;

/** Full-screen photo viewer: arrows, keyboard, and a strip of thumbnails. */
export function Lightbox({ photos, index, onIndex, onClose, title, cityLabel }: { photos: string[]; index: number | null; onIndex: (index: number) => void; onClose: () => void; title: string; cityLabel: string }) {
  const t = useTranslations("Agencies.gallery");
  const current = index ?? 0;
  const total = photos.length;
  const go = (step: number) => onIndex((current + step + total) % total);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    strip.current?.querySelector<HTMLElement>(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [current]);

  return (
    <Dialog
      open={index !== null}
      onClose={onClose}
      fullScreen
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
      slotProps={{ paper: { "aria-label": title, sx: { bgcolor: "#171310", color: b.white, fontFamily: b.sans } } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: { xs: 1.5, md: 3 }, py: 1.5 }}>
        <IconButton onClick={onClose} aria-label={t("close")} sx={{ ...roundButtonSx, bgcolor: "rgba(255,255,255,0.12)", color: b.white, boxShadow: "none", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}>
          <CloseRounded />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{title}</Typography>
          <Typography sx={{ fontSize: 13, opacity: 0.75 }}>
            {t("source")} · {t("counter", { index: current + 1, total })}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ position: "relative", flex: 1, minHeight: 0, mx: { xs: 0, md: 10 } }}>
        <Image key={photos[current]} src={photos[current]} alt={t("photoAlt", { index: current + 1, city: cityLabel })} fill sizes="100vw" style={{ objectFit: "contain" }} />
        <IconButton onClick={() => go(-1)} aria-label={t("previous")} sx={{ ...roundButtonSx, position: "absolute", top: "50%", left: { xs: 8, md: -64 }, transform: "translateY(-50%)", "&:hover": { bgcolor: b.white } }}>
          <ChevronLeftRounded />
        </IconButton>
        <IconButton onClick={() => go(1)} aria-label={t("next")} sx={{ ...roundButtonSx, position: "absolute", top: "50%", right: { xs: 8, md: -64 }, transform: "translateY(-50%)", "&:hover": { bgcolor: b.white } }}>
          <ChevronRightRounded />
        </IconButton>
      </Box>
      <Box ref={strip} sx={{ display: "flex", gap: 1, justifyContent: { md: "center" }, overflowX: "auto", px: 2, py: 2, scrollbarWidth: "none" }}>
        {photos.map((photo, i) => (
          <ButtonBase
            key={photo}
            data-index={i}
            onClick={() => onIndex(i)}
            aria-label={t("open", { index: i + 1, total })}
            aria-current={i === current ? "true" : undefined}
            sx={{ position: "relative", flexShrink: 0, width: 72, height: 54, borderRadius: "10px", overflow: "hidden", opacity: i === current ? 1 : 0.55, outline: i === current ? `2px solid ${b.white}` : "none", outlineOffset: 2, transition: "opacity 150ms ease", "&:hover": { opacity: 1 }, ...focusSx }}
          >
            <Image src={photo} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
          </ButtonBase>
        ))}
      </Box>
    </Dialog>
  );
}
