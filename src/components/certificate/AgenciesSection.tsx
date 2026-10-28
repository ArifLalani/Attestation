"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import OpenInNew from "@mui/icons-material/OpenInNew";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CtaButton } from "@/components/ui/CtaButton";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { RatingChip } from "@/components/ui/RatingChip";
import { getAgency } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency } from "@/data/types";
import { formatCount } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { localClock } from "@/lib/hours";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { AgencyPhotos } from "./AgencyPhotos";
import { useCertificate } from "./CertificateContext";
import { OpenStatus } from "./OpenStatus";
import { CardTitle } from "./ReputationCard";

const AgencyMap = dynamic(() => import("./AgencyMap"), { ssr: false });
const colors = ["#e84236", tokens.bleu600, "#6871b5", "#197c70", "#a55924"];

function AgencyLetter({ index }: { index: number }) {
  return <Box aria-hidden sx={{ width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: colors[index % colors.length], color: tokens.blanc, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + index)}</Box>;
}

function OpeningHours({ agency }: { agency: Agency }) {
  const t = useTranslations("Agencies");
  const th = useTranslations("Hours");
  // Collapsed to one line, as in the Figma; the arrow shows the week.
  const [expanded, setExpanded] = useState(false);
  const hoursId = useId();
  const now = useNow();
  const today = now ? localClock(now).weekday : -1;
  return (
    <Box>
      <ButtonBase onClick={() => setExpanded((value) => !value)} aria-label={t("toggleHours")} aria-expanded={expanded} aria-controls={hoursId}
        sx={{ display: "flex", gap: 2, width: "100%", justifyContent: "flex-start", textAlign: "left", py: 0.5, borderRadius: 1 }}>
        <Box sx={{ p: 0.5, display: "flex" }}><FigmaIcon name="agency-clock" /></Box>
        <Box sx={{ flex: "0 1 auto", minWidth: 0, "& p": { whiteSpace: "normal" } }}><OpenStatus hours={agency.hours} /></Box>
        <Box sx={{ transform: expanded ? "none" : "rotate(180deg)", display: "flex", ml: -1 }}><FigmaIcon name="agency-collapse" /></Box>
      </ButtonBase>
      <Collapse in={expanded}>
        <Box id={hoursId} component="dl" sx={{ m: 0, ml: 4, p: 1, bgcolor: tokens.grisClair1, borderRadius: "12px" }}>
          {agency.hours.map((ranges, day) => <Box key={day} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 0.75, fontSize: 14, fontWeight: day === today ? 700 : 500 }}>
            <Box component="dt" sx={{ flexShrink: 0 }}>{th(`daysTitle.${day}`)}</Box>
            <Box component="dd" sx={{ m: 0, textAlign: "right" }}>{ranges.length ? ranges.map(([start, end]) => <Box key={start}>{start} – {end}</Box>) : th("closed")}</Box>
          </Box>)}
        </Box>
      </Collapse>
    </Box>
  );
}

