import type { Review } from "@/data/types";

export type ScoreView = "global" | "controle";
export type StarBucket = 1 | 2 | 3 | 4 | 5;

export interface ScoreSummary {
  /** Simple average, 0–5. `null` when there are no reviews. */
  average: number | null;
  count: number;
  buckets: Record<StarBucket, number>;
}

/** Round to the nearest star; anything below 1.5 (including below 1) counts as 1★. */
export function bucketOf(rating: number): StarBucket {
  return Math.min(5, Math.max(1, Math.round(rating))) as StarBucket;
}

/** Reviews behind a score: the view (all vs verified) and optionally one staff member. */
export function reviewsForScore(reviews: Review[], view: ScoreView, collaboratorId?: string): Review[] {
  return reviews.filter(
    (review) =>
      (view === "global" || review.status === "controle") &&
      (!collaboratorId || review.collaboratorId === collaboratorId),
  );
}

export function summarize(reviews: Review[]): ScoreSummary {
  const buckets: Record<StarBucket, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const review of reviews) {
    buckets[bucketOf(review.rating)] += 1;
    total += review.rating;
  }
  return { average: reviews.length ? total / reviews.length : null, count: reviews.length, buckets };
}

/** One decimal, as displayed. 4.25 → 4.3. */
export const displayScore = (average: number) => Math.round(average * 10) / 10;

export type HeadingKey = "excellent" | "good" | "start";

/** Réputation heading: excellente ≥ 4,5 · bien jugée 4,0–4,4 · avec un bon début < 4,0 (on the displayed score). */
export function headingFor(average: number): HeadingKey {
  const shown = displayScore(average);
  if (shown >= 4.5) return "excellent";
  if (shown >= 4) return "good";
  return "start";
}

/** A score is public only once it has enough reviews (5–10, set by the company). */
export const isPublic = (count: number, threshold: number) => count >= threshold;
