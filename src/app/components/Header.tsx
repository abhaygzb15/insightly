import { useState } from 'react';
import { Calendar, ChevronDown, Link2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TIME_RANGES = [
  { value: '1w', label: 'Last Week' },
  { value: '1m', label: 'Last Month' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last 1 Year' },
  { value: '2y', label: 'Last 2 Years' },
];

interface HeaderProps {
  /** Controlled time range — parent drives this so filter is instant */
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onAnalyze: (appUrl: string) => void;
  onMenuClick?: () => void;
}

export function Header({ timeRange, onTimeRangeChange, onAnalyze, onMenuClick }: HeaderProps) {
  const [appUrl,       setAppUrl]       = useState('');
  const [showTimeMenu, setShowTimeMenu] = useState(false);

  const selectedLabel = TIME_RANGES.find(t => t.value === timeRange)?.label ?? 'Last Week';

  const handleAnalyze = () => {
    const trimmed = appUrl.trim();
    if (!trimmed) return;
    onAnalyze(trimmed);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-10 px-4 md:px-6 py-4 glass border-b border-white/40"
      style={{ boxShadow: '0 4px 24px rgba(79, 70, 229, 0.04)' }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white/40 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        {/* URL input */}
        <motion.div
          className="flex-1 relative group min-w-0"
          whileHover={{ scale: 1.005 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all pointer-events-none" />
          <div className="relative flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-white/80 rounded-2xl border border-white shadow-lg">
            <Link2 className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 shrink-0" />
            <input
              type="text"
              value={appUrl}
              onChange={e => setAppUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder="Paste Play Store URL or package name…"
              className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={!appUrl.trim()}
              className="px-4 md:px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg glow-primary disabled:opacity-40 disabled:cursor-not-allowed text-sm shrink-0"
              style={{ fontWeight: 600 }}
            >
              <span className="hidden sm:inline">Analyze</span>
              <span className="sm:hidden">Go</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Time Range — instant client-side filter when data is loaded */}
        <div className="relative shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTimeMenu(p => !p)}
            className="flex items-center gap-2 px-3 md:px-4 py-3 bg-white/60 rounded-xl border border-white/80 hover:bg-white/80 transition-all"
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm hidden md:inline" style={{ fontWeight: 500 }}>{selectedLabel}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
          </motion.button>

          <AnimatePresence>
            {showTimeMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowTimeMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 glass rounded-xl border border-white/60 shadow-xl overflow-hidden z-20"
                >
                  {TIME_RANGES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => { onTimeRangeChange(t.value); setShowTimeMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/60 ${
                        timeRange === t.value ? 'text-indigo-600 bg-white/40' : 'text-foreground'
                      }`}
                      style={{ fontWeight: timeRange === t.value ? 600 : 500 }}
                    >
                      {t.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
