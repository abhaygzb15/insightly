import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative group"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-600/0 group-hover:from-indigo-500/10 group-hover:to-purple-600/10 rounded-2xl transition-all duration-300" />

      <div className="relative p-5 sm:p-6 glass rounded-2xl border border-white/60 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 shrink-0">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-sm text-muted-foreground" style={{ fontWeight: 500 }}>{title}</span>
        </div>

        <h3 className="text-3xl sm:text-4xl tracking-tight" style={{ fontWeight: 700 }}>{value}</h3>
      </div>
    </motion.div>
  );
}
