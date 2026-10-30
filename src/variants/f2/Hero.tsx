"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import DirectionsRounded from "@mui/icons-material/DirectionsRounded";
import GridViewRounded from "@mui/icons-material/GridViewRounded";
import IosShareRounded from "@mui/icons-material/IosShareRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { formatCount, formatScore } from "@/lib/format";
import { pageWidthSx } from "./Header";
import { Lightbox } from "./Lightbox";
import { directionsUrl, googleDirections, useShare } from "./share";
import { b } from "./theme";
import { focusSx, Pill, TextLink } from "./ui";
import { useScore } from "./useScore";

const tileSx = {
  position: "relative",
  display: "block",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  "& img": { transition: "transform 500ms cubic-bezier(0.2, 0, 0, 1)" },
  "&::after": { content: '""', position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0)", transition: "background-color 200ms ease" },
  "&:hover img": { transform: "scale(1.04)" },
  "&:hover::after": { bgcolor: "rgba(0,0,0,0.12)" },
  "@media (prefers-reduced-motion: reduce)": { "& img": { transition: "none" }, "&:hover img": { transform: "none" } },
  ...focusSx,
  "&.Mui-focusVisible": { outline: `3px solid ${b.ink}`, outlineOffset: -3 },
} as const;

/** Phones and tablets: a swipeable carousel with a counter. */
function Carousel({ photos, onOpen, overlay }: { photos: string[]; onOpen: (index: number) => void; overlay: React.ReactNode }) {
  const t = useTranslations("Agencies.gallery");
  const { agency } = useCertificate();
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const scrollTo = (next: number) => {
    const box = track.current;
    if (box) box.scrollTo({ left: next * box.clientWidth, behavior: "smooth" });
  };

  return (
    <Box sx={{ position: "relative", display: { md: "none" }, mx: { xs: 0, sm: 3 }, mt: { sm: 2 }, borderRadius: { sm: "24px" }, overflow: "hidden" }}>
      <Box
        component="ul"
        ref={track}
        aria-label={t("label", { name: agency.name, city: agency.city })}
        onScroll={(event) => {
          const box = event.currentTarget;
          setIndex(Math.round(box.scrollLeft / box.clientWidth));
        }}
        sx={{ listStyle: "none", m: 0, p: 0, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, height: { xs: 300, sm: 400 } }}
      >
        {photos.map((photo, i) => (
          <Box component="li" key={photo} sx={{ flex: "0 0 100%", scrollSnapAlign: "start", position: "relative" }}>
            <ButtonBase onClick={() => onOpen(i)} aria-label={t("open", { index: i + 1, total: photos.length })} sx={tileSx}>
              <Image src={photo} alt="" fill priority={i === 0} sizes="(min-width: 600px) 720px, 100vw" style={{ objectFit: "cover" }} />
            </ButtonBase>
          </Box>
        ))}
      </Box>
      {overlay}
      <Box aria-hidden sx={{ position: "absolute", right: 16, bottom: 36, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: "rgba(34,34,34,0.7)", color: b.white, fontSize: 13, fontWeight: 600 }}>
        {t("counter", { index: index + 1, total: photos.length })}
      </Box>
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        {index > 0 && (
          <IconButton onClick={() => scrollTo(index - 1)} aria-label={t("previous")} sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", bgcolor: "rgba(255,255,255,0.92)", "&:hover": { bgcolor: b.white }, ...focusSx }}>
            <ChevronLeftRounded />
          </IconButton>
        )}
        {index < photos.length - 1 && (
          <IconButton onClick={() => scrollTo(index + 1)} aria-label={t("next")} sx={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", bgcolor: "rgba(255,255,255,0.92)", "&:hover": { bgcolor: b.white }, ...focusSx }}>
            <ChevronRightRounded />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

/** Desktop: one large photo and four small ones, like an Airbnb listing. */
function Mosaic({ photos, onOpen }: { photos: string[]; onOpen: (index: number) => void }) {
  const t = useTranslations("Agencies.gallery");
  const tb = useTranslations("VarianteB.hero");
  const { agency } = useCertificate();
  return (
    <Box sx={{ position: "relative", display: { xs: "none", md: "grid" }, gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1, height: { md: 380, lg: 440 }, mt: 3, borderRadius: "24px", overflow: "hidden" }}>
      {photos.slice(0, 5).map((photo, i) => (
        <Box key={photo} sx={{ gridRow: i === 0 ? "1 / span 2" : undefined, minWidth: 0 }}>
          <ButtonBase onClick={() => onOpen(i)} aria-label={t("open", { index: i + 1, total: photos.length })} sx={tileSx}>
            <Image src={photo} alt={i === 0 ? t("photoAlt", { index: 1, city: agency.city }) : ""} fill priority={i === 0} sizes={i === 0 ? "560px" : "280px"} style={{ objectFit: "cover" }} />
          </ButtonBase>
        </Box>
      ))}
      <Pill variant="outline" small startIcon={<GridViewRounded />} onClick={() => onOpen(0)} sx={{ position: "absolute", right: 20, bottom: 20, boxShadow: `inset 0 0 0 1px ${b.ink}, 0 2px 8px rgba(0,0,0,0.15)` }}>
        {tb("showAll", { count: photos.length })}
      </Pill>
    </Box>
  );
}

export function Hero() {
  const t = useTranslations("Business");
  const tb = useTranslations("VarianteB");
  const { agency, goToSection, setPanel } = useCertificate();
  const { summary, visible, controle } = useScore();
  const { share, toast } = useShare(agency);
  const [open, setOpen] = useState<number | null>(null);
  const photos = [agency.coverPhoto, ...agency.photos];

  const ratingLine = visible && (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <StarRounded sx={{ fontSize: 18, color: controle ? b.sage : b.ink }} />
      <Box component="span" sx={{ fontWeight: 700 }}>{formatScore(summary.average!)}</Box>
      <Box component="span" aria-hidden>·</Box>
      <Link component="button" onClick={() => goToSection("avis")} sx={{ font: "inherit", fontWeight: 600, color: b.ink, textDecorationColor: "currentColor", textUnderlineOffset: "3px", verticalAlign: "baseline", borderRadius: 0.5, "&:focus-visible": { boxShadow: b.focus, outline: "none" } }}>
        {tb("bar.count", { count: formatCount(summary.count) })}
      </Link>
    </Box>
  );
  const goToMap = (event: React.MouseEvent) => {
    const target = document.getElementById("nos-agences");
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const overlay = (
    <>
      <Box sx={{ position: "absolute", left: 16, top: 16, display: "flex", alignItems: "center", gap: 0.75, pl: 0.75, pr: 1.5, py: 0.5, borderRadius: 999, bgcolor: "rgba(20, 16, 12, 0.55)", backdropFilter: "blur(8px)", color: b.white, fontSize: 13, fontWeight: 600 }}>
        <Image src="/figma/os-icon-logo.svg" alt="" width={20} height={20} unoptimized />
        {tb("hero.verifiedPill")}
      </Box>
      <IconButton onClick={share} aria-label={t("share")} sx={{ position: "absolute", right: 16, top: 12, width: 44, height: 44, bgcolor: "rgba(255,255,255,0.94)", color: b.ink, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", "&:hover": { bgcolor: b.white }, ...focusSx }}>
        <IosShareRounded sx={{ fontSize: 20 }} />
      </IconButton>
    </>
  );

  return (
    <Box component="section" aria-labelledby="b-agency-name">
      <Carousel photos={photos} onOpen={setOpen} overlay={overlay} />

      {/* Phones: the title sits on a rounded sheet that overlaps the photos. */}
      <Box sx={{ position: "relative", mt: { xs: -3, sm: 0 }, bgcolor: b.ivory, borderRadius: { xs: "24px 24px 0 0", sm: 0 } }}>
        <Box sx={{ ...pageWidthSx, pt: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: { xs: "center", md: "flex-end" }, justifyContent: "space-between", flexDirection: { xs: "column", md: "row" }, gap: { xs: 1, md: 3 }, textAlign: { xs: "center", md: "left" } }}>
            <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", alignItems: { xs: "center", md: "flex-start" }, gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ position: "relative", width: 44, height: 44, borderRadius: "14px", overflow: "hidden", bgcolor: b.white, boxShadow: b.shadow, flexShrink: 0 }}>
                  <Box sx={{ position: "absolute", width: "133%", height: "145%", left: "-14%", top: "-23%" }}>
                    <Image src={agency.logo} alt={t("logoAlt", { name: agency.name })} fill sizes="88px" />
                  </Box>
                </Box>
                <Typography id="b-agency-name" component="h1" sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: { xs: 30, md: 38 }, lineHeight: 1.05, letterSpacing: "-0.015em" }}>
                  {agency.name}
                </Typography>
              </Box>
              <Typography sx={{ display: "flex", flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" }, alignItems: "center", columnGap: 1, rowGap: 0.5, fontSize: 15, color: b.ink }}>
                {ratingLine}
                {visible && <Box component="span" aria-hidden sx={{ display: { xs: "none", sm: "inline" } }}>·</Box>}
                <Box component="span" sx={{ width: { xs: "100%", sm: "auto" } }}>
                  {agency.sector} · {agency.city}
                </Box>
                <Box component="span" aria-hidden sx={{ display: { xs: "none", md: "inline" } }}>·</Box>
                <Link href="#nos-agences" onClick={goToMap} aria-label={t("addressLink", { address: agency.address })} sx={{ display: { xs: "none", md: "inline" }, color: b.muted, textDecorationColor: "currentColor", textUnderlineOffset: "3px" }}>
                  {agency.address}
                </Link>
              </Typography>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, flexShrink: 0 }}>
              <TextLink onClick={share}>
                <IosShareRounded sx={{ fontSize: 18 }} />
                {t("share")}
              </TextLink>
            </Box>
          </Box>

          <Mosaic photos={photos} onOpen={setOpen} />

          {/* Phones: the agency's quick actions under the title; Contacter is in the bar at the bottom. */}
          <Box sx={{ display: { xs: "grid", md: "none" }, gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, mt: 2.5 }}>
            <Pill variant="outline" small onClick={() => setPanel("contact")} sx={{ px: 1 }} aria-haspopup="dialog">
              {t("contact")}
            </Pill>
            <Pill variant="outline" small href={agency.website} target="_blank" rel="noopener noreferrer" startIcon={<LanguageRounded />} sx={{ px: 1 }}>
              {t("website")}
            </Pill>
            <Pill
              variant="outline"
              small
              href={googleDirections(agency.address)}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DirectionsRounded />}
              sx={{ px: 1 }}
              onClick={(event) => event.currentTarget.setAttribute("href", directionsUrl(agency.address))}
            >
              {t("directions")}
            </Pill>
          </Box>
        </Box>
      </Box>

      <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} title={`${agency.name} · ${agency.city}`} cityLabel={agency.city} />
      {toast}
    </Box>
  );
}
