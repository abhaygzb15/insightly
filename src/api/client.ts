// API types matching backend analytics.py output

export interface ReviewData {
  date: string;
  datetime: string;
  rating: number;
  author: string;
  thumbs_up: number;
  review: string;
  app_version: string;
  reply: string;
  replied_at: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  cluster_id?: string;
}

export interface ClusterData {
  id: string;
  title: string;
  review_count: number;
  avg_rating: number;
  trend: 'up' | 'down' | 'stable';
  trend_value: string;
  action: string;
  color: string;
}

export interface InsightData {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  color: 'rose' | 'emerald' | 'amber' | 'blue';
}

export interface IssueData {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  mentions: number;
}

export interface StarCount {
  count: number;
  percentage: number;
}

export interface SentimentPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface VolumePoint {
  date: string;
  reviews: number;
}

export interface RatingPoint {
  date: string;
  rating: number;
}

export interface KeywordData {
  keyword: string;
  mentions: number;
}

export interface VersionData {
  version: string;
  reviews: number;
  rating: number;
}

export interface AnalyticsData {
  app_id: string;
  total_reviews: number;
  avg_rating: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  star_counts: Record<string, StarCount>;
  sentiment_series: SentimentPoint[];
  volume_series: VolumePoint[];
  rating_series: RatingPoint[];
  top_keywords: KeywordData[];
  version_data: VersionData[];
  reviews: ReviewData[];
  clusters: ClusterData[];
  key_insights: InsightData[];
  key_issues: IssueData[];
  period: string;
  country: string;
}

export type JobStatus = 'pending' | 'running' | 'done' | 'error';

export interface JobResponse {
  status: JobStatus;
  progress: number;
  message: string;
  result?: AnalyticsData;
  error?: string;
}

// ── API client ────────────────────────────────────────────────────────────────

export const api = {
  async startScrape(params: {
    app_url: string;
    time_range: string;
    country: string;
    lang?: string;
  }): Promise<{ job_id: string }> {
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: 'en', ...params }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? `HTTP ${res.status}`);
    }
    return res.json();
  },

  async getStatus(jobId: string): Promise<JobResponse> {
    const res = await fetch(`/api/status/${jobId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async generateReply(review: string, rating: number, tone: string): Promise<string> {
    const res = await fetch('/api/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review, rating, tone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.reply;
  },
};

// Helper: poll until done or error
export async function pollJob(
  jobId: string,
  onProgress: (status: JobResponse) => void,
  intervalMs = 2000
): Promise<AnalyticsData> {
  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      try {
        const status = await api.getStatus(jobId);
        onProgress(status);
        if (status.status === 'done' && status.result) {
          clearInterval(timer);
          resolve(status.result);
        } else if (status.status === 'error') {
          clearInterval(timer);
          reject(new Error(status.error ?? 'Scraping failed'));
        }
      } catch (e) {
        clearInterval(timer);
        reject(e);
      }
    }, intervalMs);
  });
}
