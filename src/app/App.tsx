import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Star, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { SentimentChart } from './components/SentimentChart';
import { RatingBreakdown } from './components/RatingBreakdown';
import { AIInsightCard } from './components/AIInsightCard';
import { AIClusterCard } from './components/AIClusterCard';
import { IssueCard } from './components/IssueCard';
import { ReviewsView } from './components/views/ReviewsView';
import { AIInsightsView } from './components/views/AIInsightsView';
import { TrendsView } from './components/views/TrendsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ExportView } from './components/views/ExportView';
import { AnalyticsData, api, pollJob, JobResponse } from '../api/client';
import { filterAnalyticsByDays, TIME_RANGE_DAYS, TIME_RANGE_LABELS } from '../utils/analytics';

// ── Loading overlay ───────────────────────────────────────────────────────────

function LoadingOverlay({ status }: { status: JobResponse }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md glass rounded-3xl border-2 border-white/40 shadow-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl" style={{ fontWeight: 700 }}>Analyzing Reviews</h3>
            <p className="text-sm text-muted-foreground">{status.message}</p>
          </div>
        </div>
        <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{status.progress}%</p>
      </motion.div>
    </div>
  );
}

// ── Overview empty state ──────────────────────────────────────────────────────

function OverviewEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center mb-6"
      >
        <Sparkles className="w-10 h-10 text-indigo-400" />
      </motion.div>

      <h2 className="text-2xl sm:text-3xl mb-3" style={{ fontWeight: 700 }}>
        Paste an App Link to Get Started
      </h2>
      <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
        Enter a Google Play Store URL or package name in the search bar above,
        choose a time range, then click{' '}
        <span className="text-indigo-600 font-semibold">Analyze</span> to see
        real reviews, AI clusters, trends, and actionable insights.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
        <div className="px-4 py-3 bg-white/50 rounded-xl border border-white/70">
          <p className="font-medium text-foreground mb-1">URL format</p>
          <code className="text-indigo-600 text-xs">play.google.com/store/apps/details?id=…</code>
        </div>
        <div className="px-4 py-3 bg-white/50 rounded-xl border border-white/70">
          <p className="font-medium text-foreground mb-1">Package name</p>
          <code className="text-indigo-600 text-xs">com.whatsapp</code>
        </div>
      </div>
    </motion.div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toClusterProps(c: AnalyticsData['clusters'][0]) {
  return {
    clusterId:   c.id,
    title:       c.title,
    reviewCount: c.review_count,
    avgRating:   c.avg_rating,
    action:      c.action,
    color:       c.color,
  };
}

