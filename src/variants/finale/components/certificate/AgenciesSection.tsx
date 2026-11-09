"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import OpenInNew from "@mui/icons-material/OpenInNew";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { RatingChip } from "@/variants/finale/components/ui/RatingChip";
import { getAgency } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { localClock } from "@/lib/hours";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { AgencyPhotos } from "./AgencyPhotos";
import { OpenStatus } from "./OpenStatus";
import { CardTitle } from "./ReputationCard";

const AgencyMap = dynamic(() => import("./AgencyMap"), { ssr: false });
/** The agency's letter, in the colours of its pin on the map: navy once selected, light blue otherwise. */
function AgencyLetter({ index, active, size = 28 }: { index: number; active?: boolean; size?: number }) {
  return <Box aria-hidden sx={{ width: size, height: size, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: active ? tokens.bleuFonce : tokens.bleu10, color: active ? tokens.blanc : tokens.bleuFonce, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + index)}</Box>;
}

/** The outline of H's cards (as on the team cards). */
const cardBorder = "#d6e4f3";

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

/** Nos Agences in option B's layout (map, agency card beside it, the agencies as photo cards) in H's look, with option C's score pins. */
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
    <Box component="section" id="nos-agences" aria-labelledby="agencies-title" sx={{ scrollMarginTop: `${tokens.headerHeight + 16}px`, bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCard, px: { xs: 1.5, md: 2 }, py: { xs: 1.5, md: 2 }, display: "flex", flexDirection: "column", gap: 2 }}>
      <CardTitle id="agencies-title" eyebrow={t("eyebrow")} heading={t("heading")} />
      <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("description", { name: agency.name })}</Typography>
      {/* Option B's layout: the map on the left, the agency card on the right. The two share the row's height,
          so the map grows when the week of hours opens. On phones the card sits under the map. */}
      {/* From 1200 px the two columns match Démarche Qualité below (two equal halves, 32 px apart), so their edges line up. */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.35fr) minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }, columnGap: { xs: 2, lg: 4 }, rowGap: 2, alignItems: "stretch" }}>
        <Box ref={mapContainer} role="region" aria-label={t("mapLabel")} sx={{ height: { xs: 300, sm: 360, md: "auto" }, minHeight: { md: 420 }, borderRadius: { xs: "12px", sm: "16px" }, overflow: "hidden", bgcolor: tokens.grisClair2, border: `1px solid ${tokens.grisMoyen1}` }}>
          {mapVisible ? <AgencyMap agencies={locations} selectedId={selected.id} onSelect={selectAgency} scores={scores} /> : <Box sx={{ height: "100%", display: "grid", placeItems: "center", fontSize: 14, color: tokens.gris }}>{t("mapLoading")}</Box>}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0, p: { md: 2.5 }, borderRadius: { md: "16px" }, border: { md: `1px solid ${cardBorder}` }, bgcolor: tokens.blanc }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AgencyLetter index={selectedIndex} active size={32} />
            <Typography component="h3" aria-live="polite" sx={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, lineHeight: 1.25, color: tokens.bleuFonce }}>{selected.name} · {selected.city}</Typography>
          </Box>

          <AgencyPhotos key={selected.id} agency={selected} />

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
            {/* The score and the number of Avis Contrôlés, in green as on the Réputation display. */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.25 }}>
              <Box sx={{ p: 0.5, display: "flex", color: tokens.vertOs }}><VerifiedRounded sx={{ fontSize: 20 }} /></Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75 }}>
                {isPublic(summary.count, selected.publicThreshold) && summary.average !== null && <RatingChip value={summary.average} />}
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.vertOs }}>{t("verifiedCount", { count: formatCount(summary.count) })}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Voir son certificat, then the button that shows the other agencies under the map (hidden at first). */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: { md: "auto" }, pt: 0.5 }}>
            <ButtonBase
              component="a"
              href={certificateUrl}
              target="_blank"
              rel="noopener"
              aria-label={t("certificateLink", { name: selected.name, city: selected.city })}
              sx={{ height: 45, gap: 1, px: 2, borderRadius: "8px", bgcolor: tokens.bleu10, color: tokens.bleuFonce, fontFamily: "inherit", fontSize: 14, fontWeight: 600, "&:hover": { bgcolor: tokens.bleu20 }, "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 } }}
            >
              {tv("seeCertificate")}
              <OpenInNew sx={{ fontSize: 18 }} />
            </ButtonBase>
            <CtaButton variant="secondary" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((value) => !value)} sx={{ px: 2, "& img": { transform: expanded ? "rotate(180deg)" : "none" } }}>{t(expanded ? "showLess" : "showMore")}</CtaButton>
          </Box>
        </Box>
      </Box>

      {/* The agencies as photo cards (option B): 5 in a row on desktop, a row to swipe on phones and tablets.
          mt -2 cancels the section gap, so the space opens with the animation. */}
      <Collapse in={expanded} unmountOnExit sx={{ mt: -2 }}>
        <Box
          id={listId}
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            pt: 2,
            pb: { xs: 0.5, md: 0 },
            mx: { xs: -1.5, md: 0 },
            px: { xs: 1.5, md: 0 },
            display: { xs: "flex", md: "grid" },
            gridTemplateColumns: { md: "repeat(5, minmax(0, 1fr))" },
            gap: 1.5,
            overflowX: { xs: "auto", md: "visible" },
            scrollSnapType: { xs: "x mandatory", md: "none" },
            scrollPaddingInline: "12px",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {locations.map((location, index) => {
            const stats = summaries.get(location.id)!;
            const active = location.id === selected.id;
            const score = scores[location.id];
            return (
              <Box component="li" key={location.id} sx={{ flex: { xs: "0 0 62%", sm: "0 0 38%" }, minWidth: 0, scrollSnapAlign: "start" }}>
                <ButtonBase
                  onClick={() => selectAgency(location.id)}
                  aria-pressed={active}
                  aria-label={t("selectAgency", { city: location.city })}
                  sx={{
                    width: "100%",
                    height: "100%",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    borderRadius: "16px",
                    overflow: "hidden",
                    bgcolor: tokens.blanc,
                    // The selected agency: a 2 px navy border (drawn inside, so the cards don't move).
                    boxShadow: active ? `inset 0 0 0 2px ${tokens.bleuFonce}` : `inset 0 0 0 1px ${cardBorder}`,
                    transition: "box-shadow 200ms ease, transform 200ms ease",
                    "& img": { transition: "transform 400ms ease" },
                    "&:hover img": { transform: "scale(1.05)" },
                    "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 },
                  }}
                >
                  <Box sx={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", m: active ? "2px 2px 0" : "1px 1px 0", borderRadius: "14px 14px 0 0" }}>
                    <Image src={location.photos[0]} alt="" fill sizes="(min-width: 900px) 220px, 62vw" style={{ objectFit: "cover" }} />
                    <Box sx={{ position: "absolute", left: 8, top: 8, borderRadius: "50%", boxShadow: "0 1px 4px rgba(4, 27, 68, 0.25)", bgcolor: tokens.blanc }}>
                      <AgencyLetter index={index} active={active} />
                    </Box>
                  </Box>
                  <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: tokens.bleuFonce, minWidth: 0 }}>{location.city}</Typography>
                      {score !== null && score !== undefined && (
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, flexShrink: 0 }}>
                          <FigmaIcon name="star-small" />
                          {formatScore(score)}
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 13, color: tokens.gris }}>{t("verifiedCount", { count: formatCount(stats.count) })}</Typography>
                    {active && <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.bleu600, mt: 0.25 }}>{tv("selected")}</Typography>}
                  </Box>
                </ButtonBase>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
}
