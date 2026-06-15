export type RatingBucket = 1 | 2 | 3 | 4 | 5;

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface RatingSummary {
  average: number;
  count: number;
  distribution: RatingDistribution;
}

const EMPTY_DISTRIBUTION: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

export function roundRatingAverage(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeRatingDistribution(ratings: number[]): RatingDistribution {
  const distribution: RatingDistribution = { ...EMPTY_DISTRIBUTION };

  for (const rating of ratings) {
    if (rating >= 1 && rating <= 5) {
      distribution[rating as RatingBucket] += 1;
    }
  }

  return distribution;
}

export function computeRatingSummary(ratings: number[]): RatingSummary | null {
  if (ratings.length === 0) return null;

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return {
    average: roundRatingAverage(total / ratings.length),
    count: ratings.length,
    distribution: computeRatingDistribution(ratings),
  };
}

export function formatRatingAverage(average: number): string {
  return average.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
