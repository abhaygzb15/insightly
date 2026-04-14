import { motion } from 'motion/react';
import { AlertTriangle, Sparkles, TrendingDown } from 'lucide-react';
import { InsightData } from '../../api/client';

interface AIInsightCardProps {
  insight?: InsightData;
  onViewAnalysis?: () => void;
}

export function AIInsightCard({ insight, onViewAnalysis }: AIInsightCardProps) {
  const title = insight?.title ?? 'Performance Issues Spike Detected';
  const description = insight?.description
    ?? 'Paste a Play Store URL above and click Analyze to get real AI-powered insights from your actual reviews.';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="relative group"
    >
      {/* Animated glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded-2xl blur-xl glow-accent animate-pulse" />

      <div className="relative p-6 glass rounded-2xl border-2 border-purple-500/30 shadow-xl">
        {/* Badge row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs text-purple-700" style={{ fontWeight: 600 }}>AI Insight</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>

        {/* Main insight */}
        <div className="mb-4">
          <h3 className="text-xl mb-2 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <TrendingDown className="w-5 h-5 text-rose-500" />
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* CTA — navigates to AI Insights view */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewAnalysis}
          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg glow-primary"
          style={{ fontWeight: 600 }}
        >
          View Detailed Analysis →
        </motion.button>
      </div>
    </motion.div>
  );
}
