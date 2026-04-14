import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from 'react';
import { SentimentPoint } from '../../api/client';

const MOCK_DATA: SentimentPoint[] = [
  { date: 'Jan 1',  positive: 65, negative: 15, neutral: 20 },
  { date: 'Jan 8',  positive: 68, negative: 14, neutral: 18 },
  { date: 'Jan 15', positive: 70, negative: 12, neutral: 18 },
  { date: 'Jan 22', positive: 62, negative: 22, neutral: 16 },
  { date: 'Jan 29', positive: 58, negative: 28, neutral: 14 },
  { date: 'Feb 5',  positive: 55, negative: 30, neutral: 15 },
  { date: 'Feb 12', positive: 52, negative: 32, neutral: 16 },
];

const timeRanges = ['7D', '30D', '90D', 'All'];

const DAY_CUTOFFS: Record<string, number> = { '7D': 7, '30D': 30, '90D': 90, 'All': Infinity };

interface SentimentChartProps {
  data?: SentimentPoint[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  const [selectedRange, setSelectedRange] = useState('30D');
  const chartData = data && data.length > 0 ? data : MOCK_DATA;

  const filtered = useMemo(() => {
    const cutoff = DAY_CUTOFFS[selectedRange] ?? Infinity;
    if (cutoff === Infinity || chartData.length <= cutoff) return chartData;
    return chartData.slice(-cutoff);
  }, [chartData, selectedRange]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="p-6 glass rounded-2xl border border-white/60 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl mb-1" style={{ fontWeight: 700 }}>Sentiment Trends</h3>
          <p className="text-sm text-muted-foreground">Track sentiment changes over time</p>
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center gap-2 p-1 bg-white/40 rounded-xl">
          {timeRanges.map((range) => (
            <motion.button
              key={range}
              onClick={() => setSelectedRange(range)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-1.5 rounded-lg text-sm transition-all
                ${selectedRange === range
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
              style={{ fontWeight: selectedRange === range ? 600 : 500 }}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filtered}>
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
          <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} fill="url(#positiveGradient)" />
          <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} fill="url(#negativeGradient)" />
          <Line type="monotone" dataKey="neutral"  stroke="#64748b" strokeWidth={3} dot={{ fill: '#64748b', r: 4 }} activeDot={{ r: 6 }} fill="url(#neutralGradient)" />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
