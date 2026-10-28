"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import ExpandMore from "@mui/icons-material/ExpandMore";
import OpenInNew from "@mui/icons-material/OpenInNew";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import Verified from "@mui/icons-material/Verified";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { getAgency } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency } from "@/data/types";
import { formatCount } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { ScorePill } from "./CollaboratorPickerC";
import { HoursTable, OpenStatusText } from "./Identity";
import { Pill, SectionCard } from "./ui";
import { focusRing, pc } from "./theme";

const MapC = dynamic(() => import("./MapC"), { ssr: false });

function Letter({ index, active }: { index: number; active?: boolean }) {
  return (
    <Box aria-hidden sx={{ width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: active ? pc.indigo : pc.indigoTonal, color: active ? "#fff" : pc.indigoDark, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
      {String.fromCharCode(65 + index)}
    </Box>
  );
}

const linkSx = { color: pc.ink, textUnderlineOffset: "3px", textDecorationColor: pc.outlineStrong, "&:hover": { textDecorationColor: pc.ink }, "&:focus-visible": focusRing } as const;

function AgencyCard({ agency, index, summary }: { agency: Agency; index: number; summary: { average: number | null; count: number } }) {
  const t = useTranslations("Agencies");
  const tv = useTranslations("VarianteC");
  const [hoursOpen, setHoursOpen] = useState(false);
  const hoursId = useId();
  const certificateUrl = `/fr-fr/variantes/c/${agency.id}`;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Letter index={index} active />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h3" aria-live="polite" sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>{agency.name} · {agency.city}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
            {isPublic(summary.count, agency.publicThreshold) && summary.average !== null && <ScorePill value={summary.average} />}
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13, fontWeight: 600, color: pc.emeraldText }}>
              <Verified sx={{ fontSize: 16 }} />
              {t("verifiedCount", { count: formatCount(summary.count) })}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: 14 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", minHeight: 36, py: 0.5 }}>
          <PlaceOutlined sx={{ fontSize: 20, color: pc.indigoDark }} />
          <Link href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.address)}`} target="_blank" rel="noopener" aria-label={t("addressMapsLink", { address: agency.address })} sx={{ ...linkSx, fontSize: 14, lineHeight: 1.45 }}>
            {agency.address}
          </Link>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 0.5 }}>
          <ScheduleOutlined sx={{ fontSize: 20, color: pc.indigoDark }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ButtonBase onClick={() => setHoursOpen((value) => !value)} aria-expanded={hoursOpen} aria-controls={hoursId} aria-label={t("toggleHours")} sx={{ width: "100%", justifyContent: "space-between", textAlign: "left", borderRadius: "8px", minHeight: 28, "&.Mui-focusVisible": focusRing, "& [role=status]": { fontSize: 14 } }}>
              <OpenStatusText agency={agency} />
              <ExpandMore sx={{ fontSize: 20, color: pc.muted, transition: "transform 200ms ease", transform: hoursOpen ? "rotate(180deg)" : "none" }} />
            </ButtonBase>
            <Collapse in={hoursOpen}>
              <Box id={hoursId} sx={{ pt: 0.75, ml: -1.5 }}><HoursTable agency={agency} /></Box>
            </Collapse>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minHeight: 36 }}>
          <PhoneOutlined sx={{ fontSize: 20, color: pc.indigoDark }} />
          <Link href={`tel:${agency.phone.replace(/\s/g, "")}`} sx={{ ...linkSx, fontSize: 14 }}>{agency.phone}</Link>
        </Box>
      </Box>
      <Pill tone="tonal" href={certificateUrl} target="_blank" rel="noopener" aria-label={t("certificateLink", { name: agency.name, city: agency.city })} endIcon={<OpenInNew sx={{ fontSize: 18 }} />} sx={{ alignSelf: "flex-start" }}>
        {tv("seeCertificate")}
      </Pill>
    </Box>
  );
}

/** Nos Agences: a large map with score pins and the selected agency's card; the other agencies in a list. */
export function Agencies() {
  const t = useTranslations("Agencies");
  const tv = useTranslations("VarianteC");
  const { agency } = useCertificate();
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const [selectedId, setSelectedId] = useState(agency.id);
  const [expanded, setExpanded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const locations = useMemo(() => [agency, ...agency.sisterAgencyIds.map(getAgency).filter((item): item is Agency => Boolean(item))], [agency]);
  const summaries = useMemo(() => new Map(locations.map((location) => [location.id, summarize(reviewsForScore(getAgencyDataset(location).reviews, "controle"))])), [locations]);
  const scores = useMemo(
    () => Object.fromEntries(locations.map((location) => {
      const summary = summaries.get(location.id)!;
      return [location.id, isPublic(summary.count, location.publicThreshold) ? summary.average : null];
    })),
    [locations, summaries],
  );
  const selected = locations.find((location) => location.id === selectedId) ?? agency;
  const selectedIndex = locations.indexOf(selected);

  // The WebGL map sits low on the page: load it only as the visitor approaches it.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMapVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "400px" });
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const card = <AgencyCard key={selected.id} agency={selected} index={selectedIndex} summary={summaries.get(selected.id)!} />;

  return (
    <SectionCard titleId="vc-agencies-title" title={tv("agenciesTitle")} subtitle={t("description", { name: agency.name })}>
      <Box sx={{ position: "relative", mx: { xs: -2, sm: 0 } }}>
        <Box ref={mapRef} role="region" aria-label={t("mapLabel")} sx={{ height: { xs: 300, sm: 360, md: 480 }, borderRadius: { xs: 0, sm: "20px" }, overflow: "hidden", bgcolor: pc.surfaceDim, border: { sm: `1px solid ${pc.outline}` } }}>
          {mapVisible ? (
            <MapC agencies={locations} selectedId={selected.id} onSelect={setSelectedId} scores={scores} padding={desktop ? { left: 380, bottom: 0 } : undefined} />
          ) : (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center", fontSize: 14, color: pc.muted }}>{t("mapLoading")}</Box>
          )}
        </Box>
        {/* Desktop: the place card floats over the map, as in Google Maps. Both copies render, so the server HTML matches. */}
        <Box sx={{ display: { xs: "none", md: "block" }, position: "absolute", left: 16, top: 16, maxHeight: "calc(100% - 32px)", width: 352, overflowY: "auto", p: 2.5, borderRadius: "20px", bgcolor: "#fff", boxShadow: "0 6px 24px rgba(27,31,42,0.16)" }}>{card}</Box>
      </Box>
      <Box sx={{ display: { md: "none" } }}>{card}</Box>

      <Box>
        <Pill tone="outlined" fullWidth aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((value) => !value)} endIcon={<ExpandMore sx={{ transition: "transform 200ms ease", transform: expanded ? "rotate(180deg)" : "none" }} />}>
          {t(expanded ? "showLess" : "showMore")}
        </Pill>
        <Collapse in={expanded} unmountOnExit>
          <Box id={listId} component="ul" sx={{ listStyle: "none", m: 0, p: 0, pt: 1.5, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: 1 }}>
            {locations.map((location, index) => {
              const stats = summaries.get(location.id)!;
              const active = location.id === selected.id;
              return (
                <li key={location.id}>
                  <ButtonBase
                    onClick={() => setSelectedId(location.id)}
                    aria-pressed={active}
                    aria-label={t("selectAgency", { city: location.city })}
                    sx={{ width: "100%", height: "100%", justifyContent: "flex-start", gap: 1.5, p: 1.5, minHeight: 64, borderRadius: "16px", border: `1px solid ${active ? "transparent" : pc.outline}`, bgcolor: active ? pc.indigoSoft : "#fff", textAlign: "left", "&:hover": { bgcolor: active ? pc.indigoSoft : pc.surfaceDim }, "&.Mui-focusVisible": focusRing }}
                  >
                    <Letter index={index} active={active} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{location.city}</Typography>
                      <Typography sx={{ fontSize: 13, color: pc.muted }}>{t("verifiedCount", { count: formatCount(stats.count) })}</Typography>
                    </Box>
                    {scores[location.id] !== null && <ScorePill value={scores[location.id]!} />}
                  </ButtonBase>
                </li>
              );
            })}
          </Box>
        </Collapse>
      </Box>
    </SectionCard>
  );
}
