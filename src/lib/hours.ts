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

export type OpeningStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; /** Weekday of the next opening, `null` if it is later today. */ opensDay: number | null }
  | { open: false; opensAt: null; opensDay: null };

export function openingStatus(hours: WeekHours, now: Date, timeZone = AGENCY_TIME_ZONE): OpeningStatus {
  const { weekday, minutes } = localClock(now, timeZone);

  for (const [start, end] of hours[weekday] ?? []) {
    if (minutes >= toMinutes(start) && minutes < toMinutes(end)) return { open: true, closesAt: end };
  }

  const laterToday = (hours[weekday] ?? []).find(([start]) => toMinutes(start) > minutes);
  if (laterToday) return { open: false, opensAt: laterToday[0], opensDay: null };

  for (let offset = 1; offset <= 7; offset++) {
    const day = (weekday + offset) % 7;
    const first = hours[day]?.[0];
    if (first) return { open: false, opensAt: first[0], opensDay: day };
  }
  return { open: false, opensAt: null, opensDay: null };
}

/** "19:00" → "19 h", "12:30" → "12 h 30" (French style). */
export function frenchTime(time: string) {
  const [h, m] = time.split(":");
  return m === "00" ? `${Number(h)} h` : `${Number(h)} h ${m}`;
}
