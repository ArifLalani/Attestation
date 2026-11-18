import type { WeekHours } from "@/data/types";

export const AGENCY_TIME_ZONE = "Europe/Paris";

/** Monday = 0 … Sunday = 6, and minutes since midnight, in the agency's time zone. */
export function localClock(now: Date, timeZone = AGENCY_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
  return { weekday, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Calendar days are handled as noon UTC, so adding days never crosses a daylight-saving edge. */
export const calendarDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 12));
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
/** Monday = 0 … Sunday = 6 of a calendar day. */
export const weekdayOf = (date: Date) => (date.getUTCDay() + 6) % 7;

/** Today's calendar date in the agency's time zone. */
export function localDay(now: Date, timeZone = AGENCY_TIME_ZONE) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now).split("-").map(Number);
  return calendarDay(y, m, d);
}

export type OpeningStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; /** Weekday of the next opening, `null` if it is later today. */ opensDay: number | null }
  | { open: false; opensAt: null; opensDay: null };

/**
 * Open now, or when it opens next. `special` (by "YYYY-MM-DD") replaces the usual hours on public holidays,
 * shorter days or closures.
 */
export function openingStatus(hours: WeekHours, now: Date, timeZone = AGENCY_TIME_ZONE, special?: Map<string, { ranges: [string, string][] }>): OpeningStatus {
  const { minutes } = localClock(now, timeZone);
  const today = localDay(now, timeZone);
  const rangesOn = (offset: number) => {
    const date = addDays(today, offset);
    return special?.get(isoDate(date))?.ranges ?? hours[weekdayOf(date)] ?? [];
  };

  for (const [start, end] of rangesOn(0)) {
    if (minutes >= toMinutes(start) && minutes < toMinutes(end)) return { open: true, closesAt: end };
  }

  const laterToday = rangesOn(0).find(([start]) => toMinutes(start) > minutes);
  if (laterToday) return { open: false, opensAt: laterToday[0], opensDay: null };

  // Up to three weeks ahead (a closed week in August, then the usual hours).
  for (let offset = 1; offset <= 21; offset++) {
    const first = rangesOn(offset)[0];
    if (first) return { open: false, opensAt: first[0], opensDay: weekdayOf(addDays(today, offset)) };
  }
  return { open: false, opensAt: null, opensDay: null };
}

/** "19:00" → "19 h", "12:30" → "12 h 30" (French style). */
export function frenchTime(time: string) {
  const [h, m] = time.split(":");
  return m === "00" ? `${Number(h)} h` : `${Number(h)} h ${m}`;
}
