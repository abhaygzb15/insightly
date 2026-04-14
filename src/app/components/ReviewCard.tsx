import { motion } from 'motion/react';
import { Star, ThumbsUp, Sparkles } from 'lucide-react';

interface ReviewCardProps {
  rating: number;
  author?: string;
  text: string;
  date: string;
  helpfulCount: number;
  appVersion?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  delay?: number;
  onGenerateReply?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const sentimentBorder = {
  positive: 'border-l-emerald-500',
  negative: 'border-l-rose-500',
  neutral:  'border-l-slate-400',
};

const sentimentBadge = {
  positive: 'bg-emerald-500/10 text-emerald-700',
  negative: 'bg-rose-500/10 text-rose-700',
  neutral:  'bg-slate-500/10 text-slate-600',
};

export function ReviewCard({
  rating,
  author = 'Anonymous',
  text,
  date,
  helpfulCount,
  appVersion,
  sentiment,
  delay = 0,
  onGenerateReply,
}: ReviewCardProps) {
  const initials = getInitials(author);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.005 }}
      className={`p-5 glass rounded-xl border border-white/60 border-l-4 ${sentimentBorder[sentiment]} hover:shadow-lg transition-all`}
    >
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-xs text-white" style={{ fontWeight: 700 }}>{initials}</span>
          </div>
          <div>
            <p className="text-sm" style={{ fontWeight: 600 }}>{author}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Review text */}
      <p className="text-sm leading-relaxed mb-4">{text}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Thumbs up */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{helpfulCount}</span>
          </div>

          {/* Version badge */}
          {appVersion && (
            <span className="px-2 py-0.5 bg-white/60 rounded-md text-xs border border-white/80" style={{ fontWeight: 500 }}>
              {appVersion}
            </span>
          )}

          {/* Sentiment badge */}
          <span className={`px-2 py-0.5 rounded-md text-xs ${sentimentBadge[sentiment]}`} style={{ fontWeight: 500 }}>
            {sentiment}
          </span>
        </div>

        {/* Reply button — always visible */}
        <motion.button
          onClick={onGenerateReply}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs shadow-md glow-primary shrink-0"
          style={{ fontWeight: 600 }}
        >
          <Sparkles className="w-3 h-3" />
          Reply
        </motion.button>
      </div>
    </motion.div>
  );
}
