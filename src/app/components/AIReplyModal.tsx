import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';

interface AIReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: string;
  rating?: number;
}

const tones = ['Professional', 'Empathetic', 'Casual', 'Apologetic'];

export function AIReplyModal({ isOpen, onClose, review = '', rating = 3 }: AIReplyModalProps) {
  const [selectedTone,   setSelectedTone]   = useState('Professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading,        setLoading]        = useState(false);
  const [copied,         setCopied]         = useState(false);

  // Track the last review+tone we generated for, to avoid duplicate calls
  const lastGenRef = useRef<string>('');

  const generate = async (reviewText: string, reviewRating: number, tone: string) => {
    const key = `${reviewText}__${reviewRating}__${tone}`;
    if (key === lastGenRef.current) return;
    lastGenRef.current = key;

    setLoading(true);
    setGeneratedReply('');
    try {
      const reply = await api.generateReply(reviewText, reviewRating, tone);
      setGeneratedReply(reply);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate reply';
      console.error('Generation failed:', errorMsg);
      setGeneratedReply(
        `Error: ${errorMsg}. Using fallback response: We appreciate you taking the time to share your feedback. Our team is continuously working to improve the experience, and your input helps us prioritize what matters most. Please feel free to reach out to our support team directly — we would love to help.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate when modal opens with a review, or when tone changes while open
  useEffect(() => {
    if (isOpen && review) {
      generate(review, rating, selectedTone);
    }
    if (!isOpen) {
      // Reset when closed so next open is fresh
      lastGenRef.current = '';
      setGeneratedReply('');
      setLoading(false);
    }
  }, [isOpen, review, rating, selectedTone]);

  const handleCopy = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    lastGenRef.current = '';  // force re-run
    if (review) generate(review, rating, selectedTone);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none"
          >
            <div className="w-full sm:max-w-2xl pointer-events-auto">
              {/* Glow */}
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-3xl blur-2xl pointer-events-none" />

              <div className="relative glass rounded-t-3xl sm:rounded-3xl border-2 border-white/40 shadow-2xl p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl" style={{ fontWeight: 700 }}>AI Reply Generator</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Craft the perfect response</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/40 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Original Review */}
                {review && (
                  <div className="mb-5 p-3 sm:p-4 bg-white/40 rounded-xl border border-white/60">
                    <p className="text-xs text-muted-foreground mb-1">Responding to ({rating}★)</p>
                    <p className="text-sm line-clamp-2 sm:line-clamp-3">{review}</p>
                  </div>
                )}

                {/* Tone Selector */}
                <div className="mb-5">
                  <label className="text-sm text-muted-foreground mb-2 block">Response Tone</label>
                  <div className="flex items-center gap-1 sm:gap-2 p-1 bg-white/40 rounded-xl">
                    {tones.map((tone) => (
                      <motion.button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        whileTap={{ scale: 0.97 }}
                        className={`
                          flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm
                          ${selectedTone === tone
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/40'
                          }
                        `}
                        style={{ fontWeight: selectedTone === tone ? 600 : 500 }}
                      >
                        {tone}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Generated Reply */}
                <div className="mb-5">
                  <label className="text-sm text-muted-foreground mb-2 block">Generated Response</label>
                  <div className="relative">
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl z-10">
                        <div className="flex gap-1.5 items-center">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-indigo-500 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                          <span className="ml-2 text-sm text-indigo-600" style={{ fontWeight: 500 }}>Generating…</span>
                        </div>
                      </div>
                    )}
                    <textarea
                      value={generatedReply}
                      onChange={(e) => setGeneratedReply(e.target.value)}
                      className="w-full h-32 sm:h-40 p-4 bg-white/60 rounded-xl border border-white/80 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      placeholder="Generating reply…"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    disabled={!generatedReply || loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg glow-primary disabled:opacity-40 text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="px-4 py-3 bg-white/60 rounded-xl border border-white/80 hover:bg-white/80 transition-all disabled:opacity-40"
                    title="Regenerate"
                  >
                    <motion.div animate={loading ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}>
                      <RefreshCw className="w-5 h-5 text-indigo-600" />
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
