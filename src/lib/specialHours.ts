import { addDays, calendarDay as day, isoDate, localDay, weekdayOf } from "./hours";

/** A day whose hours differ from the usual week: a public holiday, reduced hours, or a closure. */
export interface SpecialDay {
  /** "YYYY-MM-DD", in the agency's time zone. */
  date: string;
  kind: "holiday" | "reduced" | "closure";
  /** Message key under Hours.special.names. */
  name: string;
  /** Opening ranges that day; empty = closed. */
  ranges: [string, string][];
}

/** Easter Sunday (anonymous Gregorian algorithm). */
function easter(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const date = ((h + l - 7 * m + 114) % 31) + 1;
  return day(year, month, date);
}

/** The eleven French public holidays of a year. */
export function frenchHolidays(year: number): SpecialDay[] {
  const e = easter(year);
  const list: [Date, string][] = [
    [day(year, 1, 1), "jourAn"],
    [addDays(e, 1), "lundiPaques"],
    [day(year, 5, 1), "feteTravail"],
    [day(year, 5, 8), "victoire1945"],
    [addDays(e, 39), "ascension"],
    [addDays(e, 50), "lundiPentecote"],
    [day(year, 7, 14), "feteNationale"],
    [day(year, 8, 15), "assomption"],
    [day(year, 11, 1), "toussaint"],
    [day(year, 11, 11), "armistice"],
    [day(year, 12, 25), "noel"],
  ];
  return list.map(([date, name]) => ({ date: isoDate(date), kind: "holiday", name, ranges: [] }));
}

/**
 * The agency's own exceptions (demo, the same for every agency): shorter days on Christmas Eve and New Year's Eve,
 * and a week closed in August. Public holidays win over them.
 */
function agencyExceptions(year: number): SpecialDay[] {
  const summer: SpecialDay[] = Array.from({ length: 7 }, (_, index) => ({ date: isoDate(addDays(day(year, 8, 10), index)), kind: "closure", name: "conges", ranges: [] }));
  return [
    { date: isoDate(day(year, 12, 24)), kind: "reduced", name: "veilleNoel", ranges: [["09:00", "16:00"]] },
    { date: isoDate(day(year, 12, 31)), kind: "reduced", name: "saintSylvestre", ranges: [["09:00", "16:00"]] },
    ...summer,
  ];
}

/** Every special day of these years, by date (a holiday wins over the agency's own exception). */
export function specialDays(years: number[]): Map<string, SpecialDay> {
  const map = new Map<string, SpecialDay>();
  for (const year of years) for (const special of agencyExceptions(year)) map.set(special.date, special);
  for (const year of years) for (const special of frenchHolidays(year)) map.set(special.date, special);
  return map;
}

/** The special days around now (this year and the next), for the opening status. */
export function specialDaysAround(now: Date) {
  const year = localDay(now).getUTCFullYear();
  return specialDays([year, year + 1]);
}

/** The special days of the coming `days` days that change something (a holiday on a day already closed is left out). */
export function upcomingSpecialDays(usual: [string, string][][], now: Date, days = 120): SpecialDay[] {
  const today = localDay(now);
  const map = specialDaysAround(now);
  const out: SpecialDay[] = [];
  for (let offset = 0; offset < days; offset++) {
    const date = addDays(today, offset);
    const special = map.get(isoDate(date));
    if (!special) continue;
    const regular = usual[weekdayOf(date)] ?? [];
    if (!regular.length && !special.ranges.length) continue;
    out.push(special);
  }
  return out;
}
