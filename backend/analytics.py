"""
Compute analytics from raw review dicts — pure Python, no AI needed.
Algorithmic clustering uses keyword matching: fast, deterministic, works offline.
"""

import re
from collections import Counter, defaultdict

# ── Stop words ────────────────────────────────────────────────────────────────

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "it", "this", "that", "was", "are",
    "be", "has", "had", "have", "do", "did", "will", "would", "could", "should",
    "can", "may", "might", "not", "no", "my", "me", "i", "you", "your", "we",
    "they", "their", "our", "its", "am", "been", "being", "app", "apps",
    "very", "so", "too", "also", "just", "get", "got", "use", "used",
    "really", "like", "good", "great", "nice", "bad", "best", "worst",
    "more", "when", "than", "then", "now", "up", "out", "all", "some",
    "any", "each", "every", "other", "new", "old", "big", "small", "he",
    "she", "him", "her", "his", "them", "what", "which", "who", "how",
    "if", "about", "after", "before", "between", "into", "through",
    "during", "again", "once", "here", "there", "why", "because", "while",
    "even", "still", "only", "both", "same", "such", "own", "few", "much",
    "many", "most", "ever", "never", "always", "often", "well",
    "yes", "please", "thank", "thanks", "hi", "hello",
    "make", "want", "need", "way", "time", "one", "two", "three",
}

# ── Theme templates for algorithmic clustering ────────────────────────────────

THEME_TEMPLATES = [
    {
        "id": "performance",
        "title": "Performance & Speed",
        "keywords": {"slow", "lag", "lagging", "loading", "freeze", "frozen", "stuck", "hang", "hanging",
                     "delay", "delayed", "battery", "memory", "ram", "speed", "smooth", "smoothly",
                     "respond", "response", "heavy", "drain", "draining"},
        "color": "rose",
        "action": "Profile and optimize critical code paths",
    },
    {
        "id": "stability",
        "title": "Bugs & Stability",
        "keywords": {"bug", "bugs", "buggy", "error", "errors", "broken", "break", "broke", "fix",
                     "issue", "issues", "problem", "problems", "glitch", "glitches", "fail", "fails",
                     "failed", "stop", "stopped", "crash", "crashes", "crashing", "crashed",
                     "closes", "closing", "force", "close", "reopen", "restart"},
        "color": "rose",
        "action": "Increase crash reporting coverage and prioritize top bug fixes",
    },
    {
        "id": "ui",
        "title": "UI & Visual Design",
        "keywords": {"interface", "design", "beautiful", "beauty", "clean", "ugly", "layout", "dark",
                     "light", "theme", "color", "colors", "icon", "icons", "look", "looks",
                     "appearance", "style", "screen", "display", "visual", "font", "readable",
                     "modern", "outdated", "attractive", "intuitive"},
        "color": "emerald",
        "action": "Continue investing in UI polish and accessibility",
    },
    {
        "id": "features",
        "title": "Feature Requests",
        "keywords": {"feature", "features", "missing", "request", "requests", "option", "options",
                     "setting", "settings", "wish", "add", "include", "functionality",
                     "capability", "export", "import", "filter", "search", "sync",
                     "widget", "shortcut", "notification", "reminder", "calendar"},
        "color": "amber",
        "action": "Review top feature requests for the next roadmap sprint",
    },
    {
        "id": "support",
        "title": "Customer Support",
        "keywords": {"support", "team", "help", "response", "reply", "replies", "customer",
                     "service", "contact", "feedback", "answered", "answer", "unresponsive",
                     "helpful", "useless", "ignored", "ticket", "email", "refund"},
        "color": "blue",
        "action": "Improve support response times and solution quality",
    },
    {
        "id": "updates",
        "title": "Updates & Versions",
        "keywords": {"update", "updates", "version", "versions", "latest", "changed", "change",
                     "removed", "rollback", "downgrade", "previous", "patch", "release",
                     "changelog", "broke", "after", "since", "used"},
        "color": "amber",
        "action": "Keep changelogs transparent and test updates thoroughly",
    },
    {
        "id": "value",
        "title": "Value & Pricing",
        "keywords": {"price", "pricing", "free", "premium", "subscription", "subscriptions",
                     "worth", "expensive", "pay", "paying", "paid", "money", "cost", "costly",
                     "cheap", "overpriced", "affordable", "plan", "purchase", "trial"},
        "color": "amber",
        "action": "Review pricing tiers and communicate value clearly",
    },
    {
        "id": "positive",
        "title": "Overall Satisfaction",
        "keywords": {"love", "loving", "loved", "excellent", "amazing", "perfect", "awesome",
                     "fantastic", "wonderful", "recommend", "brilliant", "superb",
                     "outstanding", "enjoy", "enjoying", "enjoyed", "happy", "satisfied",
                     "impressed", "impressive", "addicted", "favourite", "favorite"},
        "color": "emerald",
        "action": "Leverage positive reception in app store marketing",
    },
]


