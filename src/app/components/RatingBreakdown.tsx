import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { StarCount } from '../../api/client';

const MOCK_RATINGS = [
  { stars: 5, count: 1847, percentage: 62 },
  { stars: 4, count: 543,  percentage: 18 },
  { stars: 3, count: 298,  percentage: 10 },
  { stars: 2, count: 178,  percentage: 6  },
  { stars: 1, count: 134,  percentage: 4  },
];

interface RatingBreakdownProps {
  starCounts?: Record<string, StarCount>;
  avgRating?: number;
  totalReviews?: number;
}

export function RatingBreakdown({ starCounts, avgRating, totalReviews }: RatingBreakdownProps) {
  const ratings = starCounts
    ? [5, 4, 3, 2, 1].map(s => ({
        stars:      s,
        count:      starCounts[String(s)]?.count      ?? 0,
        percentage: starCounts[String(s)]?.percentage ?? 0,
      }))
    : MOCK_RATINGS;

  const displayAvg   = avgRating   ?? 4.3;
  const displayTotal = totalReviews ?? 3000;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="p-6 glass rounded-2xl border border-white/60 shadow-lg"
    >
      <div className="mb-6">
        <h3 className="text-xl mb-1" style={{ fontWeight: 700 }}>Rating Distribution</h3>
        <p className="text-sm text-muted-foreground">How users rate your app</p>
      </div>

      <div className="space-y-4">
        {ratings.map((rating, index) => (
          <motion.div
            key={rating.stars}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="flex items-center gap-4 group"
          >
            {/* Stars */}
            <div className="flex items-center gap-1 w-24">
              {Array.from({ length: rating.stars }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              {Array.from({ length: 5 - rating.stars }).map((_, i) => (
                <Star key={i + rating.stars} className="w-3.5 h-3.5 text-gray-300" />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="flex-1 relative h-8 bg-white/40 rounded-xl overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rating.percentage}%` }}
                transition={{ delay: 0.6 + index * 0.05, duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl group-hover:shadow-lg transition-shadow"
                style={{ boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)' }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className="text-sm text-white mix-blend-difference" style={{ fontWeight: 600 }}>
                  {rating.percentage}%
                </span>
              </div>
            </div>

            {/* Count */}
            <div className="w-20 text-right">
              <span className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>
                {rating.count.toLocaleString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Average Rating */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 pt-6 border-t border-white/40 flex items-center justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl" style={{ fontWeight: 700 }}>{displayAvg.toFixed(1)}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(displayAvg) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
          <span className="text-3xl" style={{ fontWeight: 700 }}>{displayTotal.toLocaleString()}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
