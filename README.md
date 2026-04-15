# Insightly — AI-Powered App Review Analytics

> Analyze Google Play Store reviews instantly. Get AI clusters, sentiment trends, key issues, and generate developer replies — all in one dashboard.

---

## 🚀 Live Demo

- **Frontend:** [insightly.vercel.app](https://insightly.vercel.app)
- **Backend API:** [insightly-backend-scuv.onrender.com/api/health](https://insightly-backend-scuv.onrender.com/api/health)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python 3.11, FastAPI, Uvicorn |
| AI (Reply) | Groq API (`llama-3.1-8b-instant`) |
| Scraping | `google-play-scraper` Python library |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📋 Prerequisites

- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **Python** 3.10+ → [python.org](https://python.org)
- **pnpm** → `npm install -g pnpm`
- **Groq API key** (free) → [console.groq.com](https://console.groq.com)

---

## ⚙️ Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/insightly.git
cd insightly
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```env
GROQ_API_KEY=gsk_your_key_here
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

Backend runs at → `http://localhost:8000`
Health check → `http://localhost:8000/api/health`

### 3. Frontend setup

Open a new terminal in the project root:

```bash
pnpm install
pnpm dev
```

Frontend runs at → `http://localhost:5173`

> The Vite dev server automatically proxies `/api/*` calls to `localhost:8000` — no extra config needed.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Groq API key for AI reply generation |
| `GROQ_MODEL` | Optional | Default: `llama-3.1-8b-instant` |
| `OLLAMA_BASE_URL` | Optional | If using local Ollama instead of Groq |
| `OLLAMA_MODEL` | Optional | Default: `llama3.2:1b` |

---

## 📁 Project Structure

```
insightly/
├── backend/
│   ├── main.py          # FastAPI app, endpoints
│   ├── scraper.py       # Google Play Store scraper
│   ├── analytics.py     # Clustering, sentiment, insights
│   ├── ai_service.py    # Groq / Ollama AI reply
│   ├── requirements.txt
│   └── Procfile
├── src/
│   ├── app/
│   │   ├── App.tsx              # Root component, routing
│   │   └── components/
│   │       ├── views/           # Page-level views
│   │       │   ├── ReviewsView.tsx
│   │       │   ├── AIInsightsView.tsx
│   │       │   ├── AnalyticsView.tsx
│   │       │   ├── TrendsView.tsx
│   │       │   └── ExportView.tsx
│   │       ├── ReviewCard.tsx
│   │       ├── AIClusterCard.tsx
│   │       ├── StatCard.tsx
│   │       └── AIReplyModal.tsx
│   ├── api/
│   │   └── client.ts    # API calls + TypeScript types
│   └── utils/
│       └── analytics.ts # Client-side time range filtering
├── vercel.json
└── vite.config.ts
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Connect GitHub repo on [vercel.com](https://vercel.com)
2. Framework: `Vite` | Build: `npm run build` | Output: `dist`
3. Auto-deploys on every `git push` to `main`

### Backend → Render
1. Connect GitHub repo on [render.com](https://render.com)
2. Root Directory: `backend` | Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add `GROQ_API_KEY` environment variable
4. Auto-deploys on every `git push` to `main`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scrape` | Start a scrape job, returns `job_id` |
| `GET` | `/api/status/{job_id}` | Poll job progress (0–100%) |
| `POST` | `/api/reply` | Generate AI reply for a review |
| `GET` | `/api/health` | Health check |

---

## 🙏 Credits

- [google-play-scraper](https://github.com/JoMingyu/google-play-scraper) — Play Store data
- [Groq](https://groq.com) — Ultra-fast LLM inference
- [Recharts](https://recharts.org) — Charts
- [Framer Motion](https://www.framer.com/motion/) — Animations
