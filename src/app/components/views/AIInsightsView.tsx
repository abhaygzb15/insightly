import { motion } from 'motion/react';
import { AIClusterCard } from '../AIClusterCard';
import { EmptyState } from '../EmptyState';
import { Sparkles, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { ClusterData, InsightData } from '../../../api/client';

function getInsightIcon(color: string) {
  if (color === 'rose')    return AlertCircle;
  if (color === 'emerald') return TrendingUp;
  return Brain;
}

interface AIInsightsViewProps {
  clusters?: ClusterData[];
  insights?: InsightData[];
  onClusterClick?: (clusterId: string, clusterTitle: string) => void;
}

export function AIInsightsView({ clusters, insights, onClusterClick }: AIInsightsViewProps) {
  const hasData = (clusters && clusters.length > 0) || (insights && insights.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl mb-2 flex items-center gap-3" style={{ fontWeight: 700 }}>
          <Sparkles className="w-7 h-7 text-purple-600" />
          AI-Powered Insights
        </h1>
        <p className="text-muted-foreground">Automated analysis and actionable recommendations</p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Sparkles}
          title="No Insights Yet"
          description="Analyze a Play Store app to get AI-generated clusters, trends, and actionable insights."
          hint="Paste a URL above → click Analyze"
        />
      ) : (
        <>
          {/* Key Insights */}
          {insights && insights.length > 0 && (
            <div>
              <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Key Insights</h2>
              <div className="grid grid-cols-1 gap-4">
                {insights.map((insight, index) => {
                  const Icon = getInsightIcon(insight.color);
                  return (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 sm:p-6 glass rounded-2xl border border-white/60 shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl shrink-0 bg-gradient-to-br ${
                          insight.color === 'rose'    ? 'from-rose-500/10 to-rose-600/10' :
                          insight.color === 'emerald' ? 'from-emerald-500/10 to-emerald-600/10' :
                          insight.color === 'blue'    ? 'from-blue-500/10 to-blue-600/10' :
                          'from-amber-500/10 to-amber-600/10'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            insight.color === 'rose'    ? 'text-rose-600' :
                            insight.color === 'emerald' ? 'text-emerald-600' :
                            insight.color === 'blue'    ? 'text-blue-600' :
                            'text-amber-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg mb-2" style={{ fontWeight: 600 }}>
                            {insight.title}
                          </h3>
                          <p className="text-muted-foreground text-sm sm:text-base">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clusters */}
          {clusters && clusters.length > 0 && (
            <div>
              <h2 className="text-xl mb-2" style={{ fontWeight: 700 }}>Review Clusters</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Click a cluster to explore its reviews
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clusters.map((cluster, index) => (
                  <AIClusterCard
                    key={cluster.title}
                    clusterId={cluster.id}
                    title={cluster.title}
                    reviewCount={cluster.review_count}
                    avgRating={cluster.avg_rating}
                    action={cluster.action}
                    color={cluster.color}
                    onClick={onClusterClick}
                    delay={index * 0.05}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
