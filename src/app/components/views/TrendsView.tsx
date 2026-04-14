import { motion } from 'motion/react';
import { SentimentChart } from '../SentimentChart';
import { EmptyState } from '../EmptyState';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SentimentPoint, VolumePoint, RatingPoint } from '../../../api/client';

interface TrendsViewProps {
  sentimentSeries?: SentimentPoint[];
  volumeSeries?:    VolumePoint[];
  ratingSeries?:    RatingPoint[];
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
};

export function TrendsView({ sentimentSeries, volumeSeries, ratingSeries }: TrendsViewProps) {
  const hasData = (volumeSeries && volumeSeries.length > 0) || (ratingSeries && ratingSeries.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl mb-2" style={{ fontWeight: 700 }}>Trend Analysis</h1>
        <p className="text-muted-foreground">Track changes in sentiment, ratings, and review volume</p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={TrendingUp}
          title="No Trend Data Yet"
          description="Analyze an app to visualize sentiment trends, review volume, and rating changes over time."
          hint="Paste a Play Store URL above → Analyze"
        />
      ) : (
        <>
          <SentimentChart data={sentimentSeries} />

          {/* Review Volume */}
          {volumeSeries && volumeSeries.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 glass rounded-2xl border border-white/60 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-xl mb-1" style={{ fontWeight: 700 }}>Review Volume</h3>
                <p className="text-sm text-muted-foreground">Total reviews received over time</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={volumeSeries}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="reviews" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Rating Over Time */}
          {ratingSeries && ratingSeries.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 glass rounded-2xl border border-white/60 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-xl mb-1" style={{ fontWeight: 700 }}>Average Rating Over Time</h3>
                <p className="text-sm text-muted-foreground">Track rating performance day by day</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={ratingSeries}>
                  <defs>
                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis domain={[1, 5]} stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="rating" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
