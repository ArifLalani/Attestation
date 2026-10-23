import { describe, expect, it } from "vitest";
import { agencies } from "@/data/agencies";
import { frenchTime, localClock, openingStatus } from "./hours";

const hours = agencies[0].hours;
// Paris is UTC+2 in summer (CEST) and UTC+1 in winter (CET).
const paris = (iso: string) => new Date(iso);

describe("localClock", () => {
  it("reads the Paris weekday and time, not the machine's", () => {
    expect(localClock(paris("2026-10-19T07:30:00Z"))).toEqual({ weekday: 0, minutes: 9 * 60 + 30 }); // Mon 9:30 CEST
    expect(localClock(paris("2026-12-06T23:30:00Z"))).toEqual({ weekday: 0, minutes: 30 }); // Mon 0:30 CET
  });
});

describe("openingStatus", () => {
  it("is open during the day and says when it closes", () => {
    expect(openingStatus(hours, paris("2026-10-21T10:00:00Z"))).toEqual({ open: true, closesAt: "19:00" });
  });
  it("is closed at lunch on Saturday and reopens the same day", () => {
    expect(openingStatus(hours, paris("2026-10-24T11:00:00Z"))).toEqual({ open: false, opensAt: "14:00", opensDay: null });
  });
  it("is closed on Sunday and reopens Monday", () => {
    expect(openingStatus(hours, paris("2026-10-25T10:00:00Z"))).toEqual({ open: false, opensAt: "09:00", opensDay: 0 });
  });
  it("after closing on a weekday reopens the next morning", () => {
    expect(openingStatus(hours, paris("2026-10-21T17:30:00Z"))).toEqual({ open: false, opensAt: "09:00", opensDay: 3 });
  });
  it("before opening reopens later today", () => {
    expect(openingStatus(hours, paris("2026-10-21T05:00:00Z"))).toEqual({ open: false, opensAt: "09:00", opensDay: null });
  });
});

it("frenchTime", () => {
  expect(frenchTime("19:00")).toBe("19 h");
  expect(frenchTime("12:30")).toBe("12 h 30");
});
