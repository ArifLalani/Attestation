"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Close from "@mui/icons-material/Close";
import ExpandMore from "@mui/icons-material/ExpandMore";
import OpenInNew from "@mui/icons-material/OpenInNew";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import Verified from "@mui/icons-material/Verified";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { agencyColors } from "@/components/certificate/AgencyMap";
import { getAgency } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { localClock } from "@/lib/hours";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { a } from "./theme";
import { OpenStatusA, RatingPill, SectionTitle, StarTiles, cardSx, containerSx, focusRing, outlineSx } from "./ui";

const AgencyMap = dynamic(() => import("@/components/certificate/AgencyMap"), { ssr: false });

function Letter({ index, size = 28 }: { index: number; size?: number }) {
  return (
    <Box aria-hidden sx={{ width: size, height: size, flexShrink: 0, borderRadius: "50%", bgcolor: agencyColors[index % agencyColors.length], color: a.white, display: "grid", placeItems: "center", fontSize: size * 0.46, fontWeight: 800 }}>
      {String.fromCharCode(65 + index)}
    </Box>
  );
}

function Photos({ agency }: { agency: Agency }) {
  const t = useTranslations("Agencies.gallery");
  const [index, setIndex] = useState<number | null>(null);
  const total = agency.photos.length;
  const step = (delta: number) => setIndex((current) => (current === null ? null : (current + delta + total) % total));
  return (
    <>
      <Box role="list" aria-label={t("label", { name: agency.name, city: agency.city })} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 1, height: { xs: 120, md: 132 } }}>
        {agency.photos.slice(0, 3).map((photo, i) => (
          <Box key={photo} role="listitem" sx={{ minWidth: 0 }}>
            <ButtonBase onClick={() => setIndex(i)} aria-label={t("open", { index: i + 1, total })} sx={{ position: "relative", width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden", "& img": { transition: `transform 400ms ${a.ease}` }, "&:hover img": { transform: "scale(1.05)" }, ...focusRing }}>
              <Image src={photo} alt={t("photoAlt", { index: i + 1, city: agency.city })} fill sizes="(min-width: 1200px) 260px, 50vw" style={{ objectFit: "cover" }} />
              {i === 2 && total > 3 && (
                <Box aria-hidden sx={{ position: "absolute", inset: 0, bgcolor: "rgba(4,27,68,0.55)", color: a.white, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800 }}>+{total - 3}</Box>
              )}
            </ButtonBase>
          </Box>
        ))}
      </Box>
      <Dialog open={index !== null} onClose={() => setIndex(null)} maxWidth="md" fullWidth aria-label={t("label", { name: agency.name, city: agency.city })} slotProps={{ paper: { sx: { bgcolor: a.navy, borderRadius: "20px", overflow: "hidden" } }, backdrop: { sx: { bgcolor: "rgba(4,27,68,0.8)" } } }}>
        {index !== null && (
          <Box sx={{ position: "relative", aspectRatio: "3 / 2" }} onKeyDown={(event) => { if (event.key === "ArrowRight") step(1); if (event.key === "ArrowLeft") step(-1); }}>
            <Image src={agency.photos[index]} alt={t("photoAlt", { index: index + 1, city: agency.city })} fill sizes="900px" style={{ objectFit: "cover" }} />
            <IconButton onClick={() => setIndex(null)} aria-label={t("close")} sx={{ position: "absolute", top: 12, right: 12, width: 44, height: 44, bgcolor: "rgba(255,255,255,0.92)", color: a.navy, "&:hover": { bgcolor: a.white } }}><Close /></IconButton>
            <IconButton onClick={() => step(-1)} aria-label={t("previous")} sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, bgcolor: "rgba(255,255,255,0.92)", color: a.navy, "&:hover": { bgcolor: a.white } }}><ChevronLeft /></IconButton>
            <IconButton onClick={() => step(1)} aria-label={t("next")} sx={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, bgcolor: "rgba(255,255,255,0.92)", color: a.navy, "&:hover": { bgcolor: a.white } }}><ChevronRight /></IconButton>
            <Box sx={{ position: "absolute", left: 12, bottom: 12, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: "rgba(4,27,68,0.7)", color: a.white, fontSize: 13, fontWeight: 700 }}>
              {t("counter", { index: index + 1, total })} · {t("source")}
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
}

