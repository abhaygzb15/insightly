# Insightly — Technical Reference Document

**Version:** 1.0  
**Stack:** React + TypeScript (Frontend) · FastAPI + Python (Backend) · Groq AI  
**Deployment:** Vercel (frontend) · Render (backend)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   User's Browser                    │
│         React + Vite  (Vercel CDN)                  │
└────────────────────┬────────────────────────────────┘
                     │ /api/* HTTP calls
                     ▼
┌─────────────────────────────────────────────────────┐
│            FastAPI Backend  (Render)                │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │scraper.py│  │analytics.py│  │  ai_service.py   │ │
│  └──────────┘  └───────────┘  └──────────────────┘ │
└──────┬──────────────────────────────────┬───────────┘
       │                                  │
       ▼                                  ▼
Google Play Store                    Groq API
(google-play-scraper)            (llama-3.1-8b-instant)
```

**Request flow:**
1. User pastes a Play Store URL → clicks Analyze
2. Frontend calls `POST /api/scrape` → gets a `job_id`
3. Frontend polls `GET /api/status/{job_id}` every 2 seconds
4. Backend scrapes reviews, computes analytics, returns full data
5. Frontend renders everything instantly from the response

---

## 2. Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | — | Type safety |
| Vite | 6.3 | Build tool + dev server |
| Tailwind CSS | 4.1 | Utility-first styling |
| Framer Motion | 12 | Animations |
| Recharts | 2.15 | Charts (sentiment, trends, ratings) |
| Lucide React | 0.487 | Icons |

### Backend
| Library | Version | Purpose |
|---|---|---|
| FastAPI | latest | REST API framework |
| Uvicorn | latest | ASGI server |
| google-play-scraper | latest | Scrape Play Store reviews |
| httpx | latest | Async HTTP client for Groq/Ollama |
| python-dotenv | latest | Load `.env` variables |
| Pydantic | latest | Request/response validation |

---

## 3. Feature Deep-Dives

---

### 3.1 Review Scraping

**Library:** `google-play-scraper` (Python)  
**File:** `backend/scraper.py`

The scraper fetches reviews in batches of 200 (API maximum), sorted newest-first. It stops as soon as it hits a review older than the selected time cutoff.

**How it works:**
```python
# Cutoff is calculated from selected time range
cutoff = datetime.now(UTC) - timedelta(days=30)  # e.g. Last Month

while not done:
    result, token = reviews(app_id, sort=Sort.NEWEST, count=200)
    for r in result:
        if review_date < cutoff:
            done = True   # stop — we've gone past our range
            break
        collected.append(r)
```

**Example:** For `com.whatsapp` with "Last Month" selected, it may fetch 5–10 batches (1,000–2,000 reviews) and stop precisely at the 30-day boundary.

**Output per review:**
```python
{
  "date":        "2026-04-10",
  "rating":      5,
  "author":      "Abhay S.",
  "review":      "Works great after the update!",
  "thumbs_up":   42,
  "app_version": "2.24.8.12",
  "reply":       "",        # developer reply if exists
  "sentiment":   "positive" # added by analytics.py
  "cluster_id":  "positive" # added by analytics.py
}
```

---

### 3.2 Sentiment Analysis

**File:** `backend/analytics.py` → `classify_sentiment()`  
**Method:** Rule-based on star rating (no ML model — instant, no dependencies)

```python
def classify_sentiment(rating: int) -> str:
    if rating >= 4:  return "positive"
    if rating == 3:  return "neutral"
    return "negative"            # 1 or 2 stars
```

**Why rating-based?** Play Store ratings are highly correlated with review sentiment. This approach is:
- **Instant** — no API call, no model loading
- **Accurate** — 4–5★ reviews are overwhelmingly positive; 1–2★ are negative
- **Consistent** — same review always gets same label

**Example:**
- 5★ "Absolutely love this app!" → `positive`
- 3★ "It's okay, could be better" → `neutral`
- 1★ "App crashes every time I open it" → `negative`

---

### 3.3 AI Clustering (Theme Detection)

**File:** `backend/analytics.py` → `build_clusters()`  
**Method:** Keyword-matching against 8 predefined theme templates (no ML, no BERTopic)

**Why not BERTopic?** BERTopic requires downloading large models (500MB+) and takes 30–120 seconds to run. Keyword matching runs in **under 50ms** for 5,000 reviews.

**The 8 themes:**
| Cluster ID | Title | Example keywords |
|---|---|---|
| `performance` | Performance & Speed | slow, lag, freeze, battery, crash |
| `stability` | Bugs & Stability | bug, error, broken, glitch, crash |
| `ui` | UI & Visual Design | interface, design, dark, theme, layout |
| `features` | Feature Requests | missing, wish, add, option, widget |
| `support` | Customer Support | support, help, reply, refund, ignored |
| `updates` | Updates & Versions | update, version, changed, rollback |
| `value` | Value & Pricing | price, premium, subscription, expensive |
| `positive` | Overall Satisfaction | love, amazing, perfect, awesome, recommend |

**How a review gets assigned:**
```python
for review in reviews:
    tokens = set(words in review text)   # tokenize
    best_cluster = max(themes, key=lambda t: len(tokens ∩ t.keywords))
    review["cluster_id"] = best_cluster.id
```

**Example:**
- Review: *"The app keeps freezing and draining my battery"*
- Tokens: `{freezing, draining, battery}`
- Matches `performance` keywords: `{freeze, drain, battery}` → score 3
- → Assigned to **Performance & Speed** cluster

Each cluster also gets:
- `avg_rating` — mean star rating of all reviews in the cluster
- `review_count` — number of reviews
- `trend` — compares avg rating of first half vs second half of reviews

---

### 3.4 Key Insights Generation

**File:** `backend/analytics.py` → `build_key_insights()`  
**Method:** Algorithmic — derived from cluster stats, no AI needed

Generates up to 3 insights:

1. **Critical insight** — finds the cluster with lowest avg_rating (< 3.2) and highest count
2. **Strength insight** — finds the cluster with highest avg_rating (≥ 4.0) and highest count
3. **Declining insight** — finds a cluster where recent reviews rate lower than older ones

**Example output:**
```
"Critical: Bugs & Stability — 312 reviews (18% of total) mention bugs &
stability with an average rating of 1.8. This is your top priority."
```

---

### 3.5 AI Auto-Reply (4 Tones)

**File:** `backend/ai_service.py`  
**AI Provider:** Groq API (`llama-3.1-8b-instant`) with Ollama as fallback  
**Frontend:** `src/app/components/AIReplyModal.tsx`

The user selects a tone (Professional / Empathetic / Casual / Apologetic). The tone is injected into the prompt:

```python
user_prompt = f"""
The user left a {rating}-star review:
"{review_text[:300]}"

Write a {tone.lower()} reply as the app developer (1-2 sentences max).
"""
```

**System prompt constraints:**
- Max 1–2 sentences (keeps replies concise and Play Store appropriate)
- Must NOT start with "Thank you for your review"
- No bullet points or markdown formatting
- Must NOT promise timelines

**Example — same review, different tones:**

Review: *"App crashes every time I try to upload a photo. Very frustrating."*

| Tone | Generated Reply |
|---|---|
| **Professional** | "We've identified an issue affecting photo uploads and our engineering team is actively working on a resolution — please update to the latest version and let us know if it persists." |
| **Empathetic** | "We're really sorry this has been so frustrating — crashes during uploads are unacceptable, and we genuinely want to make this right for you." |
| **Casual** | "Ugh, that's super annoying — we're on it! Try updating the app and hopefully that sorts it out." |
| **Apologetic** | "We sincerely apologize for this experience — a crash on every photo upload is a serious bug and we take full responsibility for fixing it urgently." |

**API call:**
```
POST /api/reply
{ "review": "App crashes...", "rating": 1, "tone": "Empathetic" }
→ { "reply": "We're really sorry..." }
```

---

### 3.6 Time Range Filtering

**Files:** `src/utils/analytics.ts` → `filterAnalyticsByDays()`

All filtering after the initial load is **100% client-side** — no new API call.

**On initial load:** data is filtered to the selected range immediately.  
**On filter change:** `filterAnalyticsByDays(originalData, days)` recomputes everything in <5ms.

```typescript
// Keeps full dataset in memory, applies cutoff date filter
const cutoff = today - days  // e.g. today - 30 for "Last Month"
const filtered = reviews.filter(r => r.date >= cutoff)

// Recomputes all stats from filtered reviews
avgRating   = mean(filtered.map(r => r.rating))
positivePct = filtered.filter(r => r.sentiment === 'positive').length / total
starCounts  = { 1: ..., 2: ..., 3: ..., 4: ..., 5: ... }
```

---

### 3.7 Export to CSV / Excel

**File:** `src/app/components/views/ExportView.tsx`  
**Method:** Pure client-side — no backend call, no external library

**CSV export:**
```typescript
function exportCSV(data: ReviewData[], filename: string) {
    const headers = ['Date','Author','Rating','Review','Version',
                     'Thumbs Up','Sentiment','Developer Reply']
    const rows = data.map(r => [r.date, r.author, r.rating, ...].join(','))
    const csv = '\ufeff' + [headers, ...rows].join('\n')  // \ufeff = UTF-8 BOM for Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    // triggers browser download
}
```

**Excel (.xls) export — SpreadsheetML format:**
```typescript
function exportExcel(data: ReviewData[], filename: string) {
    // Generates XML in Microsoft SpreadsheetML format
    // Excel opens .xls XML files natively — no external library needed
    const xml = `<?xml version="1.0"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
      <Worksheet ss:Name="Reviews">
        <Table>...</Table>
      </Worksheet>
    </Workbook>`
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
}
```

**Date range filter:**  
The export view has `dateFrom` and `dateTo` pickers. Reviews are filtered before export:
```typescript
const filtered = reviews.filter(r =>
    (!dateFrom || r.date >= dateFrom) &&
    (!dateTo   || r.date <= dateTo)
)
```

**Columns exported:** Date, Author, Rating (1–5), Review text, App Version, Thumbs Up count, Sentiment, Developer Reply

---

## 4. Data Flow Summary

```
Play Store URL entered
        ↓
POST /api/scrape  →  job_id returned
        ↓
Poll GET /api/status/{job_id} every 2s
        ↓
Backend: scraper.py fetches reviews in batches
        ↓
Backend: analytics.py runs (< 1 second):
  • classify_sentiment() per review
  • build_clusters() — keyword matching
  • build_key_insights() — from cluster stats
  • build_key_issues() — from negative reviews
  • build_daily_series() — for trend charts
        ↓
Full AnalyticsData JSON returned to frontend
        ↓
Frontend renders all views from this single payload
        ↓
Time range changes → filterAnalyticsByDays() → instant re-render
Cluster card click → ReviewsView filtered by cluster_id
Export button → CSV/Excel generated in browser, no server needed
AI Reply click → POST /api/reply → Groq returns reply in ~1 second
```

---

## 5. Deployment Architecture

```
GitHub (main branch)
    ├── Push → Vercel auto-builds frontend (~1 min)
    └── Push → Render auto-builds backend (~3 min)

Vercel (Frontend)
    • CDN-hosted, global edge network
    • vercel.json rewrites /api/* → Render backend
    • Zero downtime deploys

Render (Backend)
    • Free tier — sleeps after 15 min idle
    • Fix: UptimeRobot pings /api/health every 14 min
    • Environment variable: GROQ_API_KEY
```

---

*Document generated for Insightly v1.0 — April 2026*