/** Figma Nos Agences (1395:114887), with live pins and the agreed other-agencies list. */
export function AgenciesSection() {
  const t = useTranslations("Agencies");
  const { agency } = useCertificate();
  const [selectedId, setSelectedId] = useState(agency.id);
  const [expanded, setExpanded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const listId = useId();
  const locations = useMemo(() => [agency, ...agency.sisterAgencyIds.map(getAgency).filter((item): item is Agency => Boolean(item))], [agency]);
  const summaries = useMemo(() => new Map(locations.map((location) => [location.id, summarize(reviewsForScore(getAgencyDataset(location).reviews, "controle"))])), [locations]);
  const selected = locations.find((location) => location.id === selectedId) ?? agency;
  const selectedIndex = locations.indexOf(selected);
  const summary = summaries.get(selected.id)!;
  const certificateUrl = `/fr-fr/certificate/${selected.id}`;

  // The WebGL map is below the reviews; load it only as the visitor approaches it.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setMapVisible(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    if (mapContainer.current) observer.observe(mapContainer.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box component="section" id="nos-agences" aria-labelledby="agencies-title" sx={{ scrollMarginTop: `${tokens.headerHeight + 16}px`, bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCard, px: { xs: 1.5, md: 2 }, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <CardTitle id="agencies-title" eyebrow={t("eyebrow")} heading={t("heading")} />
      <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("description", { name: agency.name })}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, columnGap: 4, rowGap: 2, alignItems: "stretch" }}>
      <Box ref={mapContainer} role="region" aria-label={t("mapLabel")} sx={{ height: { xs: 215, md: 400 }, width: "100%", alignSelf: "start", borderRadius: "12px", overflow: "hidden", bgcolor: tokens.grisClair2, position: { md: "sticky" }, top: { md: tokens.headerHeight + 16 } }}>
        {mapVisible ? <AgencyMap agencies={locations} selectedId={selected.id} onSelect={setSelectedId} /> : <Box sx={{ height: "100%", display: "grid", placeItems: "center", fontSize: 14, color: tokens.gris }}>{t("mapLoading")}</Box>}
      </Box>
      {/* Figma "Company Information" (1463:21156): name, photos, details, then the other agencies. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 0.25 }}>
          <AgencyLetter index={selectedIndex} />
          <Typography component="h3" aria-live="polite" sx={{ fontSize: 16, fontWeight: 600, minWidth: 0 }}>
            <Link
              href={certificateUrl}
              target="_blank"
              rel="noopener"
              aria-label={t("certificateLink", { name: selected.name, city: selected.city })}
              sx={{ display: "inline-flex", alignItems: "center", gap: 2, color: tokens.bleuFonce, textDecorationColor: "currentColor", textUnderlineOffset: "3px" }}
            >
              <Box component="span" sx={{ textDecoration: "underline", textDecorationColor: "inherit" }}>{selected.name} · {selected.city}</Box>
              <OpenInNew sx={{ fontSize: 20 }} />
            </Link>
          </Typography>
        </Box>

        <AgencyPhotos key={selected.id} agency={selected} />

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ p: 0.5, display: "flex" }}><FigmaIcon name="agency-pin" /></Box>
          <Typography component="address" sx={{ fontSize: 14, fontWeight: 600, fontStyle: "normal", flex: 1, pt: "4px" }}>
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`}
              target="_blank"
              rel="noopener"
              aria-label={t("addressMapsLink", { address: selected.address })}
              sx={{ color: tokens.bleuFonce, textDecorationColor: "currentColor", textUnderlineOffset: "3px" }}
            >
              {selected.address}
            </Link>
          </Typography>
        </Box>
        <OpeningHours key={`hours-${selected.id}`} agency={selected} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ p: 0.5, display: "flex" }}><FigmaIcon name="agency-star" /></Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            {isPublic(summary.count, selected.publicThreshold) && summary.average !== null && (
              <>
                <RatingChip value={summary.average} />
                <Box component="span" aria-hidden sx={{ fontSize: 14, fontWeight: 600 }}>•</Box>
              </>
            )}
            <Link
              href={certificateUrl}
              target="_blank"
              rel="noopener"
              aria-label={t("reviewsLink", { count: formatCount(summary.count), city: selected.city })}
              sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, textDecorationColor: "currentColor", textUnderlineOffset: "3px" }}
            >
              {t("verifiedCount", { count: formatCount(summary.count) })}
            </Link>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ p: 0.5, display: "flex" }}><FigmaIcon name="agency-phone" /></Box>
          <Link href={`tel:${selected.phone.replace(/\s/g, "")}`} sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, textDecorationColor: "currentColor", textUnderlineOffset: "3px" }}>{selected.phone}</Link>
        </Box>

        <CtaButton variant="secondary" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((value) => !value)} sx={{ mt: { md: "auto" }, "& img": { transform: expanded ? "rotate(180deg)" : "none" } }}>{t(expanded ? "showLess" : "showMore")}</CtaButton>
      </Box>
      </Box>
      {/* The other agencies take the full width under the map and the details (3 per row on desktop).
          mt -2 cancels the section gap, so the space opens with the animation. */}
      <Collapse in={expanded} unmountOnExit sx={{ mt: -2 }}>
        <Box id={listId} component="ul" sx={{ listStyle: "none", m: 0, p: 0, pt: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: 1 }}>
          {locations.map((location, index) => {
            const stats = summaries.get(location.id)!;
            return <Box component="li" key={location.id}>
              <ButtonBase onClick={() => setSelectedId(location.id)} aria-pressed={location.id === selected.id} aria-label={t("selectAgency", { city: location.city })}
                sx={{ display: "flex", gap: 1.5, width: "100%", height: "100%", p: 1.5, borderRadius: "12px", border: `1px solid ${location.id === selected.id ? tokens.bleu400 : tokens.grisMoyen1}`, bgcolor: location.id === selected.id ? tokens.bleu5 : tokens.blanc, textAlign: "left" }}>
                <AgencyLetter index={index} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{location.city}</Typography>
                  <Typography sx={{ fontSize: 12, color: tokens.gris }}>{t("verifiedCount", { count: formatCount(stats.count) })}</Typography>
                </Box>
                {isPublic(stats.count, location.publicThreshold) && stats.average !== null && <RatingChip value={stats.average} />}
              </ButtonBase>
            </Box>;
          })}
        </Box>
      </Collapse>
    </Box>
  );
}