function Hours({ agency }: { agency: Agency }) {
  const t = useTranslations("Agencies");
  const th = useTranslations("Hours");
  const [open, setOpen] = useState(false);
  const id = useId();
  const now = useNow();
  const today = now ? localClock(now).weekday : -1;
  return (
    <Box>
      <ButtonBase onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={id} aria-label={t("toggleHours")} sx={{ gap: 1.25, minHeight: 40, borderRadius: 1, ...focusRing }}>
        <ScheduleOutlined sx={{ fontSize: 20, color: a.muted }} />
        <OpenStatusA hours={agency.hours} size={15} />
        <ExpandMore sx={{ fontSize: 20, color: a.navy, transform: open ? "rotate(180deg)" : "none", transition: `transform 200ms ${a.ease}` }} />
      </ButtonBase>
      <Collapse in={open}>
        <Box id={id} component="dl" sx={{ m: 0, mt: 1, ml: 4, p: 1.5, borderRadius: "12px", bgcolor: a.band, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 3, rowGap: 0.75, fontSize: 14 }}>
          {agency.hours.map((ranges, day) => (
            <Box key={day} sx={{ display: "contents", "& > *": { fontWeight: day === today ? 800 : 500, color: day === today ? a.navy : a.muted } }}>
              <Box component="dt">{th(`daysTitle.${day}`)}</Box>
              <Box component="dd" sx={{ m: 0, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{ranges.length ? ranges.map(([start, end]) => `${start} – ${end}`).join(" · ") : th("closed")}</Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

const infoRowSx = { display: "flex", alignItems: "flex-start", gap: 1.25, fontSize: 15 } as const;
const infoLinkSx = { color: a.navy, fontWeight: 600, textDecorationColor: a.lineStrong, textUnderlineOffset: "4px", "&:hover": { textDecorationColor: a.navy }, ...focusRing } as const;

/** Nos Agences: the map with lettered pins, the selected agency, then the others (full width). */
export function AgenciesSection() {
  const t = useTranslations("Agencies");
  const tr = useTranslations("Reputation");
  const tv = useTranslations("VarianteA");
  const { agency } = useCertificate();
  const [selectedId, setSelectedId] = useState(agency.id);
  const [expanded, setExpanded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const locations = useMemo(() => [agency, ...agency.sisterAgencyIds.map(getAgency).filter((item): item is Agency => Boolean(item))], [agency]);
  const summaries = useMemo(() => new Map(locations.map((location) => [location.id, summarize(reviewsForScore(getAgencyDataset(location).reviews, "controle"))])), [locations]);
  const selected = locations.find((location) => location.id === selectedId) ?? agency;
  const selectedIndex = locations.indexOf(selected);
  const summary = summaries.get(selected.id)!;
  const certificateUrl = `/fr-fr/variantes/a/${selected.id}`;
  const scored = isPublic(summary.count, selected.publicThreshold) && summary.average !== null;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMapVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box component="section" id="nos-agences" aria-labelledby="a-agencies-title" sx={{ scrollMarginTop: `${a.barHeight + 16}px`, bgcolor: a.band, borderBlock: `1px solid ${a.line}` }}>
      <Box sx={{ ...containerSx, py: { xs: 6, md: 9 } }}>
        <SectionTitle id="a-agencies-title" eyebrow={t("eyebrow")} title={t("heading")} sub={t("description", { name: agency.name })} />
        <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "minmax(0,1.15fr) minmax(0,1fr)" }, gap: { xs: 2, md: 3 }, alignItems: "stretch" }}>
          <Box ref={mapRef} role="region" aria-label={t("mapLabel")} sx={{ minHeight: { xs: 260, md: 480 }, borderRadius: "20px", overflow: "hidden", border: `1px solid ${a.line}`, bgcolor: a.white }}>
            {mapVisible ? <AgencyMap agencies={locations} selectedId={selected.id} onSelect={setSelectedId} /> : <Box sx={{ height: "100%", minHeight: "inherit", display: "grid", placeItems: "center", fontSize: 14, color: a.muted }}>{t("mapLoading")}</Box>}
          </Box>

          <Box sx={{ ...cardSx, borderRadius: "20px", p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Letter index={selectedIndex} size={36} />
              <Typography component="h3" aria-live="polite" sx={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>
                {selected.name} · {selected.city}
              </Typography>
            </Box>
            <Photos key={selected.id} agency={selected} />
            <Box sx={infoRowSx}>
              <PlaceOutlined sx={{ fontSize: 20, color: a.muted, mt: "2px" }} />
              <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`} target="_blank" rel="noopener" aria-label={t("addressMapsLink", { address: selected.address })} sx={infoLinkSx}>
                {selected.address}
              </Link>
            </Box>
            <Hours key={`hours-${selected.id}`} agency={selected} />
            <Box sx={infoRowSx}>
              <PhoneOutlined sx={{ fontSize: 20, color: a.muted, mt: "2px" }} />
              <Link href={`tel:${selected.phone.replace(/\s/g, "")}`} sx={infoLinkSx}>{selected.phone}</Link>
            </Box>
            <Box sx={{ ...infoRowSx, alignItems: "center", flexWrap: "wrap" }}>
              <Verified sx={{ fontSize: 20, color: a.tealText }} />
              {scored && (
                <>
                  <StarTiles value={summary.average!} size={18} color={a.teal} label={tr("scoreAria", { score: formatScore(summary.average!) })} />
                  <Box component="span" sx={{ fontWeight: 800 }}>{formatScore(summary.average!)}</Box>
                </>
              )}
              <Link href={certificateUrl} target="_blank" rel="noopener" aria-label={t("reviewsLink", { count: formatCount(summary.count), city: selected.city })} sx={infoLinkSx}>
                {t("verifiedCount", { count: formatCount(summary.count) })}
              </Link>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button href={certificateUrl} target="_blank" rel="noopener" aria-label={t("certificateLink", { name: selected.name, city: selected.city })} endIcon={<OpenInNew />} sx={{ ...outlineSx, flex: "1 1 auto" }}>
                {tv("agencies.certificate")}
              </Button>
              <Button aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((value) => !value)} endIcon={<ExpandMore sx={{ transform: expanded ? "rotate(180deg)" : "none" }} />} sx={{ ...outlineSx, flex: "1 1 auto" }}>
                {t(expanded ? "showLess" : "showMore")}
              </Button>
            </Box>
          </Box>
        </Box>

        <Collapse in={expanded} unmountOnExit>
          <Box id={listId} component="ul" sx={{ listStyle: "none", m: 0, p: 0, pt: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(2, minmax(0,1fr))", md: "repeat(3, minmax(0,1fr))" }, gap: 1.5 }}>
            {locations.map((location, index) => {
              const stats = summaries.get(location.id)!;
              const current = location.id === selected.id;
              return (
                <Box component="li" key={location.id} sx={{ minWidth: 0 }}>
                  <ButtonBase
                    onClick={() => setSelectedId(location.id)}
                    aria-pressed={current}
                    aria-label={t("selectAgency", { city: location.city })}
                    sx={{ width: "100%", height: "100%", justifyContent: "flex-start", gap: 1.5, p: 2, borderRadius: "14px", border: `1.5px solid ${current ? a.navy : a.line}`, bgcolor: a.white, textAlign: "left", "&:hover": { borderColor: current ? a.navy : a.lineStrong }, ...focusRing }}
                  >
                    <Letter index={index} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{location.city}</Typography>
                      <Typography sx={{ fontSize: 13, color: a.muted }}>{t("verifiedCount", { count: formatCount(stats.count) })}</Typography>
                    </Box>
                    {isPublic(stats.count, location.publicThreshold) && stats.average !== null && <RatingPill value={stats.average} />}
                  </ButtonBase>
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
