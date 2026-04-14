import { motion } from 'motion/react';
import { ChevronRight, Star } from 'lucide-react';

interface AIClusterCardProps {
  clusterId?: string;
  title: string;
  reviewCount: number;
  avgRating: number;
  action: string;
  color: string;
  onClick?: (clusterId: string, clusterTitle: string) => void;
  delay?: number;
}

export function AIClusterCard({
  clusterId,
  title,
  reviewCount,
  avgRating,
  action,
  color,
  onClick,
  delay = 0,
}: AIClusterCardProps) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20',
    rose:    'from-rose-500/10 to-rose-600/10 border-rose-500/20',
    amber:   'from-amber-500/10 to-amber-600/10 border-amber-500/20',
    blue:    'from-blue-500/10 to-blue-600/10 border-blue-500/20',
  };

  const textColors: Record<string, string> = {
    emerald: 'text-emerald-600',
    rose:    'text-rose-600',
    amber:   'text-amber-600',
    blue:    'text-blue-600',
  };

  const handleClick = () => {
    if (onClick && clusterId) onClick(clusterId, title);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={handleClick}
      className="relative group cursor-pointer"
    >
      <div className={`p-5 glass rounded-xl border bg-gradient-to-br ${colorClasses[color] ?? colorClasses.blue} shadow-md hover:shadow-xl transition-all`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-base flex-1 pr-2" style={{ fontWeight: 600 }}>{title}</h4>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span style={{ fontWeight: 500 }}>{reviewCount}</span>
            <span>reviews</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span style={{ fontWeight: 600 }}>{avgRating}</span>
          </div>
        </div>

        {/* Action */}
        <div className={`flex items-center justify-between p-3 bg-white/40 rounded-lg ${textColors[color] ?? textColors.blue}`}>
          <span className="text-sm" style={{ fontWeight: 600 }}>{action}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
