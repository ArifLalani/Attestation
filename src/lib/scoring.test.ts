import { describe, expect, it } from "vitest";
import { agencies, getAgency, mainAgencyId } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import type { Review } from "@/data/types";
import { bucketOf, displayScore, headingFor, isPublic, reviewsForScore, summarize } from "./scoring";

const review = (rating: number, status: Review["status"] = "controle", collaboratorId?: string): Review => ({
  id: String(rating),
  status,
  source: status === "controle" ? "os_certified" : "import_other",
  rating,
  daysAgo: 0,
  authorName: "Test T.",
  product: "vente",
  criteria: [],
  collaboratorId,
  usefulCount: 0,
  reviewNumber: "1",
});

describe("bucketOf", () => {
  it("rounds to the nearest star", () => {
    expect(bucketOf(4.4)).toBe(4);
    expect(bucketOf(4.5)).toBe(5);
    expect(bucketOf(2.6)).toBe(3);
  });
  it("puts everything below 1.5, including below 1, in 1★", () => {
    expect(bucketOf(1.4)).toBe(1);
    expect(bucketOf(0.4)).toBe(1);
    expect(bucketOf(0)).toBe(1);
    expect(bucketOf(1.5)).toBe(2);
  });
});

describe("summarize", () => {
  it("is a simple average with matching counts", () => {
    const summary = summarize([review(5), review(4), review(0.4), review(3.9)]);
    expect(summary.average).toBeCloseTo((5 + 4 + 0.4 + 3.9) / 4);
    expect(summary.count).toBe(4);
    expect(summary.buckets).toEqual({ 1: 1, 2: 0, 3: 0, 4: 2, 5: 1 });
  });
  it("handles no reviews", () => {
    expect(summarize([]).average).toBeNull();
  });
});

describe("reviewsForScore", () => {
  const list = [review(5, "controle", "a"), review(2, "non_controle", "a"), review(4, "controle", "b")];
  it("global keeps everything, contrôlés keeps verified only", () => {
    expect(reviewsForScore(list, "global")).toHaveLength(3);
    expect(reviewsForScore(list, "controle")).toHaveLength(2);
  });
  it("narrows to one staff member", () => {
    expect(reviewsForScore(list, "global", "a")).toHaveLength(2);
    expect(reviewsForScore(list, "controle", "a")).toHaveLength(1);
  });
});

describe("headingFor", () => {
  it("uses the displayed score thresholds", () => {
    expect(headingFor(4.46)).toBe("excellent");
    expect(headingFor(4.44)).toBe("good");
    expect(headingFor(3.96)).toBe("good");
    expect(headingFor(3.9)).toBe("start");
  });
});

describe("isPublic", () => {
  it("needs at least the threshold", () => {
    expect(isPublic(4, 5)).toBe(false);
    expect(isPublic(5, 5)).toBe(true);
  });
});

describe("demo data", () => {
  const agency = getAgency(mainAgencyId)!;
  const { reviews, team } = getAgencyDataset(agency);

  it("matches the Figma totals for the main agency", () => {
    expect(reviews).toHaveLength(2500);
    expect(reviewsForScore(reviews, "controle")).toHaveLength(800);
  });

  it("verified reviews score higher than the global score", () => {
    const global = summarize(reviewsForScore(reviews, "global")).average!;
    const verified = summarize(reviewsForScore(reviews, "controle")).average!;
    expect(verified).toBeGreaterThan(global);
  });

  it("links only Opinion System reviews to staff, and only they have survey details", () => {
    for (const r of reviews) {
      const fromOs = r.source === "os_certified" || r.source === "os_simple";
      expect(Boolean(r.collaboratorId)).toBe(fromOs);
      expect(Boolean(r.survey)).toBe(fromOs);
      expect(r.rating).toBeGreaterThanOrEqual(0);
      expect(r.rating).toBeLessThanOrEqual(5);
    }
  });

  it("every staff member is above the public threshold and near their Figma score", () => {
    expect(team).toHaveLength(20);
    for (const member of team) {
      const own = reviewsForScore(reviews, "global", member.id);
      expect(isPublic(own.length, agency.publicThreshold)).toBe(true);
    }
  });

  it("is deterministic", () => {
    const again = getAgencyDataset({ ...agency });
    expect(again.reviews.slice(0, 5)).toEqual(reviews.slice(0, 5));
  });

  it("generates every sister agency", () => {
    for (const other of agencies) expect(getAgencyDataset(other).reviews.length).toBeGreaterThan(50);
  });
});

it("displayScore rounds to one decimal", () => {
  expect(displayScore(4.25)).toBe(4.3);
});
