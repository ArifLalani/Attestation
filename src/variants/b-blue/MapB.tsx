"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Agency } from "@/data/types";
import { formatScore } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { b } from "./theme";
import { Pill } from "./ui";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

/** The agencies as rounded labels (letter · score), like Airbnb's price pins; the selected one turns ink. */
export default function MapB({ agencies, scores, selectedId, onSelect }: { agencies: Agency[]; scores: Record<string, number | null>; selectedId: string; onSelect: (id: string) => void }) {
  const t = useTranslations("Agencies");
  const map = useRef<MapRef>(null);
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const selected = agencies.find((agency) => agency.id === selectedId)!;
  const bounds = useMemo<[number, number, number, number]>(
    () => [
      Math.min(...agencies.map((agency) => agency.geo.lng)),
      Math.min(...agencies.map((agency) => agency.geo.lat)),
      Math.max(...agencies.map((agency) => agency.geo.lng)),
      Math.max(...agencies.map((agency) => agency.geo.lat)),
    ],
    [agencies],
  );

  useEffect(() => {
    map.current?.flyTo({ center: [selected.geo.lng, selected.geo.lat], duration: reduced ? 0 : 800 });
  }, [selected, reduced]);

  if (failed) {
    return (
      <Box role="status" sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, p: 3, textAlign: "center", bgcolor: b.sand }}>
        <Typography sx={{ fontSize: 15 }}>{t("mapUnavailable")}</Typography>
        <Pill variant="outline" small onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>{t("retryMap")}</Pill>
      </Box>
    );
  }

  return (
    <Map
      key={attempt}
      ref={map}
      initialViewState={{ bounds, fitBoundsOptions: { padding: 56, maxZoom: 12 } }}
      mapStyle="https://tiles.openfreemap.org/styles/positron"
      attributionControl={{ compact: true }}
      style={{ width: "100%", height: "100%" }}
      scrollZoom={false}
      dragRotate={false}
      touchPitch={false}
      touchZoomRotate={{ around: "center" }}
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
                gap: 0.5,
                minHeight: 32,
                px: 1.25,
                mb: 1,
                borderRadius: 999,
                fontFamily: b.sans,
                fontSize: 14,
                fontWeight: 700,
                bgcolor: active ? b.ink : b.white,
                color: active ? b.white : b.ink,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.18)",
                transform: active ? "scale(1.1)" : "none",
                transition: "transform 200ms ease, background-color 200ms ease",
                "&:hover": { transform: "scale(1.08)" },
                "&::after": { content: '""', position: "absolute", left: "50%", bottom: -5, width: 10, height: 10, bgcolor: active ? b.ink : b.white, transform: "translateX(-50%) rotate(45deg)", borderRadius: "2px", transition: "background-color 200ms ease" },
                "&:focus-visible": { outline: `3px solid ${b.accent}`, outlineOffset: 3 },
              }}
            >
              <Box component="span" sx={{ position: "relative", zIndex: 1 }}>{String.fromCharCode(65 + index)}</Box>
              {score !== null && (
                <Box component="span" sx={{ position: "relative", zIndex: 1, fontWeight: 600, opacity: 0.9 }}>· ★ {formatScore(score)}</Box>
              )}
            </ButtonBase>
          </Marker>
        );
      })}
    </Map>
  );
}
