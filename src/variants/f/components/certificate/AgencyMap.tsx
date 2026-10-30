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
import { usePrefersReducedMotion } from "@/lib/hooks";
import { tokens } from "@/variants/f/theme";
import "maplibre-gl/dist/maplibre-gl.css";

// MapLibre 6 ships a separate ES-module worker; Next emits this URL as a hashed asset.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

export const agencyColors = ["#e84236", tokens.bleu600, "#6871b5", "#197c70", "#a55924"];

export default function AgencyMap({ agencies, selectedId, onSelect }: { agencies: Agency[]; selectedId: string; onSelect: (id: string) => void }) {
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

  if (failed) return (
    <Box role="status" sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, p: 2, textAlign: "center", bgcolor: tokens.grisClair2 }}>
      <Typography sx={{ fontSize: 14 }}>{t("mapUnavailable")}</Typography>
      <Button onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>{t("retryMap")}</Button>
    </Box>
  );

  return (
    <Map
      key={attempt} ref={map} initialViewState={{ bounds, fitBoundsOptions: { padding: 42, maxZoom: 12 } }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      attributionControl={{ compact: true }}
      style={{ width: "100%", height: "100%" }}
      scrollZoom={false} dragRotate={false} touchPitch={false} touchZoomRotate={{ around: "center" }}
      canvasContextAttributes={{ antialias: true }}
      onError={() => setFailed(true)}
    >
      <NavigationControl showCompass={false} position="top-right" />
      {agencies.map((agency, index) => (
        <Marker key={agency.id} longitude={agency.geo.lng} latitude={agency.geo.lat} anchor="center">
          <ButtonBase aria-label={t("selectAgency", { city: agency.city })} aria-pressed={agency.id === selectedId} onClick={() => onSelect(agency.id)}
            sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: agencyColors[index % agencyColors.length], color: tokens.blanc, fontSize: 14, fontWeight: 700, border: `3px solid ${tokens.blanc}`, boxShadow: agency.id === selectedId ? `0 0 0 3px ${tokens.bleuFonce}` : tokens.shadowCard, "&:focus-visible": { outline: `3px solid ${tokens.bleuFonce}`, outlineOffset: 3 } }}>
            {String.fromCharCode(65 + index)}
          </ButtonBase>
        </Marker>
      ))}
    </Map>
  );
}
