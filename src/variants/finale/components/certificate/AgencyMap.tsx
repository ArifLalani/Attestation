"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
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

/** Desktop: the agency card covers this much of the map's left side (16 px margin + its width). */
export const AGENCY_CARD_SPACE = 16 + 380;

/**
 * Agencies map from option C, in H's colours: a light map, and a pill per agency with its letter and score;
 * the selected one in navy, a little larger.
 */
export default function AgencyMap({ agencies, selectedId, onSelect, scores }: { agencies: Agency[]; selectedId: string; onSelect: (id: string) => void; scores: Record<string, number | null> }) {
  const t = useTranslations("Agencies");
  const map = useRef<MapRef>(null);
  const reduced = usePrefersReducedMotion();
  // Desktop: the card floats over the left of the map, so the map centres in the part that stays visible.
  const desktop = useMediaQuery("(min-width:900px)", { noSsr: true });
  const padLeft = desktop ? AGENCY_CARD_SPACE : 0;
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
    map.current?.flyTo({ center: [selected.geo.lng, selected.geo.lat], duration: reduced ? 0 : 700, padding: { top: 0, right: 0, bottom: 0, left: padLeft } });
  }, [selected, reduced, padLeft]);

  if (failed) return (
    <Box role="status" sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, p: 2, textAlign: "center", bgcolor: tokens.grisClair2 }}>
      <Typography sx={{ fontSize: 14 }}>{t("mapUnavailable")}</Typography>
      <Button onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>{t("retryMap")}</Button>
    </Box>
  );

  return (
    <Map
      key={attempt} ref={map}
      initialViewState={{ bounds, fitBoundsOptions: { padding: { top: 48, right: 48, bottom: 48, left: padLeft + 48 }, maxZoom: 12 } }}
      mapStyle="https://tiles.openfreemap.org/styles/positron"
      attributionControl={{ compact: true }}
      style={{ width: "100%", height: "100%" }}
      scrollZoom={false} dragRotate={false} touchPitch={false} touchZoomRotate={{ around: "center" }}
      canvasContextAttributes={{ antialias: true }}
      onError={() => setFailed(true)}
    >
      <NavigationControl showCompass={false} position="top-right" />
      {agencies.map((agency, index) => {
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
                pl: 0.5,
                pr: score === null || score === undefined ? 0.5 : 1.25,
                mb: "8px",
                borderRadius: "999px",
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
              <Box component="span" aria-hidden sx={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: active ? "rgba(255, 255, 255, 0.18)" : tokens.bleu10, color: active ? tokens.blanc : tokens.bleuFonce, fontSize: 13 }}>
                {String.fromCharCode(65 + index)}
              </Box>
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
