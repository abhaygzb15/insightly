import { motion } from 'motion/react';
import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface AlertCardProps {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  time: string;
  delay?: number;
}

export function AlertCard({ type, title, description, time, delay = 0 }: AlertCardProps) {
  const config = {
    warning: {
      icon: AlertTriangle,
      color: 'from-amber-500/10 to-amber-600/10',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-600',
    },
    info: {
      icon: TrendingUp,
      color: 'from-blue-500/10 to-blue-600/10',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-600',
    },
    success: {
      icon: CheckCircle,
      color: 'from-emerald-500/10 to-emerald-600/10',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-600',
    },
  };

  const { icon: Icon, color, border, iconColor } = config[type];

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 glass rounded-xl border bg-gradient-to-br ${color} ${border} hover:shadow-lg transition-all cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm mb-1" style={{ fontWeight: 600 }}>{title}</h4>
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
    </motion.div>
  );
}
