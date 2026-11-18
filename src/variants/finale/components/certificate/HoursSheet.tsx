"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Agency } from "@/data/types";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import { useNow } from "@/lib/hooks";
import { isoDate, localDay, weekdayOf } from "@/lib/hours";
import { specialDaysAround, upcomingSpecialDays, type SpecialDay } from "@/lib/specialHours";
import { tokens } from "@/theme/theme";
import { ContactSheet } from "./ContactSheet";
import { OpenStatus } from "./OpenStatus";

/** "jeudi 24 décembre" → "Jeudi 24 décembre" (a calendar day kept at noon UTC). */
const dayLabel = (date: string) => {
  const text = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  // French writes the first of the month « 1er » (« vendredi 1er janvier »).
  const withFirst = text.replace(/(^|\s)1 /, "$11er ");
  return withFirst.charAt(0).toUpperCase() + withFirst.slice(1);
};
const rangesText = (ranges: [string, string][]) => ranges.map(([start, end]) => `${start} – ${end}`).join(", ");

/** Consecutive days of the same closure (the August week) shown as one line. */
function groupDays(days: SpecialDay[]) {
  const groups: { first: SpecialDay; last: SpecialDay }[] = [];
  for (const special of days) {
    const previous = groups[groups.length - 1];
    const next = previous && new Date(`${previous.last.date}T12:00:00Z`).getTime() + 86_400_000 === new Date(`${special.date}T12:00:00Z`).getTime();
    if (previous && next && previous.last.name === special.name && special.kind === "closure") previous.last = special;
    else groups.push({ first: special, last: special });
  }
  return groups;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, mb: 1 }}>{children}</Typography>;
}

const hoursCardSx = { p: 1.5, borderRadius: "12px" } as const;

/**
 * Horaires: a bottom sheet on phones, a side sheet on desktop. Today first (the live status and today's hours, or what
 * makes today different), then the usual week, then the coming exceptions: public holidays, shorter days, closures.
 */
export function HoursSheet({ agency, open, onClose }: { agency: Agency; open: boolean; onClose: () => void }) {
  const t = useTranslations("Hours");
  const ta = useTranslations("Agencies");
  const [contactOpen, setContactOpen] = useState(false);
  const now = useNow();
  const today = now ? localDay(now) : null;
  const todayWeekday = today ? weekdayOf(today) : -1;
  const todaySpecial = useMemo(() => (now && today ? specialDaysAround(now).get(isoDate(today)) : undefined), [now, today]);
  const upcoming = useMemo(() => (now ? groupDays(upcomingSpecialDays(agency.hours, now)) : []), [agency.hours, now]);
  const todayRanges = todaySpecial ? todaySpecial.ranges : agency.hours[todayWeekday] ?? [];
  const closed = !todayRanges.length;

  return (
    <ResponsiveSheet
      open={open}
      onClose={() => {
        setContactOpen(false);
        onClose();
      }}
      title={t("sheetTitle")}
      closeLabel={t("close")}
      footer={
        <Box sx={{ p: 2, borderTop: `1px solid ${tokens.grisMoyen1}`, flexShrink: 0, pb: "max(16px, env(safe-area-inset-bottom))" }}>
          <CtaButton variant="secondary" icon={null} aria-haspopup="dialog" onClick={() => setContactOpen(true)}>{t("contact")}</CtaButton>
        </Box>
      }
    >
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box sx={{ mt: -0.5 }}>
          <Typography sx={{ fontSize: 14, color: tokens.gris }}>{agency.name} · {agency.city}</Typography>
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ta("addressMapsLink", { address: agency.address })}
            sx={{ display: "inline-flex", alignItems: "flex-start", gap: 0.5, mt: 0.5, fontSize: 14, color: tokens.bleuFonce, textUnderlineOffset: "3px" }}
          >
            <PlaceOutlined sx={{ fontSize: 18, flexShrink: 0 }} />
            {agency.address}
          </Link>
        </Box>

        {/* Today: the live status, then today's hours, or why today is different. */}
        <Box sx={{ p: 1.75, borderRadius: "12px", bgcolor: closed ? "rgba(255,240,233,0.6)" : "rgba(233,255,242,0.6)", border: `1px solid ${closed ? "rgba(252,101,48,0.35)" : "rgba(67,182,163,0.4)"}`, display: "flex", flexDirection: "column", gap: 0.75 }}>
          <OpenStatus hours={agency.hours} split />
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, fontSize: 14, color: tokens.bleuFonce }}>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {t("today")}
              {todaySpecial && <Box component="span" sx={{ fontWeight: 400, color: tokens.gris }}> · {t(`special.${todaySpecial.name}`)}</Box>}
            </Box>
            <Box component="span" sx={{ fontWeight: 600, textAlign: "right" }}>{closed ? t("closed") : rangesText(todayRanges)}</Box>
          </Box>
        </Box>

        <Box sx={{ ...hoursCardSx, bgcolor: tokens.blanc, boxShadow: `inset 0 0 0 1px ${tokens.grisMoyen1}` }}>
          <SectionTitle>{t("usual")}</SectionTitle>
          <Box component="dl" sx={{ m: 0 }}>
            {agency.hours.map((ranges, day) => {
              const isToday = day === todayWeekday;
              return (
                <Box key={day} sx={{
                  display: "flex", justifyContent: "space-between", gap: 2, py: 0.75,
                  fontSize: 14, color: tokens.bleuFonce, borderTop: day ? `1px solid ${tokens.grisClair2}` : "none",
                  ...(isToday && { bgcolor: tokens.grisClair2, borderRadius: "6px", fontWeight: 700, mx: -1, px: 1 }),
                }}>
                  <Box component="dt" aria-current={isToday ? "date" : undefined}>{t(`daysTitle.${day}`)}</Box>
                  <Box component="dd" sx={{ m: 0, textAlign: "right", color: ranges.length ? undefined : tokens.gris }}>
                    {ranges.length ? ranges.map(([start, end]) => <Box key={start}>{start} – {end}</Box>) : t("closed")}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* The coming exceptions: public holidays, shorter days, the August closure. */}
        <Box sx={{ ...hoursCardSx, bgcolor: tokens.grisClair1 }}>
          <SectionTitle>{t("specialTitle")}</SectionTitle>
          {upcoming.length ? (
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {upcoming.map(({ first, last }) => {
                const isClosed = !first.ranges.length;
                return (
                  <Box component="li" key={first.date} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, py: 1, borderTop: `1px solid ${tokens.grisMoyen1}`, "&:first-of-type": { borderTop: "none" } }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.bleuFonce, lineHeight: 1.35 }}>
                        {first.date === last.date ? dayLabel(first.date) : t("range", { from: dayLabel(first.date).toLowerCase(), to: dayLabel(last.date).toLowerCase() })}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: tokens.gris, lineHeight: 1.35, mt: "2px" }}>
                        {t(`special.${first.name}`)} · {t(`kind.${first.kind}`)}
                      </Typography>
                    </Box>
                    <Typography sx={{ flexShrink: 0, fontSize: 14, fontWeight: 600, color: isClosed ? tokens.error3 : tokens.bleuFonce, textAlign: "right" }}>
                      {isClosed ? t("closed") : rangesText(first.ranges)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography sx={{ fontSize: 14, color: tokens.gris }}>{t("noSpecial")}</Typography>
          )}
        </Box>

        <Typography sx={{ fontSize: 12.5, color: tokens.gris, lineHeight: 1.45 }}>{t("note")}</Typography>
      </Box>
      <ContactSheet agency={agency} open={open && contactOpen} onClose={() => setContactOpen(false)} />
    </ResponsiveSheet>
  );
}
