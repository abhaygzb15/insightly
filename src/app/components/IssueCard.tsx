import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface IssueCardProps {
  title: string;
  description: string;
  mentions: number;
  delay?: number;
}

export function IssueCard({ title, description, mentions, delay = 0 }: IssueCardProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ x: 4 }}
      className="p-4 glass rounded-xl border border-white/60 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4 text-rose-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base mb-1" style={{ fontWeight: 600 }}>{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Mentions count — right side */}
        <div className="shrink-0 text-right pl-4">
          <p className="text-2xl" style={{ fontWeight: 700 }}>{mentions}</p>
          <p className="text-xs text-muted-foreground">mentions</p>
        </div>
      </div>
    </motion.div>
  );
}
