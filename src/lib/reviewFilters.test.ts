import { describe, expect, it } from "vitest";
import { getAgency, mainAgencyId } from "@/data/agencies";
import { getAgencyDataset } from "@/data/reviews";
import { applyFilters, countActiveFilters, emptyFilters, sameFilters, sortReviews } from "./reviewFilters";
import { bucketOf } from "./scoring";

const { reviews } = getAgencyDataset(getAgency(mainAgencyId)!);

describe("applyFilters", () => {
  it("keeps everything with no filter", () => {
    expect(applyFilters(reviews, emptyFilters)).toHaveLength(reviews.length);
  });

  it("type and source are independent axes", () => {
    const verifiedImports = applyFilters(reviews, { ...emptyFilters, type: "controle", source: "imported" });
    expect(verifiedImports.length).toBeGreaterThan(0);
    expect(verifiedImports.every((r) => r.source === "import_iso")).toBe(true);
    const internal = applyFilters(reviews, { ...emptyFilters, type: "non_controle", source: "opinion_system" });
    expect(internal.every((r) => r.source === "os_simple")).toBe(true);
  });

  it("panel note means that bucket and above, star rows mean exactly that bucket", () => {
    const atLeast4 = applyFilters(reviews, { ...emptyFilters, note: { stars: 4, exact: false } });
    expect(atLeast4.every((r) => bucketOf(r.rating) >= 4)).toBe(true);
    const exactly1 = applyFilters(reviews, { ...emptyFilters, note: { stars: 1, exact: true } });
    expect(exactly1.length).toBeGreaterThan(0);
    expect(exactly1.every((r) => r.rating < 1.5)).toBe(true);
  });

  it("products and criteria match any selected value", () => {
    const list = applyFilters(reviews, { ...emptyFilters, products: ["vente", "syndic"], criteria: ["conseil"] });
    expect(list.every((r) => ["vente", "syndic"].includes(r.product) && r.criteria.includes("conseil"))).toBe(true);
  });

  it("period uses days since the review", () => {
    expect(applyFilters(reviews, { ...emptyFilters, period: "week" }).every((r) => r.daysAgo < 7)).toBe(true);
  });

  it("collaborator keeps only their Opinion System reviews", () => {
    const list = applyFilters(reviews, { ...emptyFilters, collaboratorId: "juliette-martin" });
    expect(list.length).toBeGreaterThan(5);
    expect(list.every((r) => r.collaboratorId === "juliette-martin")).toBe(true);
  });
});

it("countActiveFilters counts one per chip", () => {
  expect(countActiveFilters(emptyFilters)).toBe(0);
  expect(
    countActiveFilters({ type: "controle", source: "opinion_system", note: { stars: 4, exact: false }, period: "week", products: ["vente"], criteria: ["conseil"], collaboratorId: "x" }),
  ).toBe(7);
});

it("sameFilters ignores selection order", () => {
  expect(sameFilters({ ...emptyFilters, products: ["vente", "achat"] }, { ...emptyFilters, products: ["achat", "vente"] })).toBe(true);
});

describe("sortReviews", () => {
  it("recent first by default, best and worst by rating", () => {
    const recent = sortReviews(reviews, "recent");
    expect(recent[0].daysAgo).toBeLessThanOrEqual(recent[recent.length - 1].daysAgo);
    const best = sortReviews(reviews, "best");
    expect(best[0].rating).toBeGreaterThanOrEqual(best[best.length - 1].rating);
    const worst = sortReviews(reviews, "worst");
    expect(worst[0].rating).toBeLessThanOrEqual(worst[1].rating);
  });
  it("verified first puts every contrôlé review before the others", () => {
    const sorted = sortReviews(reviews, "verified");
    const firstOther = sorted.findIndex((r) => r.status === "non_controle");
    expect(sorted.slice(firstOther).every((r) => r.status === "non_controle")).toBe(true);
  });
});