# ── Utilities ─────────────────────────────────────────────────────────────────

def classify_sentiment(rating: int) -> str:
    if rating >= 4:
        return "positive"
    if rating == 3:
        return "neutral"
    return "negative"


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r'\b[a-z]{3,}\b', text.lower()))


def extract_keywords(reviews: list[dict], top_n: int = 10) -> list[dict]:
    word_counts: Counter = Counter()
    for r in reviews:
        words = re.findall(r'\b[a-z]{4,}\b', (r.get("review") or "").lower())
        for w in words:
            if w not in STOPWORDS:
                word_counts[w] += 1
    return [{"keyword": w, "mentions": c} for w, c in word_counts.most_common(top_n)]


# ── Algorithmic clustering ────────────────────────────────────────────────────

def _score_review_for_theme(tokens: set[str], theme_keywords: set[str]) -> int:
    return len(tokens & theme_keywords)


def _cluster_trend(cluster_reviews: list[dict]) -> tuple[str, str]:
    if len(cluster_reviews) < 6:
        return "stable", "0%"
    reviews_sorted = sorted(cluster_reviews, key=lambda r: r.get("date", ""))
    mid = len(reviews_sorted) // 2
    first_avg  = sum(r.get("rating", 3) for r in reviews_sorted[:mid]) / mid
    second_avg = sum(r.get("rating", 3) for r in reviews_sorted[mid:]) / (len(reviews_sorted) - mid)
    diff = second_avg - first_avg
    pct  = abs(diff / max(first_avg, 0.1) * 100)
    if diff > 0.15:
        return "up", f"{pct:.0f}%"
    if diff < -0.15:
        return "down", f"{pct:.0f}%"
    return "stable", f"{pct:.0f}%"


def build_clusters(reviews: list[dict]) -> list[dict]:
    """
    Assign each review to the best-matching theme via keyword scoring.
    Returns cluster dicts compatible with the frontend ClusterData shape.
    """
    buckets: dict[str, list[dict]] = {t["id"]: [] for t in THEME_TEMPLATES}

    for r in reviews:
        tokens = _tokenize(r.get("review") or "")
        best_id, best_score = None, 0
        for tmpl in THEME_TEMPLATES:
            score = _score_review_for_theme(tokens, tmpl["keywords"])
            if score > best_score:
                best_score, best_id = score, tmpl["id"]
        # Unmatched: route by rating
        if best_id is None:
            best_id = "positive" if r.get("rating", 3) >= 4 else "stability"
        buckets[best_id].append(r)

    clusters = []
    for tmpl in THEME_TEMPLATES:
        bucket = buckets[tmpl["id"]]
        if not bucket:
            continue
        count      = len(bucket)
        avg_rating = round(sum(r.get("rating", 3) for r in bucket) / count, 1)
        trend, trend_val = _cluster_trend(bucket)
        clusters.append({
            "id":           tmpl["id"],
            "title":        tmpl["title"],
            "review_count": count,
            "avg_rating":   avg_rating,
            "trend":        trend,
            "trend_value":  trend_val,
            "action":       tmpl["action"],
            "color":        tmpl["color"],
        })

    # Sort: negative clusters first (by avg_rating asc), then positive
    clusters.sort(key=lambda c: (c["avg_rating"] > 3.5, c["avg_rating"]))
    return clusters


