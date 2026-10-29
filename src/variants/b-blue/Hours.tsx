"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import type { WeekHours } from "@/data/types";
import { useNow } from "@/lib/hooks";
import { frenchTime, localClock, openingStatus } from "@/lib/hours";
import { b } from "./theme";

/** "Ouvert · Ferme à 19 h", computed in the browser (blank during server rendering). */
export function useOpenLabel(hours: WeekHours) {
  const t = useTranslations("Hours");
  const now = useNow();
  const status = now ? openingStatus(hours, now) : null;
  const label = !status
    ? " "
    : status.open
      ? t("openUntil", { time: frenchTime(status.closesAt) })
      : status.opensAt === null
        ? t("closed")
        : status.opensDay === null
          ? t("closedOpensToday", { time: frenchTime(status.opensAt) })
          : t("closedOpensOn", { day: t(`days.${status.opensDay}`), time: frenchTime(status.opensAt) });
  return { label, open: status?.open ?? null, today: now ? localClock(now).weekday : -1 };
}

export function OpenBadge({ hours, size = 14 }: { hours: WeekHours; size?: number }) {
  const { label, open } = useOpenLabel(hours);
  const color = open === false ? "#b3261e" : b.sageText;
  return (
    <Box role="status" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, visibility: open === null ? "hidden" : "visible", color, fontSize: size, fontWeight: 600, whiteSpace: "nowrap" }}>
      <Box component="span" sx={{ position: "relative", width: 8, height: 8, borderRadius: "50%", bgcolor: "currentColor", flexShrink: 0 }}>
        {open && (
          <Box
            component="span"
            sx={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              bgcolor: "currentColor",
              opacity: 0.25,
              animation: "b-pulse 2s ease-out infinite",
              "@keyframes b-pulse": { "0%": { transform: "scale(0.4)", opacity: 0.4 }, "100%": { transform: "scale(1.4)", opacity: 0 } },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          />
        )}
      </Box>
      {label}
    </Box>
  );
}

/** The week, today in bold. */
export function WeekTable({ hours, id }: { hours: WeekHours; id?: string }) {
  const t = useTranslations("Hours");
  const { today } = useOpenLabel(hours);
  return (
    <Box id={id} component="dl" sx={{ m: 0, display: "flex", flexDirection: "column" }}>
      {hours.map((ranges, day) => (
        <Box key={day} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, fontSize: 14, fontWeight: day === today ? 700 : 400, color: day === today ? b.ink : b.muted, borderTop: day ? `1px dashed ${b.line}` : "none" }}>
          <Typography component="dt" sx={{ font: "inherit", color: "inherit" }}>{t(`daysTitle.${day}`)}</Typography>
          <Typography component="dd" sx={{ m: 0, font: "inherit", color: "inherit", textAlign: "right" }}>
            {ranges.length ? ranges.map(([start, end]) => `${frenchTime(start)} – ${frenchTime(end)}`).join(" · ") : t("closed")}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
