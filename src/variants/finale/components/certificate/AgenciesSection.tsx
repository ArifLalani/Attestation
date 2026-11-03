"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import OpenInNew from "@mui/icons-material/OpenInNew";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { RatingChip } from "@/variants/finale/components/ui/RatingChip";
import { getAgency } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency } from "@/data/types";
import { formatCount } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { localClock } from "@/lib/hours";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { OpenStatus } from "./OpenStatus";
import { CardTitle } from "./ReputationCard";

const AgencyMap = dynamic(() => import("./AgencyMap"), { ssr: false });
/** The agency's letter, in the colours of its pin on the map: navy once selected, light blue otherwise. */
function AgencyLetter({ index, active, size = 28 }: { index: number; active?: boolean; size?: number }) {
  return <Box aria-hidden sx={{ width: size, height: size, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: active ? tokens.bleuFonce : tokens.bleu10, color: active ? tokens.blanc : tokens.bleuFonce, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + index)}</Box>;
}

/** The card's links: navy text with a light underline. */
const linkSx = { color: tokens.bleuFonce, textDecorationColor: "rgba(4, 27, 68, 0.35)", textUnderlineOffset: "3px", "&:hover": { textDecorationColor: "currentColor" } } as const;

/** Sent by the hero's open/closed status: scroll here with this agency's week of hours open. */
export const openHoursEvent = "finale:open-hours";

