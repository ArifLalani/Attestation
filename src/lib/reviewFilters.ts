import type { Criterion, Product, Review, ReviewStatus } from "@/data/types";
import { bucketOf, type StarBucket } from "./scoring";

export type Period = "today" | "week" | "month" | "year";

/** Review list filters, shared by the Avis section and the Réputation star rows. */
export interface ReviewFilters {
  type?: ReviewStatus;
  source?: "opinion_system" | "imported";
  /** Filter panel: that bucket and above (">4★"). Réputation star rows: exactly that bucket. */
  note?: { stars: StarBucket; exact: boolean };
  period?: Period;
  products: Product[];
  criteria: Criterion[];
  collaboratorId?: string;
}

export const emptyFilters: ReviewFilters = { products: [], criteria: [] };

const periodDays: Record<Period, number> = { today: 1, week: 7, month: 30, year: 365 };

export function matchesFilters(review: Review, filters: ReviewFilters): boolean {
  if (filters.type && review.status !== filters.type) return false;
  if (filters.source) {
    const fromOs = review.source === "os_certified" || review.source === "os_simple";
    if ((filters.source === "opinion_system") !== fromOs) return false;
  }
  if (filters.note) {
    const bucket = bucketOf(review.rating);
    if (filters.note.exact ? bucket !== filters.note.stars : bucket < filters.note.stars) return false;
  }
  if (filters.period && review.daysAgo >= periodDays[filters.period]) return false;
  if (filters.products.length && !filters.products.includes(review.product)) return false;
  if (filters.criteria.length && !review.criteria.some((criterion) => filters.criteria.includes(criterion))) return false;
  if (filters.collaboratorId && review.collaboratorId !== filters.collaboratorId) return false;
  return true;
}

export const applyFilters = (reviews: Review[], filters: ReviewFilters) => reviews.filter((review) => matchesFilters(review, filters));

/** One per chip: each single-choice group counts 1, each product or criterion counts 1. */
export function countActiveFilters(filters: ReviewFilters): number {
  return (
    [filters.type, filters.source, filters.note, filters.period, filters.collaboratorId].filter(Boolean).length +
    filters.products.length +
    filters.criteria.length
  );
}

export function sameFilters(a: ReviewFilters, b: ReviewFilters) {
  const key = (f: ReviewFilters) =>
    JSON.stringify({ ...f, products: [...f.products].sort(), criteria: [...f.criteria].sort() });
  return key(a) === key(b);
}

export type ReviewSort = "recent" | "oldest" | "best" | "worst" | "useful" | "verified";

export function sortReviews(reviews: Review[], sort: ReviewSort): Review[] {
  const byRecent = (a: Review, b: Review) => a.daysAgo - b.daysAgo || a.id.localeCompare(b.id);
  const sorted = [...reviews];
  switch (sort) {
    case "recent":
      return sorted.sort(byRecent);
    case "oldest":
      return sorted.sort((a, b) => -byRecent(a, b));
    case "best":
      return sorted.sort((a, b) => b.rating - a.rating || byRecent(a, b));
    case "worst":
      return sorted.sort((a, b) => a.rating - b.rating || byRecent(a, b));
    case "useful":
      return sorted.sort((a, b) => b.usefulCount - a.usefulCount || byRecent(a, b));
    case "verified":
      return sorted.sort((a, b) => Number(b.status === "controle") - Number(a.status === "controle") || byRecent(a, b));
  }
}
