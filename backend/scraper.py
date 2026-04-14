"""
Google Play Store review scraper module.
Adapted from the interactive CLI script to be importable by the FastAPI backend.
"""

import re
import sys
from datetime import datetime, timezone

try:
    from google_play_scraper import reviews, Sort
except ImportError:
    print("Missing dependency. Run: pip install google-play-scraper")
    sys.exit(1)


def extract_app_id(raw: str) -> str | None:
    """Pull the app package name from a URL or accept a raw package name."""
    raw = raw.strip()
    match = re.search(r'[?&]id=([A-Za-z][A-Za-z0-9._]+)', raw)
    if match:
        return match.group(1)
    if re.match(r'^[A-Za-z][A-Za-z0-9._]+$', raw):
        return raw
    return None


def ensure_aware(dt):
    """Make a datetime timezone-aware (UTC) if it is naive."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def scrape_reviews(app_id: str, cutoff: datetime, country: str = "in",
                   lang: str = "en", progress_callback=None) -> list[dict]:
    """
    Fetch all reviews newer than cutoff datetime.
    progress_callback(batch, total) is called after each batch if provided.
    Returns list of review dicts.
    """
    collected = []
    token = None
    batch = 0
    done = False

    while not done:
        batch += 1
        try:
            result, token = reviews(
                app_id,
                lang=lang,
                country=country,
                sort=Sort.NEWEST,
                count=200,
                continuation_token=token,
            )
        except Exception as exc:
            print(f"Error on batch {batch}: {exc}")
            break

        if not result:
            break

        for r in result:
            review_date = ensure_aware(r.get("at"))

            if review_date and review_date < cutoff:
                done = True
                break

            collected.append({
                "date":        review_date.strftime("%Y-%m-%d") if review_date else "N/A",
                "datetime":    review_date.strftime("%Y-%m-%d %H:%M:%S") if review_date else "N/A",
                "rating":      r.get("score", 0),
                "author":      r.get("userName", "Anonymous"),
                "thumbs_up":   r.get("thumbsUpCount", 0),
                "review":      (r.get("content") or "").replace("\n", " ").strip(),
                "app_version": r.get("reviewCreatedVersion", ""),
                "reply":       (r.get("replyContent") or "").replace("\n", " ").strip(),
                "replied_at":  str(r.get("repliedAt", "")),
            })

        if progress_callback:
            progress_callback(batch, len(collected))

        if not token:
            break

    return collected