function OpeningHours({ agency, openRequest }: { agency: Agency; openRequest: number }) {
  const t = useTranslations("Agencies");
  const th = useTranslations("Hours");
  // Collapsed to one line, as in the Figma; the arrow shows the week.
  const [expanded, setExpanded] = useState(false);
  const hoursId = useId();
  // A new request from the hero opens the week (adjusted while rendering rather than in an effect).
  const [seenRequest, setSeenRequest] = useState(openRequest);
  if (openRequest !== seenRequest) {
    setSeenRequest(openRequest);
    if (openRequest) setExpanded(true);
  }
  const now = useNow();
  const today = now ? localClock(now).weekday : -1;
  return (
    <Box>
      <ButtonBase onClick={() => setExpanded((value) => !value)} aria-label={t("toggleHours")} aria-expanded={expanded} aria-controls={hoursId}
        sx={{ display: "flex", gap: 1.5, width: "100%", justifyContent: "flex-start", textAlign: "left", py: 0.25, borderRadius: 1 }}>
        <Box sx={{ p: 0.5, display: "flex" }}><FigmaIcon name="agency-clock" /></Box>
        <Box sx={{ flex: 1, minWidth: 0, "& p": { whiteSpace: "normal" } }}><OpenStatus hours={agency.hours} split /></Box>
        <Box sx={{ transform: expanded ? "none" : "rotate(180deg)", display: "flex" }}><FigmaIcon name="agency-collapse" /></Box>
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

/** Nos Agences: the map from option C (score pins, the card over the map on desktop) with H's agency details and other-agencies list. */
export function AgenciesSection() {
  const t = useTranslations("Agencies");
  const tv = useTranslations("VarianteFinale.agencies");
  const { agency } = useCertificate();
  const [selectedId, setSelectedId] = useState(agency.id);
  const [expanded, setExpanded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [hoursRequest, setHoursRequest] = useState(0);
  const mapContainer = useRef<HTMLDivElement>(null);
  const listId = useId();
  const locations = useMemo(() => [agency, ...agency.sisterAgencyIds.map(getAgency).filter((item): item is Agency => Boolean(item))], [agency]);
  const summaries = useMemo(() => new Map(locations.map((location) => [location.id, summarize(reviewsForScore(getAgencyDataset(location).reviews, "controle"))])), [locations]);
  // The score shown on each pin (hidden under the publication threshold).
  const scores = useMemo(() => Object.fromEntries(locations.map((location) => {
    const stats = summaries.get(location.id)!;
    return [location.id, isPublic(stats.count, location.publicThreshold) ? stats.average : null];
  })), [locations, summaries]);
  const selected = locations.find((location) => location.id === selectedId) ?? agency;
  const selectedIndex = locations.indexOf(selected);
  const summary = summaries.get(selected.id)!;
  const certificateUrl = `/fr-fr/certificate/${selected.id}`;

  const selectAgency = (id: string) => {
    setSelectedId(id);
    setHoursRequest(0);
  };

  useEffect(() => {
    const openHours = () => {
      setSelectedId(agency.id);
      setHoursRequest((value) => value + 1);
    };
    window.addEventListener(openHoursEvent, openHours);
    return () => window.removeEventListener(openHoursEvent, openHours);
  }, [agency.id]);

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
      {/* The map from option C: large, edge to edge on phones. On desktop the agency card floats over its left side, as in Google Maps;
          on phones it sits under the map. One card, placed by CSS, so the server and the browser render the same thing. */}
      <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 2 }}>
      <Box ref={mapContainer} role="region" aria-label={t("mapLabel")} sx={{ height: { xs: 300, sm: 360, md: 480 }, mx: { xs: -1.5, sm: 0 }, borderRadius: { xs: 0, sm: "16px" }, overflow: "hidden", bgcolor: tokens.grisClair2, border: { sm: `1px solid ${tokens.grisMoyen1}` } }}>
        {mapVisible ? <AgencyMap agencies={locations} selectedId={selected.id} onSelect={selectAgency} scores={scores} /> : <Box sx={{ height: "100%", display: "grid", placeItems: "center", fontSize: 14, color: tokens.gris }}>{t("mapLoading")}</Box>}
      </Box>
      {/* The agency card from option C, in H's look: name with its score and controlled reviews, address, hours, phone, Voir son certificat. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0, position: { md: "absolute" }, left: { md: 16 }, top: { md: 16 }, width: { md: 380 }, maxHeight: { md: "calc(100% - 32px)" }, overflowY: { md: "auto" }, overscrollBehavior: { md: "contain" }, p: { md: 2.5 }, borderRadius: { md: "20px" }, bgcolor: { md: tokens.blanc }, boxShadow: { md: "0 6px 24px rgba(4, 27, 68, 0.16)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AgencyLetter index={selectedIndex} active size={32} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="h3" aria-live="polite" sx={{ fontSize: 17, fontWeight: 600, lineHeight: 1.25, color: tokens.bleuFonce }}>{selected.name} · {selected.city}</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mt: 0.5 }}>
              {isPublic(summary.count, selected.publicThreshold) && summary.average !== null && <RatingChip value={summary.average} />}
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13, fontWeight: 600, color: tokens.vertOs }}>
                <VerifiedRounded sx={{ fontSize: 16 }} />
                {t("verifiedCount", { count: formatCount(summary.count) })}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.25 }}>
            <Box sx={{ p: 0.5, display: "flex" }}><FigmaIcon name="agency-pin" /></Box>
            <Typography component="address" sx={{ fontSize: 14, fontStyle: "normal", flex: 1, pt: "4px", lineHeight: 1.45 }}>
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`}
                target="_blank"
                rel="noopener"
                aria-label={t("addressMapsLink", { address: selected.address })}
                sx={linkSx}
              >
                {selected.address}
              </Link>
            </Typography>
          </Box>
          <OpeningHours key={`hours-${selected.id}`} agency={selected} openRequest={hoursRequest} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.25 }}>
            <Box sx={{ p: 0.5, display: "flex" }}><FigmaIcon name="agency-phone" /></Box>
            <Link href={`tel:${selected.phone.replace(/\s/g, "")}`} sx={{ ...linkSx, fontSize: 14 }}>{selected.phone}</Link>
          </Box>
        </Box>

        <ButtonBase
          component="a"
          href={certificateUrl}
          target="_blank"
          rel="noopener"
          aria-label={t("certificateLink", { name: selected.name, city: selected.city })}
          sx={{ alignSelf: "flex-start", height: 45, gap: 1, px: 2.5, borderRadius: "8px", bgcolor: tokens.bleu10, color: tokens.bleuFonce, fontFamily: "inherit", fontSize: 14, fontWeight: 600, "&:hover": { bgcolor: tokens.bleu20 }, "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } }}
        >
          {tv("seeCertificate")}
          <OpenInNew sx={{ fontSize: 18 }} />
        </ButtonBase>
      </Box>
      </Box>
      {/* Desktop: on the right, as wide as its text (like Voir toute l’équipe); full width on phones and tablets. */}
      <CtaButton variant="secondary" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((value) => !value)} sx={{ "& img": { transform: expanded ? "rotate(180deg)" : "none" }, width: { md: "auto" }, minWidth: { md: 180 }, px: { md: 2.5 }, alignSelf: { md: "flex-end" } }}>{t(expanded ? "showLess" : "showMore")}</CtaButton>
      {/* The other agencies take the full width under the map (3 per row on desktop).
          mt -2 cancels the section gap, so the space opens with the animation. */}
      <Collapse in={expanded} unmountOnExit sx={{ mt: -2 }}>
        <Box id={listId} component="ul" sx={{ listStyle: "none", m: 0, p: 0, pt: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: 1 }}>
          {locations.map((location, index) => {
            const stats = summaries.get(location.id)!;
            return <Box component="li" key={location.id}>
              <ButtonBase onClick={() => selectAgency(location.id)} aria-pressed={location.id === selected.id} aria-label={t("selectAgency", { city: location.city })}
                sx={{ display: "flex", gap: 1.5, width: "100%", height: "100%", p: 1.5, borderRadius: "12px", border: `1px solid ${location.id === selected.id ? tokens.bleu400 : tokens.grisMoyen1}`, bgcolor: location.id === selected.id ? tokens.bleu5 : tokens.blanc, textAlign: "left" }}>
                <AgencyLetter index={index} active={location.id === selected.id} />
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
