"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import NorthEastRounded from "@mui/icons-material/NorthEastRounded";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { getAgency } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { pageWidthSx } from "./Header";
import { OpenBadge, WeekTable } from "./Hours";
import { Lightbox } from "./Lightbox";
import { googleSearch } from "./share";
import { b } from "./theme";
import { focusSx, HEADER_VAR, Pill, SectionTitle } from "./ui";

const MapB = dynamic(() => import("./MapB"), { ssr: false });

const linkSx = { color: b.ink, fontWeight: 600, textDecorationColor: "currentColor", textUnderlineOffset: "3px", borderRadius: 0.5, "&:focus-visible": { outline: "none", boxShadow: b.focus } } as const;

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}>
      <Box sx={{ width: 24, pt: 0.25, display: "flex", justifyContent: "center", flexShrink: 0, "& svg": { fontSize: 22 } }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: 1.5 }}>{children}</Box>
    </Box>
  );
}

/** Nos Agences: a light map with label pins, the selected agency's details, then the others as photo cards. */
export function Agencies() {
  const t = useTranslations("Agencies");
  const tb = useTranslations("VarianteB.agencies");
  const { agency } = useCertificate();
  const [selectedId, setSelectedId] = useState(agency.id);
  const [expanded, setExpanded] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const mapBox = useRef<HTMLDivElement>(null);
  const listId = useId();
  const hoursId = useId();
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
  const index = locations.indexOf(selected);
  const summary = summaries.get(selected.id)!;
  const certificateUrl = `/fr-fr/variantes/b/${selected.id}`;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMapVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    if (mapBox.current) observer.observe(mapBox.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box component="section" id="nos-agences" aria-labelledby="b-agencies-title" sx={{ ...pageWidthSx, scrollMarginTop: `calc(${HEADER_VAR} + 16px)`, display: "flex", flexDirection: "column", gap: 3 }}>
      <SectionTitle id="b-agencies-title" subtitle={t("description", { name: agency.name })}>{t("heading")}</SectionTitle>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.35fr) minmax(0, 1fr)" }, gap: { xs: 2, md: 3 }, alignItems: "start" }}>
        <Box ref={mapBox} role="region" aria-label={t("mapLabel")} sx={{ height: { xs: 280, md: 480 }, borderRadius: "24px", overflow: "hidden", bgcolor: b.sand, boxShadow: b.shadow, position: { md: "sticky" }, top: { md: `calc(${HEADER_VAR} + 24px)` } }}>
          {mapVisible ? (
            <MapB agencies={locations} scores={scores} selectedId={selected.id} onSelect={setSelectedId} />
          ) : (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: b.muted, fontSize: 15 }}>{t("mapLoading")}</Box>
          )}
        </Box>

        <Box sx={{ bgcolor: b.white, borderRadius: "24px", boxShadow: b.shadow, p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box aria-hidden sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: b.ink, color: b.white, display: "grid", placeItems: "center", fontWeight: 700, flexShrink: 0 }}>
              {String.fromCharCode(65 + index)}
            </Box>
            <Typography component="h3" aria-live="polite" sx={{ fontFamily: b.serif, fontWeight: 600, fontSize: 22, lineHeight: 1.2, minWidth: 0 }}>
              <Link href={certificateUrl} target="_blank" rel="noopener" aria-label={t("certificateLink", { name: selected.name, city: selected.city })} sx={{ ...linkSx, display: "inline-flex", alignItems: "center", gap: 0.75, fontWeight: 600 }}>
                {selected.name} · {selected.city}
                <NorthEastRounded sx={{ fontSize: 18 }} />
              </Link>
            </Typography>
          </Box>

          <Box component="ul" aria-label={t("gallery.label", { name: selected.name, city: selected.city })} sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 0.75 }}>
            {selected.photos.slice(0, 4).map((src, i) => (
              <li key={src}>
                <ButtonBase
                  onClick={() => setPhoto(i)}
                  aria-label={t("gallery.open", { index: i + 1, total: selected.photos.length })}
                  sx={{ position: "relative", display: "block", width: "100%", aspectRatio: "1", borderRadius: "14px", overflow: "hidden", "& img": { transition: "transform 400ms ease" }, "&:hover img": { transform: "scale(1.06)" }, ...focusSx }}
                >
                  <Image src={src} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
                  {i === 3 && selected.photos.length > 4 && (
                    <Box aria-hidden sx={{ position: "absolute", inset: 0, bgcolor: "rgba(34,34,34,0.5)", color: b.white, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16 }}>
                      +{selected.photos.length - 4}
                    </Box>
                  )}
                </ButtonBase>
              </li>
            ))}
          </Box>

          <InfoRow icon={<LocationOnOutlined />}>
            <Box component="address" sx={{ fontStyle: "normal" }}>
              <Link href={googleSearch(selected.address)} target="_blank" rel="noopener" aria-label={t("addressMapsLink", { address: selected.address })} sx={linkSx}>
                {selected.address}
              </Link>
            </Box>
          </InfoRow>
          <InfoRow icon={<ScheduleRounded />}>
            <ButtonBase onClick={() => setHoursOpen((value) => !value)} aria-expanded={hoursOpen} aria-controls={hoursId} aria-label={t("toggleHours")} sx={{ gap: 0.5, minHeight: 28, borderRadius: 1, ...focusSx }}>
              <OpenBadge key={selected.id} hours={selected.hours} size={15} />
              <KeyboardArrowDownRounded sx={{ fontSize: 20, transform: hoursOpen ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
            </ButtonBase>
            <Collapse in={hoursOpen}>
              <Box sx={{ mt: 1, p: 1.5, borderRadius: "16px", bgcolor: b.ivory }}>
                <WeekTable hours={selected.hours} id={hoursId} />
              </Box>
            </Collapse>
          </InfoRow>
          <InfoRow icon={<PhoneOutlined />}>
            <Link href={`tel:${selected.phone.replace(/\s/g, "")}`} sx={linkSx}>{selected.phone}</Link>
          </InfoRow>
          <InfoRow icon={<VerifiedOutlined />}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
              {scores[selected.id] != null && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, px: 1, py: 0.25, borderRadius: 999, bgcolor: b.sageTint, color: b.sageText, fontWeight: 700, fontSize: 14 }}>
                  <StarRounded sx={{ fontSize: "16px !important" }} />
                  {formatScore(scores[selected.id]!)}
                </Box>
              )}
              <Link href={certificateUrl} target="_blank" rel="noopener" aria-label={t("reviewsLink", { count: formatCount(summary.count), city: selected.city })} sx={linkSx}>
                {t("verifiedCount", { count: formatCount(summary.count) })}
              </Link>
            </Box>
          </InfoRow>
          <Pill variant="outline" fullWidth onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls={listId} endIcon={<KeyboardArrowDownRounded sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />}>
            {t(expanded ? "showLess" : "showMore")}
          </Pill>
        </Box>
      </Box>

      <Collapse in={expanded} unmountOnExit sx={{ mt: -3 }}>
        <Box id={listId} component="ul" sx={{ listStyle: "none", m: 0, p: 0, pt: 3, display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" }, gap: { xs: 1.5, md: 2 } }}>
          {locations.map((location, i) => {
            const stats = summaries.get(location.id)!;
            const active = location.id === selected.id;
            return (
              <li key={location.id}>
                <ButtonBase
                  onClick={() => setSelectedId(location.id)}
                  aria-pressed={active}
                  aria-label={t("selectAgency", { city: location.city })}
                  sx={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "stretch", gap: 1, textAlign: "left", borderRadius: "20px", "& .b-photo img": { transition: "transform 400ms ease" }, "&:hover .b-photo img": { transform: "scale(1.05)" }, ...focusSx }}
                >
                  <Box className="b-photo" sx={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "20px", overflow: "hidden", boxShadow: active ? `0 0 0 3px ${b.ink}` : "none", transition: "box-shadow 200ms ease" }}>
                    <Image src={location.photos[0]} alt="" fill sizes="(min-width: 900px) 220px, 45vw" style={{ objectFit: "cover" }} />
                    <Box aria-hidden sx={{ position: "absolute", left: 10, top: 10, width: 28, height: 28, borderRadius: "50%", bgcolor: active ? b.ink : b.white, color: active ? b.white : b.ink, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                      {String.fromCharCode(65 + i)}
                    </Box>
                  </Box>
                  <Box sx={{ px: 0.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{location.city}</Typography>
                      {scores[location.id] != null && (
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, fontSize: 14, fontWeight: 600 }}>
                          <StarRounded sx={{ fontSize: 15 }} />
                          {formatScore(scores[location.id]!)}
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 13, color: b.muted }}>{t("verifiedCount", { count: formatCount(stats.count) })}</Typography>
                    {active && <Typography sx={{ fontSize: 13, fontWeight: 700, color: b.accent }}>{tb("selected")}</Typography>}
                  </Box>
                </ButtonBase>
              </li>
            );
          })}
        </Box>
      </Collapse>

      <Lightbox photos={selected.photos} index={photo} onIndex={setPhoto} onClose={() => setPhoto(null)} title={`${selected.name} · ${selected.city}`} cityLabel={selected.city} />
    </Box>
  );
}
