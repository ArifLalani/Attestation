"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { getAgency } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import type { Agency } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { emptyFilters, useCertificate } from "@/components/certificate/CertificateContext";
import { AgencyPhotos } from "./AgencyPhotos";
import { HoursSheet } from "./HoursSheet";
import { OpenStatus, StatusClock } from "./OpenStatus";
import { CardTitle } from "./ReputationCard";
import { useCaseData } from "@/variants/finale/cases";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRounded from "@mui/icons-material/SearchRounded";

/** Case 9: the list of agencies shows 10 at a time, with a search, once there are more than 5. */
const PAGE = 10;
/** Pins and cards carry a letter for the first five agencies only (A to E). */
const LETTERS = 5;

const AgencyMap = dynamic(() => import("./AgencyMap"), { ssr: false });
/** The agency's letter, in the colours of its pin on the map: navy once selected, light blue otherwise. */
function AgencyLetter({ index, active, size = 28 }: { index: number; active?: boolean; size?: number }) {
  if (index >= LETTERS) return null;
  return <Box aria-hidden sx={{ width: size, height: size, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: active ? tokens.bleuFonce : tokens.bleu10, color: active ? tokens.blanc : tokens.bleuFonce, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + index)}</Box>;
}

/** The outline of H's cards (as on the team cards). */
const cardBorder = "#d6e4f3";

const agencyActionSx = {
  textAlign: "left",
  "&:focus-visible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: -2 },
} as const;

/** The same icons as the hero card: outlined, 20 px, navy. */
const agencyIconSx = { fontSize: 20, flexShrink: 0, color: tokens.bleuFonce } as const;

const agencyActionLabelSx = { flex: 1, minWidth: 0, overflowWrap: "anywhere" } as const;

