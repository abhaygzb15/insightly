import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  hint?: string;
}

export function EmptyState({ icon: Icon, title, description, hint }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-600/15 border border-indigo-500/20 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
      </div>
      <h3 className="text-xl sm:text-2xl mb-2" style={{ fontWeight: 700 }}>{title}</h3>
      <p className="text-muted-foreground max-w-sm leading-relaxed mb-4">{description}</p>
      {hint && (
        <div className="px-4 py-2 bg-white/50 rounded-xl border border-white/70 text-sm text-muted-foreground">
          {hint}
        </div>
      )}
    </motion.div>
  );
}
