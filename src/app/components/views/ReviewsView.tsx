import { motion } from 'motion/react';
import { Search, ChevronDown, MessageSquare, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ReviewCard } from '../ReviewCard';
import { AIReplyModal } from '../AIReplyModal';
import { EmptyState } from '../EmptyState';
import { ReviewData } from '../../../api/client';

const PAGE_SIZE = 20;

interface ReviewsViewProps {
  reviews?: ReviewData[];
  clusterFilter?: { id: string; title: string } | null;
  onClearClusterFilter?: () => void;
}

export function ReviewsView({ reviews, clusterFilter, onClearClusterFilter }: ReviewsViewProps) {
  const [isModalOpen,       setIsModalOpen]       = useState(false);
  const [selectedReview,    setSelectedReview]    = useState<ReviewData | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [selectedStars,     setSelectedStars]     = useState('All');
  const [searchText,        setSearchText]        = useState('');
  const [sortOrder,         setSortOrder]         = useState<'newest' | 'oldest' | 'helpful'>('newest');
  const [dateFrom,          setDateFrom]          = useState('');
  const [dateTo,            setDateTo]            = useState('');
  const [page,              setPage]              = useState(1);

  const hasData = reviews && reviews.length > 0;

  // Star counts from all reviews (before star filter, to always show totals)
  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews?.forEach(r => { if (r.rating in counts) counts[r.rating]++; });
    return counts;
  }, [reviews]);

  const filtered = useMemo(() => {
    if (!hasData) return [];

    let result = reviews!.filter(r => {
      if (clusterFilter && r.cluster_id !== clusterFilter.id)             return false;
      if (selectedSentiment !== 'All' && r.sentiment !== selectedSentiment.toLowerCase()) return false;
      if (selectedStars !== 'All' && r.rating !== parseInt(selectedStars)) return false;
      if (searchText && !r.review.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (dateFrom && r.date < dateFrom)                                   return false;
      if (dateTo   && r.date > dateTo)                                     return false;
      return true;
    });

    if (sortOrder === 'oldest') {
      result = [...result].sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortOrder === 'helpful') {
      result = [...result].sort((a, b) => b.thumbs_up - a.thumbs_up);
    }
    // 'newest' — reviews come from backend already sorted newest-first

    return result;
  }, [reviews, clusterFilter, selectedSentiment, selectedStars, searchText, dateFrom, dateTo, sortOrder]);

  const reset = () => { setPage(1); };

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const openModal = (review: ReviewData) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl mb-1" style={{ fontWeight: 700 }}>Review Explorer</h1>
        <p className="text-muted-foreground text-sm">
          {hasData
            ? `${filtered.length.toLocaleString()} of ${reviews!.length.toLocaleString()} reviews`
            : 'Browse, filter, and respond to all reviews'}
        </p>
      </div>

      {/* Active cluster filter banner */}
      {clusterFilter && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl"
        >
          <span className="text-sm text-indigo-700" style={{ fontWeight: 500 }}>
            Filtered to cluster: <strong>{clusterFilter.title}</strong>
          </span>
          <button
            onClick={onClearClusterFilter}
            className="p-1 rounded-lg hover:bg-indigo-500/20 transition-colors"
          >
            <X className="w-4 h-4 text-indigo-600" />
          </button>
        </motion.div>
      )}

      {/* Filters — only when data exists */}
      {hasData && (
        <div className="space-y-3">
          {/* Row 1: Star filters + Sentiment + Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Star chips */}
            <div className="flex items-center gap-1 p-1 bg-white/40 rounded-xl overflow-x-auto">
              <button
                onClick={() => { setSelectedStars('All'); reset(); }}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                  selectedStars === 'All' ? 'bg-white shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ fontWeight: selectedStars === 'All' ? 600 : 500 }}
              >All</button>
              {[5, 4, 3, 2, 1].map(star => (
                <button
                  key={star}
                  onClick={() => { setSelectedStars(String(star)); reset(); }}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                    selectedStars === String(star) ? 'bg-white shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ fontWeight: selectedStars === String(star) ? 600 : 500 }}
                >
                  {star}★{starCounts[star] ? ` (${starCounts[star].toLocaleString()})` : ''}
                </button>
              ))}
            </div>

            {/* Sentiment dropdown */}
            <div className="relative">
              <select
                value={selectedSentiment}
                onChange={e => { setSelectedSentiment(e.target.value); reset(); }}
                className="pl-3 pr-8 py-2.5 bg-white/60 rounded-xl border border-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer appearance-none"
                style={{ fontWeight: 500 }}
              >
                <option value="All">All Sentiment</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={e => { setSortOrder(e.target.value as 'newest' | 'oldest' | 'helpful'); reset(); }}
                className="pl-3 pr-8 py-2.5 bg-white/60 rounded-xl border border-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer appearance-none"
                style={{ fontWeight: 500 }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="helpful">Most Helpful</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Date range + Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); reset(); }}
                className="px-3 py-2 bg-white/60 rounded-xl border border-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); reset(); }}
                className="px-3 py-2 bg-white/60 rounded-xl border border-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); reset(); }}
                  className="p-2 rounded-xl bg-white/40 hover:bg-white/60 transition-colors border border-white/60"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Search */}
            <div className="flex-1 relative min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchText}
                onChange={e => { setSearchText(e.target.value); reset(); }}
                placeholder="Search reviews…"
                className="w-full pl-9 pr-4 py-2.5 bg-white/60 rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!hasData ? (
        <EmptyState
          icon={MessageSquare}
          title="No Reviews Yet"
          description="Paste a Google Play Store link above and click Analyze to load real reviews here."
          hint="Example: com.whatsapp or paste the full Play Store URL"
        />
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">
          No reviews match your filters.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((review, index) => (
              <ReviewCard
                key={`${review.datetime}-${index}`}
                rating={review.rating}
                author={review.author}
                text={review.review}
                date={review.date}
                helpfulCount={review.thumbs_up}
                appVersion={review.app_version}
                sentiment={review.sentiment}
                delay={Math.min(index * 0.02, 0.25)}
                onGenerateReply={() => openModal(review)}
              />
            ))}
          </div>

          {hasMore && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPage(p => p + 1)}
              className="w-full px-4 py-3 bg-white/60 rounded-xl border border-white/80 hover:bg-white/80 transition-all flex items-center justify-center gap-2 text-sm"
              style={{ fontWeight: 600 }}
            >
              Load More ({filtered.length - visible.length} remaining)
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          )}
        </>
      )}

      <AIReplyModal
        key={selectedReview ? `${selectedReview.datetime}-${selectedReview.author}` : 'empty'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={selectedReview?.review ?? ''}
        rating={selectedReview?.rating ?? 3}
      />
    </motion.div>
  );
}