def build_key_insights(clusters: list[dict], total: int) -> list[dict]:
    """Generate 3 insights algorithmically from cluster stats."""
    insights = []

    # Insight 1: most urgent negative cluster
    neg_clusters = [c for c in clusters if c["avg_rating"] < 3.2 and c["review_count"] > max(3, total * 0.03)]
    if neg_clusters:
        worst = min(neg_clusters, key=lambda c: c["avg_rating"])
        pct   = round(worst["review_count"] / total * 100)
        insights.append({
            "title":       f"Critical: {worst['title']}",
            "description": (
                f"{worst['review_count']} reviews ({pct}% of total) mention {worst['title'].lower()} "
                f"with an average rating of {worst['avg_rating']}. This is your top priority to address."
            ),
            "impact": "High",
            "color":  "rose",
        })

    # Insight 2: strongest positive cluster
    pos_clusters = [c for c in clusters if c["avg_rating"] >= 4.0]
    if pos_clusters:
        best = max(pos_clusters, key=lambda c: c["review_count"])
        insights.append({
            "title":       f"Strength: {best['title']}",
            "description": (
                f"Users frequently praise {best['title'].lower()} — "
                f"{best['review_count']} reviews average {best['avg_rating']}★. "
                "Highlight this in your store listing and marketing."
            ),
            "impact": "Medium",
            "color":  "emerald",
        })

    # Insight 3: declining cluster (trend = down)
    declining = [c for c in clusters if c["trend"] == "down" and c["review_count"] > max(3, total * 0.02)]
    if declining:
        worst_trend = max(declining, key=lambda c: c["review_count"])
        insights.append({
            "title":       f"Declining: {worst_trend['title']}",
            "description": (
                f"Satisfaction around {worst_trend['title'].lower()} is trending down "
                f"({worst_trend['trend_value']} change). "
                f"This affects {worst_trend['review_count']} reviews — act before it worsens."
            ),
            "impact": "Medium",
            "color":  "amber",
        })
    elif len(insights) < 2:
        # Fallback insight from overall rating distribution
        insights.append({
            "title":       "Opportunity: Address Mid-Range Reviews",
            "description": (
                "Users leaving 2-3 star reviews represent the best conversion opportunity. "
                "Resolving their top complaints could meaningfully raise your overall rating."
            ),
            "impact": "Medium",
            "color":  "amber",
        })

    return insights[:3]


def build_key_issues(reviews: list[dict], clusters: list[dict]) -> list[dict]:
    """Extract top issues from negative reviews using cluster data."""
    neg_reviews = [r for r in reviews if r.get("rating", 3) <= 2]
    if not neg_reviews:
        return []

    # Score each theme against negative reviews
    theme_neg: dict[str, list[dict]] = defaultdict(list)
    for r in neg_reviews:
        tokens = _tokenize(r.get("review") or "")
        best_id, best_score = None, 0
        for tmpl in THEME_TEMPLATES:
            score = _score_review_for_theme(tokens, tmpl["keywords"])
            if score > best_score:
                best_score, best_id = score, tmpl["id"]
        if best_id is None:
            best_id = "stability"
        theme_neg[best_id].append(r)

    issues = []
    sorted_themes = sorted(theme_neg.items(), key=lambda x: len(x[1]), reverse=True)
    for theme_id, neg_bucket in sorted_themes[:4]:
        tmpl = next((t for t in THEME_TEMPLATES if t["id"] == theme_id), None)
        if not tmpl:
            continue
        count  = len(neg_bucket)
        impact = min(10, max(1, round(count / max(len(neg_reviews), 1) * 10)))
        # Use thumbs_up weighted mentions
        total_helpful = sum(r.get("thumbs_up", 0) for r in neg_bucket)
        issues.append({
            "title":       f"{tmpl['title']} Problems",
            "description": (
                f"{count} low-rated reviews highlight {tmpl['title'].lower()} issues. "
                f"{total_helpful} users found these reviews helpful."
            ),
            "priority":    "high"   if impact >= 7 else ("medium" if impact >= 4 else "low"),
            "impact":      impact,
            "mentions":    count,
        })

    return issues


# ── Time series ───────────────────────────────────────────────────────────────

