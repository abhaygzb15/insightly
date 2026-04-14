/**
 * Client-side analytics utilities.
 * When the user changes the time-range filter after data is already loaded,
 * we filter & recompute locally instead of re-scraping — instant response.
 */

import type { AnalyticsData, ReviewData, StarCount, SentimentPoint, VolumePoint, RatingPoint } from '../api/client';

export const TIME_RANGE_DAYS: Record<string, number> = {
  '1w':  7,
  '1m':  30,
  '6m':  182,
  '1y':  365,
  '2y':  730,
};

export const TIME_RANGE_LABELS: Record<string, string> = {
  '1w': 'Last Week',
  '1m': 'Last Month',
  '6m': 'Last 6 Months',
  '1y': 'Last 1 Year',
  '2y': 'Last 2 Years',
};

/** YYYY-MM-DD string for (today - days) */
function cutoffDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function classifySentiment(rating: number): 'positive' | 'neutral' | 'negative' {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

/**
 * Instantly filter AnalyticsData to the given number of days.
 * Recomputes all numeric metrics; preserves clusters/insights/issues
 * (those don't change with time range — they're computed server-side on all data).
 */
export function filterAnalyticsByDays(data: AnalyticsData, days: number): AnalyticsData {
  const cutoff = cutoffDate(days);

  const filtered: ReviewData[] = data.reviews.filter(
    (r) => r.date && r.date !== 'N/A' && r.date >= cutoff
  );

  if (filtered.length === 0) {
    return {
      ...data,
      reviews:          [],
      total_reviews:    0,
      avg_rating:       0,
      positive_pct:     0,
      neutral_pct:      0,
      negative_pct:     0,
      star_counts:      Object.fromEntries(
        [1,2,3,4,5].map(s => [s.toString(), { count: 0, percentage: 0 }])
      ),
      sentiment_series: [],
      volume_series:    [],
      rating_series:    [],
    };
  }

  const total      = filtered.length;
  const ratingSum  = filtered.reduce((s, r) => s + r.rating, 0);
  const avgRating  = Math.round((ratingSum / total) * 100) / 100;

  const posCount = filtered.filter(r => r.sentiment === 'positive').length;
  const negCount = filtered.filter(r => r.sentiment === 'negative').length;
  const neuCount = total - posCount - negCount;

  // Star counts
  const starCounts: Record<string, StarCount> = {};
  for (let s = 1; s <= 5; s++) {
    const count = filtered.filter(r => r.rating === s).length;
    starCounts[s.toString()] = { count, percentage: Math.round(count / total * 100) };
  }

  // Filter pre-computed series by date range
  const sentimentSeries: SentimentPoint[] = data.sentiment_series.filter(p => p.date >= cutoff);
  const volumeSeries:    VolumePoint[]    = data.volume_series.filter(p => p.date >= cutoff);
  const ratingSeries:    RatingPoint[]    = data.rating_series.filter(p => p.date >= cutoff);

  return {
    ...data,
    reviews:          filtered,
    total_reviews:    total,
    avg_rating:       avgRating,
    positive_pct:     Math.round(posCount / total * 100),
    negative_pct:     Math.round(negCount / total * 100),
    neutral_pct:      Math.round(neuCount / total * 100),
    star_counts:      starCounts,
    sentiment_series: sentimentSeries,
    volume_series:    volumeSeries,
    rating_series:    ratingSeries,
  };
}
