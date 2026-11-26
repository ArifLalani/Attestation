"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Agency } from "@/data/types";
import { formatScore } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { tokens } from "@/theme/theme";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import "maplibre-gl/dist/maplibre-gl.css";

// MapLibre 6 ships a separate ES-module worker; Next emits this URL as a hashed asset.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

/**
 * Agencies map from option C, in H's colours: a light map, and a pill per agency with its letter and score;
 * the selected one in navy, a little larger.
 */
/** Case 9: pins closer than this (in pixels) merge into one numbered bubble; tapping it zooms in until they split. */
const CLUSTER_RADIUS = 64;

export default function AgencyMap({ agencies, selectedId, onSelect, scores, letters = true, cluster = false }: {
  agencies: Agency[];
  selectedId: string;
  onSelect: (id: string) => void;
  scores: Record<string, number | null>;
  /** Case 6: a single location has no letter. Case 9: letters stop after E. */
  letters?: boolean;
  /** Case 9 (more than 5 agencies): nearby pins are grouped. */
  cluster?: boolean;
}) {
  // Bumped when the map loads or zooms, so the groups are measured again.
  const [view, setView] = useState(0);
  const t = useTranslations("Agencies");
  const map = useRef<MapRef>(null);
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const selected = agencies.find((agency) => agency.id === selectedId)!;
  const bounds = useMemo<[number, number, number, number]>(() => [
    Math.min(...agencies.map((agency) => agency.geo.lng)),
    Math.min(...agencies.map((agency) => agency.geo.lat)),
    Math.max(...agencies.map((agency) => agency.geo.lng)),
    Math.max(...agencies.map((agency) => agency.geo.lat)),
  ], [agencies]);

  useEffect(() => {
    map.current?.flyTo({ center: [selected.geo.lng, selected.geo.lat], duration: reduced ? 0 : 700 });
  }, [selected, reduced]);

  // Groups of agencies in screen space (the selected one is never grouped). Without clustering, one group per agency.
  const groups = useMemo(() => {
    const instance = map.current?.getMap();
    if (!cluster || !instance || view === 0) return agencies.map((agency) => ({ members: [agency] }));
    const result: { members: Agency[]; x: number; y: number; fixed?: boolean }[] = [];
    for (const agency of agencies) {
      const point = instance.project([agency.geo.lng, agency.geo.lat]);
      if (agency.id === selectedId) {
        result.push({ members: [agency], x: point.x, y: point.y, fixed: true });
        continue;
      }
      const near = result.find((group) => !group.fixed && Math.hypot(group.x - point.x, group.y - point.y) < CLUSTER_RADIUS);
      if (near) near.members.push(agency);
      else result.push({ members: [agency], x: point.x, y: point.y });
    }
    return result;
  }, [agencies, cluster, selectedId, view]);

  const zoomTo = (members: Agency[]) => {
    const lngs = members.map((agency) => agency.geo.lng);
    const lats = members.map((agency) => agency.geo.lat);
    map.current?.fitBounds([Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)], { padding: 72, maxZoom: 14, duration: reduced ? 0 : 600 });
  };

  if (failed) return (
    <Box role="status" sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, p: 2, textAlign: "center", bgcolor: tokens.grisClair2 }}>
      <Typography sx={{ fontSize: 14 }}>{t("mapUnavailable")}</Typography>
      <Button onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>{t("retryMap")}</Button>
    </Box>
  );

  return (
    <Map
      key={attempt} ref={map}
      initialViewState={{ bounds, fitBoundsOptions: { padding: 48, maxZoom: 12 } }}
      mapStyle="https://tiles.openfreemap.org/styles/positron"
      attributionControl={{ compact: true }}
      style={{ width: "100%", height: "100%" }}
      // Fixed: no dragging, pinching or double-tap zoom, so a finger scrolling the page over the map never gets caught by it.
      dragPan={false} scrollZoom={false} dragRotate={false} touchPitch={false} touchZoomRotate={false} doubleClickZoom={false} boxZoom={false} keyboard={false}
      cursor="default"
      canvasContextAttributes={{ antialias: true }}
      onError={() => setFailed(true)}
      onLoad={() => setView((value) => value + 1)}
      onMoveEnd={() => setView((value) => value + 1)}
    >
      <NavigationControl showCompass={false} position="top-right" />
      {groups.map(({ members }) => {
        if (members.length > 1) {
          const lng = members.reduce((sum, agency) => sum + agency.geo.lng, 0) / members.length;
          const lat = members.reduce((sum, agency) => sum + agency.geo.lat, 0) / members.length;
          return (
            <Marker key={`group-${members[0].id}`} longitude={lng} latitude={lat} anchor="center" style={{ zIndex: 1 }}>
              <ButtonBase
                aria-label={`${members.length} agences : ${members.map((agency) => agency.city).join(", ")}. Zoomer`}
                onClick={() => zoomTo(members)}
                sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: tokens.blanc, color: tokens.bleuFonce, fontFamily: "inherit", fontSize: 15, fontWeight: 700, boxShadow: `0 0 0 6px rgba(4, 27, 68, 0.12), 0 2px 8px rgba(4, 27, 68, 0.25)`, border: `2px solid ${tokens.bleuFonce}`, transition: "transform 150ms ease", "&:hover": { transform: "scale(1.08)" }, "&.Mui-focusVisible": { outline: `3px solid ${tokens.bleu600}`, outlineOffset: 2 } }}
              >
                {members.length}
              </ButtonBase>
            </Marker>
          );
        }
        const agency = members[0];
        const index = agencies.indexOf(agency);
        const showLetter = letters && index < 5;
        const active = agency.id === selectedId;
        const score = scores[agency.id];
        return (
          <Marker key={agency.id} longitude={agency.geo.lng} latitude={agency.geo.lat} anchor="bottom" style={{ zIndex: active ? 2 : 1 }}>
            <ButtonBase
              aria-label={t("selectAgency", { city: agency.city })}
              aria-pressed={active}
              onClick={() => onSelect(agency.id)}
              sx={{
                position: "relative",
                height: 36,
                gap: 0.5,
                pl: showLetter ? 0.5 : 1.25,
                pr: score === null || score === undefined ? 0.5 : 1.25,
                mb: "8px",
                borderRadius: "8px",
                bgcolor: active ? tokens.bleuFonce : tokens.blanc,
                color: active ? tokens.blanc : tokens.bleuFonce,
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(4, 27, 68, 0.25)",
                transform: active ? "scale(1.12)" : "none",
                transformOrigin: "bottom center",
                transition: "transform 200ms ease, background-color 200ms ease",
                // The point under the pill, on the agency's address.
                "&::after": { content: '""', position: "absolute", left: "50%", bottom: -6, ml: "-6px", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `7px solid ${active ? tokens.bleuFonce : tokens.blanc}` },
                "&.Mui-focusVisible": { outline: `3px solid ${tokens.bleu600}`, outlineOffset: 2 },
              }}
            >
              {showLetter && (
                <Box component="span" aria-hidden sx={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: active ? "rgba(255, 255, 255, 0.18)" : tokens.bleu10, color: active ? tokens.blanc : tokens.bleuFonce, fontSize: 13 }}>
                  {String.fromCharCode(65 + index)}
                </Box>
              )}
              {score !== null && score !== undefined && (
                <>
                  {formatScore(score)}
                  <FigmaIcon name="star-small" />
                </>
              )}
            </ButtonBase>
          </Marker>
        );
      })}
    </Map>
  );
}
