"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import StarRounded from "@mui/icons-material/StarRounded";
import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Agency } from "@/data/types";
import { formatScore } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { pc } from "./theme";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

/** Agencies map with Google-style pills: letter and score; the selected one in indigo. */
export default function MapC({ agencies, selectedId, onSelect, scores, padding }: { agencies: Agency[]; selectedId: string; onSelect: (id: string) => void; scores: Record<string, number | null>; padding?: { left: number; bottom: number } }) {
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
  // Desktop: the info card covers the bottom left of the map, so the map centres in the space that stays visible.
  const padLeft = padding?.left ?? 0;
  const padBottom = padding?.bottom ?? 0;
  const offset = { top: 48, right: 48, left: padLeft + 48, bottom: padBottom + 48 };

  useEffect(() => {
    map.current?.flyTo({ center: [selected.geo.lng, selected.geo.lat], duration: reduced ? 0 : 700, padding: { top: 0, right: 0, left: padLeft, bottom: padBottom } });
  }, [selected, reduced, padLeft, padBottom]);

  if (failed) {
    return (
      <Box role="status" sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, p: 2, textAlign: "center", bgcolor: pc.surfaceDim }}>
        <Typography sx={{ fontSize: 14 }}>{t("mapUnavailable")}</Typography>
        <Button onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>{t("retryMap")}</Button>
      </Box>
    );
  }

  return (
    <Map
      key={attempt}
      ref={map}
      initialViewState={{ bounds, fitBoundsOptions: { padding: offset, maxZoom: 12 } }}
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
                height: 36,
                gap: 0.5,
                pl: 0.5,
                pr: 1.25,
                mb: "8px",
                borderRadius: 999,
                bgcolor: active ? pc.indigo : "#fff",
                color: active ? "#fff" : pc.ink,
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(27,31,42,0.25)",
                transform: active ? "scale(1.12)" : "none",
                transformOrigin: "bottom center",
                transition: "transform 200ms ease, background-color 200ms ease",
                "&::after": { content: '""', position: "absolute", left: "50%", bottom: -6, ml: "-6px", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `7px solid ${active ? pc.indigo : "#fff"}` },
                "&.Mui-focusVisible": { outline: `3px solid ${pc.ink}`, outlineOffset: 2 },
              }}
            >
              <Box component="span" aria-hidden sx={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: active ? "rgba(255,255,255,0.2)" : pc.indigoTonal, color: active ? "#fff" : pc.indigoDark, fontSize: 13 }}>
                {String.fromCharCode(65 + index)}
              </Box>
              {score !== null && score !== undefined && (
                <>
                  {formatScore(score)}
                  <StarRounded sx={{ fontSize: 16, color: active ? "#fff" : pc.star }} />
                </>
              )}
            </ButtonBase>
          </Marker>
        );
      })}
    </Map>
  );
}
