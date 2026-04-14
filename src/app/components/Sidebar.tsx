import { BarChart3, Download, LayoutDashboard, MessageSquare, Sparkles, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',    id: 'overview' },
  { icon: MessageSquare,   label: 'Reviews',     id: 'reviews' },
  { icon: Sparkles,        label: 'AI Insights', id: 'ai-insights' },
  { icon: TrendingUp,      label: 'Trends',      id: 'trends' },
  { icon: BarChart3,       label: 'Analytics',   id: 'analytics' },
  { icon: Download,        label: 'Export',      id: 'export' },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ activeView, onViewChange, onClose }: SidebarProps) {
  const handleNav = (id: string) => {
    onViewChange(id);
    onClose?.();
  };

  return (
    <div className="w-72 h-full p-6 flex flex-col gap-8">
      {/* Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-primary shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl tracking-tight" style={{ fontWeight: 700 }}>Insightly</h1>
            <p className="text-xs text-muted-foreground">AI Intelligence</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-white/40 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => handleNav(item.id)}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.1 }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === item.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg glow-primary'
                : 'text-muted-foreground hover:bg-white/40 hover:text-foreground'
              }
            `}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span style={{ fontWeight: activeView === item.id ? 600 : 500 }}>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* User Profile */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate" style={{ fontWeight: 600 }}>Insightly</p>
          <p className="text-xs text-muted-foreground truncate">AI Analytics</p>
        </div>
      </motion.div>
    </div>
  );
}

export function Sidebar({ activeView, onViewChange, isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:block w-72 h-screen glass border-r border-white/40 fixed left-0 top-0 z-30"
        style={{ boxShadow: '4px 0 24px rgba(79, 70, 229, 0.04)' }}
      >
        <SidebarContent
          activeView={activeView}
          onViewChange={onViewChange}
        />
      </motion.aside>

      {/* Mobile sidebar — slide in/out */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 glass border-r border-white/40 z-50 overflow-y-auto"
              style={{ boxShadow: '4px 0 24px rgba(79, 70, 229, 0.08)' }}
            >
              <SidebarContent
                activeView={activeView}
                onViewChange={onViewChange}
                onClose={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
