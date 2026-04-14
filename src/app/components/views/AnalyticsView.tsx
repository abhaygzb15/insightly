import { motion } from 'motion/react';
import { RatingBreakdown } from '../RatingBreakdown';
import { EmptyState } from '../EmptyState';
import { BarChart3 } from 'lucide-react';
import { StarCount, VersionData } from '../../../api/client';

interface AnalyticsViewProps {
  starCounts?:   Record<string, StarCount>;
  avgRating?:    number;
  totalReviews?: number;
  topKeywords?:  unknown[];
  versionData?:  VersionData[];
}

export function AnalyticsView({
  starCounts, avgRating, totalReviews, versionData,
}: AnalyticsViewProps) {
  const hasData = totalReviews != null && totalReviews > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl mb-2" style={{ fontWeight: 700 }}>Advanced Analytics</h1>
        <p className="text-muted-foreground">Deep dive into review metrics and patterns</p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No Data Yet"
          description="Analyze an app to see rating distribution and version performance."
          hint="Paste a Play Store URL above → Analyze"
        />
      ) : (
        <>
          <RatingBreakdown
            starCounts={starCounts}
            avgRating={avgRating}
            totalReviews={totalReviews}
          />

          {/* Version Performance */}
          {versionData && versionData.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 glass rounded-2xl border border-white/60 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-xl mb-1" style={{ fontWeight: 700 }}>Version Performance</h3>
                <p className="text-sm text-muted-foreground">Review metrics by app version</p>
              </div>
              <div className="space-y-3">
                {versionData.map((v, i) => (
                  <motion.div
                    key={v.version}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base mb-0.5" style={{ fontWeight: 600 }}>{v.version}</p>
                        <p className="text-sm text-muted-foreground">{v.reviews.toLocaleString()} reviews</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-xl sm:text-2xl" style={{ fontWeight: 700 }}>{v.rating.toFixed(1)}★</p>
                        <div className="hidden sm:block w-28 h-2 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            style={{ width: `${(v.rating / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
