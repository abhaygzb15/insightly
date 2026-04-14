"""
ReviewSense FastAPI Backend
──────────────────────────
Start: uvicorn main:app --reload --port 8000

Endpoints:
  POST /api/scrape          → {job_id}
  GET  /api/status/{job_id} → {status, progress, message, result?, error?}
  POST /api/reply           → {reply}
  GET  /api/health          → {status}
"""

import uuid
import threading
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from scraper import extract_app_id, scrape_reviews
from analytics import compute_analytics        # pure-Python, no AI needed
from ai_service import generate_reply as ai_generate_reply

app = FastAPI(title="ReviewSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

jobs: dict[str, dict] = {}

TIME_RANGES = {
    "1w": timedelta(weeks=1),
    "1m": timedelta(days=30),
    "6m": timedelta(days=182),
    "1y": timedelta(days=365),
    "2y": timedelta(days=730),
}
TIME_RANGE_LABELS = {
    "1w": "Last Week",
    "1m": "Last Month",
    "6m": "Last 6 Months",
    "1y": "Last 1 Year",
    "2y": "Last 2 Years",
}


# ── Pydantic models ───────────────────────────────────────────────────────────

class ScrapeRequest(BaseModel):
    app_url:    str
    time_range: str = "1m"
    country:    str = "in"
    lang:       str = "en"


class ReplyRequest(BaseModel):
    review: str
    rating: int
    tone:   str = "Professional"


# ── Background worker ─────────────────────────────────────────────────────────

def _run_scrape(job_id: str, app_id: str, cutoff: datetime,
                country: str, lang: str, period: str):
    try:
        jobs[job_id].update(status="running", message="Connecting to Play Store…")

        def on_progress(batch: int, total: int):
            # scraping = 0-85%, analytics = 85-100%
            jobs[job_id]["progress"] = min(85, batch * 4)
            jobs[job_id]["message"]  = f"Fetched {total:,} reviews (batch {batch})…"

        reviews = scrape_reviews(app_id, cutoff, country=country, lang=lang,
                                 progress_callback=on_progress)

        jobs[job_id].update(progress=88, message="Computing analytics & clusters…")

        # All analytics (including clustering) are pure-Python — < 1 second
        analytics = compute_analytics(reviews, app_id, period, country)

        jobs[job_id].update(progress=100, status="done", message="Done", result=analytics)

    except Exception as exc:
        jobs[job_id].update(status="error", message=str(exc), error=str(exc))


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/scrape")
def start_scrape(req: ScrapeRequest):
    app_id = extract_app_id(req.app_url)
    if not app_id:
        raise HTTPException(status_code=400, detail="Could not parse app ID from URL")

    delta  = TIME_RANGES.get(req.time_range, timedelta(days=30))
    cutoff = datetime.now(timezone.utc) - delta
    period = TIME_RANGE_LABELS.get(req.time_range, "Last Month")

    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "pending", "progress": 0, "message": "Starting…",
                    "result": None, "error": None}

    threading.Thread(
        target=_run_scrape,
        args=(job_id, app_id, cutoff, req.country, req.lang, period),
        daemon=True,
    ).start()

    return {"job_id": job_id}


@app.get("/api/status/{job_id}")
def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]


@app.post("/api/reply")
async def get_reply(req: ReplyRequest):
    try:
        reply = await ai_generate_reply(req.review, req.rating, req.tone)
        return {"reply": reply}
    except RuntimeError as e:
        # Ollama not running — return helpful error to frontend
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Reply generation failed: {e}")


@app.get("/api/health")
def health():
    return {"status": "ok"}
