import { describe, expect, it } from "vitest";
import { agencies } from "@/data/agencies";
import { openingStatus } from "./hours";
import { frenchHolidays, specialDaysAround, upcomingSpecialDays } from "./specialHours";

const hours = agencies[0].hours;

describe("frenchHolidays", () => {
  it("places the Easter-based holidays (Easter 2026 is on 5 April)", () => {
    const byName = Object.fromEntries(frenchHolidays(2026).map((day) => [day.name, day.date]));
    expect(byName.lundiPaques).toBe("2026-04-06");
    expect(byName.ascension).toBe("2026-05-14");
    expect(byName.lundiPentecote).toBe("2026-05-25");
    expect(byName.noel).toBe("2026-12-25");
    expect(frenchHolidays(2026)).toHaveLength(11);
  });
});

describe("special days in the opening status", () => {
  it("is closed on Christmas Day and opens again on Saturday", () => {
    const now = new Date("2026-12-25T10:00:00Z"); // Friday 11:00 in Paris
    expect(openingStatus(hours, now, undefined, specialDaysAround(now))).toEqual({ open: false, opensAt: "09:00", opensDay: 5 });
  });

  it("closes at 16 h on Christmas Eve", () => {
    const now = new Date("2026-12-24T10:00:00Z"); // Thursday 11:00 in Paris
    expect(openingStatus(hours, now, undefined, specialDaysAround(now))).toEqual({ open: true, closesAt: "16:00" });
  });

  it("without special days, keeps the usual week", () => {
    expect(openingStatus(hours, new Date("2026-12-25T10:00:00Z"))).toEqual({ open: true, closesAt: "19:00" });
  });
});

describe("upcomingSpecialDays", () => {
  it("lists what changes in the next 120 days", () => {
    const list = upcomingSpecialDays(hours, new Date("2026-11-18T10:00:00Z"));
    expect(list.map((day) => day.date)).toEqual(["2026-12-24", "2026-12-25", "2026-12-31", "2027-01-01"]);
  });

  it("skips a holiday on a day already closed (Toussaint 2026 is a Sunday)", () => {
    const list = upcomingSpecialDays(hours, new Date("2026-10-26T10:00:00Z"), 20);
    expect(list.map((day) => day.date)).toEqual(["2026-11-11"]);
  });
});