function toIssueProps(i: AnalyticsData['key_issues'][0]) {
  return {
    title:       i.title,
    description: i.description,
    mentions:    i.mentions,
  };
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeView,    setActiveView]    = useState('overview');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [timeRange,     setTimeRange]     = useState('1m');
  const [originalData,  setOriginalData]  = useState<AnalyticsData | null>(null);
  const [displayData,   setDisplayData]   = useState<AnalyticsData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<JobResponse | null>(null);
  const [scrapeError,   setScrapeError]   = useState<string | null>(null);

  // Cluster filter — set when user clicks a cluster card
  const [clusterFilter, setClusterFilter] = useState<{ id: string; title: string } | null>(null);

  // ── Time range change — instant client-side filter ──────────────────────────
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    if (originalData) {
      const days = TIME_RANGE_DAYS[range] ?? 30;
      setDisplayData(filterAnalyticsByDays(originalData, days));
    }
  };

  // ── Scrape new app ──────────────────────────────────────────────────────────
  const handleAnalyze = async (appUrl: string) => {
    setScrapeError(null);
    setClusterFilter(null);
    setLoadingStatus({ status: 'pending', progress: 0, message: 'Starting…' });

    try {
      const { job_id } = await api.startScrape({
        app_url:    appUrl,
        time_range: timeRange,
        country:    'in',
      });
      const result = await pollJob(job_id, (s) => setLoadingStatus(s));
      setOriginalData(result);
      // Apply current time range filter immediately
      const days = TIME_RANGE_DAYS[timeRange] ?? 30;
      setDisplayData(filterAnalyticsByDays(result, days));
    } catch (e: any) {
      setScrapeError(e.message ?? 'Something went wrong');
    } finally {
      setLoadingStatus(null);
    }
  };

  // ── Cluster click — navigate to Reviews filtered by cluster ────────────────
  const handleClusterClick = (clusterId: string, clusterTitle: string) => {
    setClusterFilter({ id: clusterId, title: clusterTitle });
    setActiveView('reviews');
  };

  const data = displayData;

  // ── View renderer ───────────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeView) {
      case 'reviews':
        return (
          <ReviewsView
            reviews={data?.reviews}
            clusterFilter={clusterFilter}
            onClearClusterFilter={() => setClusterFilter(null)}
          />
        );

      case 'ai-insights':
        return (
          <AIInsightsView
            clusters={data?.clusters}
            insights={data?.key_insights}
            onClusterClick={handleClusterClick}
          />
        );

      case 'trends':
        return (
          <TrendsView
            sentimentSeries={data?.sentiment_series}
            volumeSeries={data?.volume_series}
            ratingSeries={data?.rating_series}
          />
        );

      case 'analytics':
        return (
          <AnalyticsView
            starCounts={data?.star_counts}
            avgRating={data?.avg_rating}
            totalReviews={data?.total_reviews}
            topKeywords={data?.top_keywords}
            versionData={data?.version_data}
          />
        );

      case 'export':
        return <ExportView reviews={data?.reviews} appId={data?.app_id} />;

      case 'overview':
      default:
        if (!data) return <OverviewEmptyState />;

        const clusters = data.clusters.map(toClusterProps);
        const issues   = data.key_issues.map(toIssueProps);

        return (
          <div className="space-y-6">
            {/* Stats — 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <StatCard
                title="Total Reviews"
                value={data.total_reviews.toLocaleString()}
                icon={MessageSquare}
                delay={0.1}
              />
              <StatCard
                title="Avg Rating"
                value={data.avg_rating.toFixed(1)}
                icon={Star}
                delay={0.15}
              />
              <StatCard
                title="Positive"
                value={`${data.positive_pct}%`}
                icon={TrendingUp}
                delay={0.2}
              />
              <StatCard
                title="Period"
                value={TIME_RANGE_LABELS[timeRange]?.replace('Last ', '') ?? timeRange}
                icon={Calendar}
                delay={0.25}
              />
            </div>

            {/* Top insight — button navigates to AI Insights */}
            <AIInsightCard
              insight={data.key_insights?.[0]}
              onViewAnalysis={() => setActiveView('ai-insights')}
            />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <SentimentChart data={data.sentiment_series} />
              </div>
              <RatingBreakdown
                starCounts={data.star_counts}
                avgRating={data.avg_rating}
                totalReviews={data.total_reviews}
              />
            </div>

            {/* Clusters */}
            {clusters.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl mb-1" style={{ fontWeight: 700 }}>AI Review Clusters</h2>
                    <p className="text-sm text-muted-foreground">Click a cluster to explore its reviews</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('ai-insights')}
                    className="px-3 sm:px-4 py-2 bg-white/60 rounded-xl border border-white/80 text-xs sm:text-sm hover:bg-white/80 transition-all"
                    style={{ fontWeight: 500 }}
                  >View All</motion.button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clusters.slice(0, 4).map((c) => (
                    <AIClusterCard
                      key={c.title}
                      {...c}
                      onClick={handleClusterClick}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Issues */}
            {issues.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl mb-1" style={{ fontWeight: 700 }}>Key Issues</h2>
                  <p className="text-sm text-muted-foreground">Ranked by frequency from negative reviews</p>
                </div>
                <div className="space-y-3">
                  {issues.map((issue, i) => (
                    <IssueCard key={issue.title} {...issue} delay={0.9 + i * 0.05} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          setSidebarOpen(false);
          // Clear cluster filter when leaving reviews tab manually
          if (v !== 'reviews') setClusterFilter(null);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-72 min-w-0">
        <Header
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          onAnalyze={handleAnalyze}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {scrapeError && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 text-sm">
            ⚠️ {scrapeError} — Make sure the backend is running:
            <code className="ml-1 text-xs bg-rose-100 px-1 rounded">cd backend && uvicorn main:app --reload</code>
          </div>
        )}

        <main className="p-4 sm:p-6">{renderView()}</main>
      </div>

      {loadingStatus && <LoadingOverlay status={loadingStatus} />}
    </div>
  );
}