/** The open/closed line of the agency shown; it opens the Horaires sheet (today, the week, holidays and other exceptions). */
function OpeningHours({ agency }: { agency: Agency }) {
  const th = useTranslations("Hours");
  const [open, setOpen] = useState(false);
  return (
    <>
      <CtaButton variant="secondary" icon="icon-right-arrow" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={th("open")} sx={agencyActionSx}>
        <StatusClock hours={agency.hours} />
        <Box sx={agencyActionLabelSx}><OpenStatus hours={agency.hours} split /></Box>
      </CtaButton>
      <HoursSheet agency={agency} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Nos Agences in option B's layout (map, agency card beside it, the agencies as photo cards) in H's look, with option C's score pins. */
export function AgenciesSection() {
  const t = useTranslations("Agencies");
  const tv = useTranslations("VarianteFinale.agencies");
  const { agency, goToSection, setFilters } = useCertificate();
  const { sector, agencyById, datasetFor } = useCaseData();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(agency.id);
  const [expanded, setExpanded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const listId = useId();
  const locations = useMemo(() => [agency, ...agency.sisterAgencyIds.map(agencyById).filter((item): item is Agency => Boolean(item))], [agency, agencyById]);
  const summaries = useMemo(() => new Map(locations.map((location) => [location.id, summarize(reviewsForScore(datasetFor(location).reviews, "controle"))])), [locations, datasetFor]);
  // Case 6: a single location. Case 9: more than 5.
  const single = locations.length === 1;
  const many = locations.length > LETTERS;
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!needle) return locations;
    return locations.filter((location) => `${location.city} ${location.address}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(needle));
  }, [locations, query]);
  const pages = Math.max(1, Math.ceil(matches.length / PAGE));
  const shown = many ? matches.slice((Math.min(page, pages) - 1) * PAGE, Math.min(page, pages) * PAGE) : locations;
  // The score shown on each pin (hidden under the publication threshold).
  const scores = useMemo(() => Object.fromEntries(locations.map((location) => {
    const stats = summaries.get(location.id)!;
    return [location.id, isPublic(stats.count, location.publicThreshold) ? stats.average : null];
  })), [locations, summaries]);
  const selected = locations.find((location) => location.id === selectedId) ?? agency;
  const selectedIndex = locations.indexOf(selected);
  const globalSummary = useMemo(() => summarize(datasetFor(selected).reviews), [selected, datasetFor]);
  const isCurrent = selected.id === agency.id;
  const reviewLink = isCurrent ? undefined : {
    href: `/fr-fr/variantes/finale/${selected.id}#avis`,
    target: "_blank",
    rel: "noopener",
  };

  const selectAgency = (id: string) => {
    setSelectedId(id);
  };

  // The WebGL map is below the reviews; load it only as the visitor approaches it.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setMapVisible(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    if (mapContainer.current) observer.observe(mapContainer.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box component="section" id="nos-agences" aria-labelledby="agencies-title" sx={{ scrollMarginTop: `calc(var(--certificate-header-height, ${tokens.headerHeight}px) + 16px)`, bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCard, px: { xs: 1.5, md: 2 }, py: { xs: 1.5, md: 2 }, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Case 6: « Notre agence » (or « Notre établissement ») for a single location; the sector's word otherwise (Case 4). */}
      <CardTitle id="agencies-title" eyebrow={single ? sector.ourPlace : sector.ourPlaces} heading={t("heading")} />
      <Typography sx={{ fontSize: 14, color: tokens.gris }}>
        {single
          ? "Retrouvez l’adresse, les horaires et l’itinéraire."
          : sector.place === "agence"
            ? `Trouvez l’agence ${agency.name} la plus proche de chez vous.`
            : `Trouvez l’établissement ${agency.name} le plus proche de chez vous.`}
      </Typography>
      {/* Option B's layout: the map on the left, the agency card on the right. The two share the row's height,
          so the map grows when the week of hours opens. On phones the card sits under the map. */}
      {/* From 1200 px the two columns match Démarche Qualité below (two equal halves, 32 px apart), so their edges line up. */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1.35fr) minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }, columnGap: { xs: 2, lg: 4 }, rowGap: 2, alignItems: "stretch" }}>
        <Box ref={mapContainer} role="region" aria-label={t("mapLabel")} sx={{ height: { xs: 300, sm: 360, md: "auto" }, minHeight: { md: 420 }, borderRadius: { xs: "12px", sm: "16px" }, overflow: "hidden", bgcolor: tokens.grisClair2, border: `1px solid ${tokens.grisMoyen1}` }}>
          {mapVisible ? <AgencyMap agencies={locations} selectedId={selected.id} onSelect={selectAgency} scores={scores} letters={!single} cluster={many} /> : <Box sx={{ height: "100%", display: "grid", placeItems: "center", fontSize: 14, color: tokens.gris }}>{t("mapLoading")}</Box>}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0, p: { md: 2.5 }, borderRadius: { md: "16px" }, border: { md: `1px solid ${cardBorder}` }, bgcolor: tokens.blanc }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {!single && <AgencyLetter index={selectedIndex} active size={32} />}
            <Typography component="h3" aria-live="polite" sx={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, lineHeight: 1.25, color: tokens.bleuFonce }}>{selected.name} · {selected.city}</Typography>
          </Box>

          {/* Case 6: a single location, the phone and Itinéraire come first, side by side. */}
          {single && (
            <Box sx={{ display: "flex", gap: 1, "& > *": { flex: "1 1 0", minWidth: 0 } }}>
              <CtaButton icon={null} href={`tel:${selected.phone.replace(/\s/g, "")}`} sx={{ gap: 1 }}>
                <PhoneOutlined aria-hidden sx={{ fontSize: 20 }} />
                Appeler
              </CtaButton>
              <CtaButton variant="secondary" icon={null} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.address)}`} target="_blank" rel="noopener" sx={{ gap: 1 }}>
                <DirectionsOutlined aria-hidden sx={{ fontSize: 20 }} />
                Itinéraire
              </CtaButton>
            </Box>
          )}

          {/* Case 8: no photos, no strip. */}
          {selected.photos.length > 0 && <AgencyPhotos key={selected.id} agency={selected} />}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <CtaButton
              variant="secondary"
              icon="icon-right-arrow"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`}
              target="_blank"
              rel="noopener"
              aria-label={t("addressMapsLink", { address: selected.address })}
              sx={agencyActionSx}
            >
              <PlaceOutlined aria-hidden sx={agencyIconSx} />
              <Box component="span" sx={agencyActionLabelSx}>{selected.address}</Box>
            </CtaButton>
            {!single && (
              <CtaButton variant="secondary" icon="icon-right-arrow" href={`tel:${selected.phone.replace(/\s/g, "")}`} sx={agencyActionSx}>
                <PhoneOutlined aria-hidden sx={agencyIconSx} />
                <Box component="span" sx={agencyActionLabelSx}>{selected.phone}</Box>
              </CtaButton>
            )}
            <OpeningHours key={`hours-${selected.id}`} agency={selected} />
            <CtaButton
              variant="secondary"
              icon="icon-right-arrow"
              {...reviewLink}
              onClick={isCurrent ? () => {
                setFilters(emptyFilters);
                goToSection("avis");
              } : undefined}
              sx={agencyActionSx}
            >
              <FigmaIcon name="rv-all" size={20} />
              <Box component="span" sx={{ ...agencyActionLabelSx, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75 }}>
                {isPublic(globalSummary.count, selected.publicThreshold) && globalSummary.average !== null && (
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, px: 0.75, border: `1px solid ${tokens.grisMoyen1}`, borderRadius: "6px" }}>
                    {formatScore(globalSummary.average)}
                    <FigmaIcon name="star-small" />
                  </Box>
                )}
                {tv("globalReviews", { count: formatCount(globalSummary.count) })}
              </Box>
            </CtaButton>
          </Box>

          {!single && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: { md: "auto" }, pt: 0.5 }}>
              <CtaButton variant="secondary" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((value) => !value)} sx={{ px: 2, "& img": { transform: expanded ? "rotate(180deg)" : "none" } }}>
                {expanded ? `Masquer les ${sector.places}` : many ? `Voir les ${locations.length - 1} autres ${sector.places}` : `Voir les autres ${sector.places}`}
              </CtaButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* The agencies: compact rows with a small office photo on phones and tablets (the size of the photo thumbnails),
          5 photo cards in a row on desktop. mt -2 cancels the section gap, so the space opens with the animation. */}
      <Collapse in={expanded && !single} unmountOnExit sx={{ mt: -2 }}>
        {many && (
          // Case 9: a search over the city and the address, then 10 per page.
          <Box sx={{ pt: 2, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
            <TextField
              size="small"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder={`Rechercher une ville, une adresse…`}
              aria-label={`Rechercher dans les ${locations.length} ${sector.places}`}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 20, color: tokens.gris }} /></InputAdornment> } }}
              sx={{ flex: "1 1 280px", maxWidth: { md: 420 }, "& .MuiInputBase-root": { bgcolor: tokens.grisClair1, borderRadius: "8px", fontSize: 14 } }}
            />
            <Typography sx={{ fontSize: 13, color: tokens.gris }}>{matches.length} {sector.places} sur {locations.length}</Typography>
          </Box>
        )}
        <Box
          id={listId}
          component="ul"
          sx={{ listStyle: "none", m: 0, p: 0, pt: 2, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" }, gap: { xs: 1, md: 1.5 } }}
        >
          {shown.map((location) => {
            const index = locations.indexOf(location);
            const stats = summaries.get(location.id)!;
            const active = location.id === selected.id;
            const score = scores[location.id];
            return (
              <Box component="li" key={location.id} sx={{ minWidth: 0 }}>
                <ButtonBase
                  onClick={() => selectAgency(location.id)}
                  aria-pressed={active}
                  aria-label={t("selectAgency", { city: location.city })}
                  sx={{
                    width: "100%",
                    height: "100%",
                    flexDirection: { xs: "row", md: "column" },
                    alignItems: { xs: "center", md: "stretch" },
                    justifyContent: "flex-start",
                    gap: { xs: 1.5, md: 0 },
                    p: { xs: 1, md: 0 },
                    textAlign: "left",
                    borderRadius: { xs: "12px", md: "16px" },
                    overflow: "hidden",
                    bgcolor: tokens.blanc,
                    // The selected agency: a 2 px navy border (drawn inside, so the cards don't move).
                    boxShadow: active ? `inset 0 0 0 2px ${tokens.bleuFonce}` : `inset 0 0 0 1px ${cardBorder}`,
                    transition: "box-shadow 200ms ease",
                    "& img": { transition: "transform 400ms ease" },
                    "&:hover img": { transform: "scale(1.05)" },
                    "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleu600}`, outlineOffset: 2 },
                  }}
                >
                  <Box sx={{ position: "relative", flexShrink: 0, width: { xs: 72, md: "auto" }, aspectRatio: { xs: "1", md: "4 / 3" }, overflow: "hidden", m: { md: active ? "2px 2px 0" : "1px 1px 0" }, borderRadius: { xs: "8px", md: "14px 14px 0 0" } }}>
                    <Image src={location.officePhoto} alt="" fill sizes="(min-width: 900px) 220px, 72px" style={{ objectFit: "cover" }} />
                    <Box sx={{ display: { xs: "none", md: "block" }, position: "absolute", left: 8, top: 8, borderRadius: "50%", boxShadow: "0 1px 4px rgba(4, 27, 68, 0.25)", bgcolor: tokens.blanc }}>
                      <AgencyLetter index={index} active={active} />
                    </Box>
                  </Box>
                  <Box sx={{ flex: { xs: 1, md: "none" }, minWidth: 0, px: { md: 1.5 }, pt: { md: 1 }, pb: { md: 1.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {/* Phones: the letter of its pin next to the name. */}
                      <Box sx={{ display: { xs: "flex", md: "none" }, flexShrink: 0 }}>
                        <AgencyLetter index={index} active={active} size={24} />
                      </Box>
                      <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: tokens.bleuFonce, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{location.city}</Typography>
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
        {many && pages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
            <Pagination count={pages} page={Math.min(page, pages)} onChange={(_, value) => setPage(value)} shape="rounded" sx={{ "& .Mui-selected": { bgcolor: `${tokens.bleuFonce} !important`, color: tokens.blanc } }} />
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