def build_daily_series(reviews: list[dict]) -> tuple[list, list, list]:
    by_date: dict[str, dict] = defaultdict(
        lambda: {"positive": 0, "negative": 0, "neutral": 0, "total": 0, "rating_sum": 0}
    )
    for r in reviews:
        d = r.get("date", "N/A")
        if d == "N/A":
            continue
        sentiment = classify_sentiment(r.get("rating", 3))
        by_date[d][sentiment] += 1
        by_date[d]["total"]       += 1
        by_date[d]["rating_sum"]  += r.get("rating", 0)

    sorted_dates = sorted(by_date.keys())
    # Downsample to max 60 points
    if len(sorted_dates) > 60:
        step = max(1, len(sorted_dates) // 60)
        sorted_dates = sorted_dates[::step]

    sentiment_series, volume_series, rating_series = [], [], []
    for d in sorted_dates:
        e = by_date[d]
        t = e["total"]
        sentiment_series.append({
            "date":     d,
            "positive": round(e["positive"] / t * 100) if t else 0,
            "negative": round(e["negative"] / t * 100) if t else 0,
            "neutral":  round(e["neutral"]  / t * 100) if t else 0,
        })
        volume_series.append({"date": d, "reviews": t})
        rating_series.append({"date": d, "rating": round(e["rating_sum"] / t, 2) if t else 0})

    return sentiment_series, volume_series, rating_series


def build_version_data(reviews: list[dict]) -> list[dict]:
    by_version: dict[str, dict] = defaultdict(lambda: {"reviews": 0, "rating_sum": 0})
    for r in reviews:
        v = r.get("app_version") or "Unknown"
        by_version[v]["reviews"]     += 1
        by_version[v]["rating_sum"]  += r.get("rating", 0)
    result = [
        {"version": v, "reviews": d["reviews"], "rating": round(d["rating_sum"] / d["reviews"], 1)}
        for v, d in by_version.items() if d["reviews"] > 0
    ]
    result.sort(key=lambda x: x["reviews"], reverse=True)
    return result[:6]


def build_star_counts(reviews: list[dict]) -> dict:
    counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        rating = int(r.get("rating", 0))
        if rating in counts:
            counts[rating] += 1
    return counts


# ── Main entry point ──────────────────────────────────────────────────────────

def compute_analytics(reviews: list[dict], app_id: str, period: str, country: str) -> dict:
    """
    Compute ALL analytics (basic + clusters + insights + issues) — pure Python, no AI.
    Runs in < 1 second even for thousands of reviews.
    """
    if not reviews:
        return _empty_analytics(app_id, period, country)

    total = len(reviews)
    ratings = [r.get("rating", 0) for r in reviews]
    avg_rating = round(sum(ratings) / total, 2)

    positive_count = sum(1 for x in ratings if x >= 4)
    neutral_count  = sum(1 for x in ratings if x == 3)
    negative_count = sum(1 for x in ratings if x <= 2)

    raw_star = build_star_counts(reviews)
    star_pcts = {
        str(s): {
            "count":      raw_star[s],
            "percentage": round(raw_star[s] / total * 100) if total else 0,
        }
        for s in range(1, 6)
    }

    sentiment_series, volume_series, rating_series = build_daily_series(reviews)
    top_keywords = extract_keywords(reviews, top_n=12)
    version_data = build_version_data(reviews)

    # Algorithmic clusters (instant, no AI)
    clusters    = build_clusters(reviews)
    insights    = build_key_insights(clusters, total)
    issues      = build_key_issues(reviews, clusters)

    # Enrich reviews with sentiment + cluster_id (reuse same keyword scoring)
    enriched = []
    for r in reviews:
        tokens = _tokenize(r.get("review") or "")
        best_id, best_score = None, 0
        for tmpl in THEME_TEMPLATES:
            score = _score_review_for_theme(tokens, tmpl["keywords"])
            if score > best_score:
                best_score, best_id = score, tmpl["id"]
        if best_id is None:
            best_id = "positive" if r.get("rating", 3) >= 4 else "stability"
        enriched.append({
            **r,
            "sentiment":  classify_sentiment(r.get("rating", 3)),
            "cluster_id": best_id,
        })

    return {
        "app_id":           app_id,
        "total_reviews":    total,
        "avg_rating":       avg_rating,
        "positive_pct":     round(positive_count / total * 100),
        "neutral_pct":      round(neutral_count  / total * 100),
        "negative_pct":     round(negative_count / total * 100),
        "star_counts":      star_pcts,
        "sentiment_series": sentiment_series,
        "volume_series":    volume_series,
        "rating_series":    rating_series,
        "top_keywords":     top_keywords,
        "version_data":     version_data,
        "reviews":          enriched,
        "clusters":         clusters,
        "key_insights":     insights,
        "key_issues":       issues,
        "period":           period,
        "country":          country,
    }


def _empty_analytics(app_id: str, period: str, country: str) -> dict:
    return {
        "app_id": app_id, "total_reviews": 0, "avg_rating": 0,
        "positive_pct": 0, "neutral_pct": 0, "negative_pct": 0,
        "star_counts": {str(s): {"count": 0, "percentage": 0} for s in range(1, 6)},
        "sentiment_series": [], "volume_series": [], "rating_series": [],
        "top_keywords": [], "version_data": [], "reviews": [],
        "clusters": [], "key_insights": [], "key_issues": [],
        "period": period, "country": country,
    }
