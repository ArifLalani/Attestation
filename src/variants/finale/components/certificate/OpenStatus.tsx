"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { useTranslations } from "next-intl";
import type { WeekHours } from "@/data/types";
import { FigmaIcon } from "@/variants/finale/components/ui/FigmaIcon";
import { useNow } from "@/lib/hooks";
import { frenchTime, openingStatus } from "@/lib/hours";
import { specialDaysAround } from "@/lib/specialHours";
import { tokens } from "@/theme/theme";

/** Live "Ouvert · Ferme à 19 h" status, computed in the browser from the current Paris time. */
/** `split`: "Fermé" in colour then "· Ouvre…" in navy, without the dot (the agency card, from option C). */
/** `dot` (with `split`): a small dot before the status, in the same green or orange. */
/** `boxed`: a light tinted pill with a chevron (it opens the week's hours), so the status stands out on the hero's frosted glass. */
export function OpenStatus({ hours, split = false, dot = false, boxed = false, colors }: {
  hours: WeekHours;
  split?: boolean;
  dot?: boolean;
  boxed?: boolean;
  colors?: { open: string; closed: string };
}) {
  const t = useTranslations("Hours");
  const now = useNow();
  // Public holidays, shorter days and closures replace the usual hours.
  const status = now ? openingStatus(hours, now, undefined, specialDaysAround(now)) : null;

  const label = !status
    ? " "
    : status.open
      ? t("openUntil", { time: frenchTime(status.closesAt) })
      : status.opensAt === null
        ? t("closed")
        : status.opensDay === null
          ? t("closedOpensToday", { time: frenchTime(status.opensAt) })
          : t("closedOpensOn", { day: t(`days.${status.opensDay}`), time: frenchTime(status.opensAt) });

  const color = status && !status.open ? colors?.closed ?? tokens.error3 : colors?.open ?? tokens.vertOs;

  if (split) {
    const [state, ...rest] = label.split(" · ");
    return (
      <Typography role="status" sx={{ fontSize: 14, lineHeight: 1.45, color: tokens.bleuFonce, visibility: status ? "visible" : "hidden" }}>
        {dot && <Box component="span" aria-hidden sx={{ display: "inline-block", width: 6, height: 6, ml: "4px", mr: "8px", borderRadius: "50%", bgcolor: color, verticalAlign: "middle", position: "relative", top: "-1px" }} />}
        <Box component="span" sx={{ fontWeight: 600, color }}>{state}</Box>
        {rest.length > 0 && <> · {rest.join(" · ")}</>}
      </Typography>
    );
  }

  const closed = !!status && !status.open;
  const box = boxed
    ? { height: 30, px: 1.25, borderRadius: "8px", bgcolor: closed ? "rgba(255,240,233,0.5)" : "rgba(233,255,242,0.5)", border: `1px solid ${closed ? "rgba(252,101,48,0.5)" : "rgba(67,182,163,0.5)"}` }
    : {};

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", visibility: status ? "visible" : "hidden", ...box }} role="status">
      {status && !status.open ? (
        // Closed state isn't in the Figma: same dot, in the ERROR3 orange.
        <Box sx={{ width: 14, height: 10, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
        </Box>
      ) : (
        <FigmaIcon name="open-dot" />
      )}
      <Typography sx={{ fontSize: 14, fontWeight: 600, color, lineHeight: "normal", whiteSpace: "nowrap" }}>{label}</Typography>
      {boxed && <ChevronRight aria-hidden sx={{ fontSize: 20, color, mx: "-2px" }} />}
    </Box>
  );
}
