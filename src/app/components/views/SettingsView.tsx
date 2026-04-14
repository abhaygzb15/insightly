import { motion } from 'motion/react';
import { User, Key, Globe, Palette, Database, Shield } from 'lucide-react';

const settingsSections = [
  {
    icon: User,
    title: 'Profile Settings',
    description: 'Manage your account information',
    fields: [
      { label: 'Full Name', value: 'Alex Morgan', type: 'text' },
      { label: 'Email', value: 'alex.morgan@company.com', type: 'email' },
      { label: 'Role', value: 'Product Manager', type: 'text' },
    ],
  },
  {
    icon: Key,
    title: 'API Access',
    description: 'Configure API keys and integrations',
    fields: [
      { label: 'API Key', value: '••••••••••••••••sk_live_abc123', type: 'password' },
      { label: 'Webhook URL', value: 'https://api.yourapp.com/webhooks', type: 'url' },
    ],
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Customize your dashboard theme',
    fields: [
      { label: 'Theme', value: 'Light', type: 'select', options: ['Light', 'Dark', 'Auto'] },
      { label: 'Accent Color', value: 'Indigo', type: 'select', options: ['Indigo', 'Purple', 'Blue', 'Green'] },
    ],
  },
];

export function SettingsView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and configuration</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="p-6 glass rounded-2xl border border-white/60 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
                <section.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl" style={{ fontWeight: 700 }}>{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <motion.div
                  key={field.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: sectionIndex * 0.1 + fieldIndex * 0.05 }}
                >
                  <label className="text-sm text-muted-foreground mb-2 block">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      defaultValue={field.value}
                      className="w-full px-4 py-2.5 bg-white/60 rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      className="w-full px-4 py-2.5 bg-white/60 rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 glass rounded-2xl border border-white/60 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl" style={{ fontWeight: 700 }}>Security</h3>
            <p className="text-sm text-muted-foreground">Protect your account</p>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full px-4 py-3 bg-white/60 rounded-xl border border-white/80 hover:bg-white/80 transition-all text-left"
          >
            <p className="text-sm mb-1" style={{ fontWeight: 600 }}>Change Password</p>
            <p className="text-xs text-muted-foreground">Update your account password</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full px-4 py-3 bg-white/60 rounded-xl border border-white/80 hover:bg-white/80 transition-all text-left"
          >
            <p className="text-sm mb-1" style={{ fontWeight: 600 }}>Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
          </motion.button>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg glow-primary"
        style={{ fontWeight: 600 }}
      >
        Save Changes
      </motion.button>
    </motion.div>
  );
}
