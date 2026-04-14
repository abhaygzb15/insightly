import { motion } from 'motion/react';
import { AlertCard } from '../AlertCard';
import { Bell, Mail, Smartphone } from 'lucide-react';

const alerts = [
  {
    type: 'warning' as const,
    title: 'Spike in 1★ reviews detected',
    description: '23% increase in the last 24 hours',
    time: '2 hours ago',
  },
  {
    type: 'info' as const,
    title: 'New issue cluster identified',
    description: 'Performance complaints trending upward',
    time: '5 hours ago',
  },
  {
    type: 'success' as const,
    title: 'Positive sentiment improving',
    description: 'Support team responses showing impact',
    time: '1 day ago',
  },
  {
    type: 'warning' as const,
    title: 'Low rating from high-value user',
    description: 'Enterprise customer left 2-star review',
    time: '1 day ago',
  },
  {
    type: 'info' as const,
    title: 'Weekly summary ready',
    description: 'Your weekly review insights are available',
    time: '2 days ago',
  },
  {
    type: 'success' as const,
    title: 'Response time improved',
    description: 'Average reply time down to 4 hours',
    time: '3 days ago',
  },
];

export function AlertsView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl mb-2" style={{ fontWeight: 700 }}>Alerts & Notifications</h1>
        <p className="text-muted-foreground">Stay informed about important changes</p>
      </div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 glass rounded-2xl border border-white/60 shadow-lg"
      >
        <h3 className="text-xl mb-4" style={{ fontWeight: 700 }}>Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { icon: Bell, label: 'Browser Notifications', description: 'Get notified in your browser' },
            { icon: Mail, label: 'Email Alerts', description: 'Receive daily digest via email' },
            { icon: Smartphone, label: 'Mobile Push', description: 'Push notifications on your phone' },
          ].map((pref, index) => (
            <motion.div
              key={pref.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex items-center justify-between p-4 bg-white/40 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-600/10">
                  <pref.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm" style={{ fontWeight: 600 }}>{pref.label}</p>
                  <p className="text-xs text-muted-foreground">{pref.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-600"></div>
              </label>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Alerts List */}
      <div>
        <h3 className="text-xl mb-4" style={{ fontWeight: 700 }}>Recent Alerts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {alerts.map((alert, index) => (
            <AlertCard key={index} {...alert} delay={index * 0.05} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
