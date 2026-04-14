"""
AI service — supports Groq (preferred, cloud) and Ollama (local fallback).

Priority:
  1. If GROQ_API_KEY is set → use Groq (fast, free tier, no local setup)
  2. Otherwise → use Ollama (local, requires `ollama serve`)

Setup for Groq (recommended):
  1. Get a free key at https://console.groq.com
  2. Add GROQ_API_KEY=gsk_... to backend/.env

Setup for Ollama (local):
  ollama pull llama3.2:1b
  Set OLLAMA_MODEL in .env to pick which one.
"""

import os
import logging
import httpx
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Groq config ───────────────────────────────────────────────────────────────
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL    = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

# ── Ollama config (fallback) ──────────────────────────────────────────────────
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "llama3.2:1b")

# ── Shared prompt builder ─────────────────────────────────────────────────────

def _build_prompt(review_text: str, rating: int, tone: str) -> tuple[str, str]:
    system = (
        "You are a professional mobile app developer replying to a user review on the Google Play Store. "
        "Write ONE short paragraph (1-2 sentences). "
        "Be genuine and specific to the review content. "
        "Do NOT start with 'Thank you for your review'. "
        "Do NOT make promises about timelines. "
        "Do NOT use bullet points or formatting."
    )
    user = (
        f"The user left a {rating}-star review:\n"
        f"\"{review_text[:300]}\"\n\n"
        f"Write a {tone.lower()} reply as the app developer (1-2 sentences max)."
    )
    return system, user


# ── Groq provider ─────────────────────────────────────────────────────────────

async def _generate_with_groq(review_text: str, rating: int, tone: str) -> str:
    system, user = _build_prompt(review_text, rating, tone)

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
        "max_tokens": 150,
        "temperature": 0.7,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        logger.info(f"Calling Groq ({GROQ_MODEL}) for reply, tone={tone}")
        resp = await client.post(
            f"{GROQ_BASE_URL}/chat/completions",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        data  = resp.json()
        reply = data["choices"][0]["message"]["content"].strip()
        logger.info("Groq reply generated OK")
        return reply


# ── Ollama provider ───────────────────────────────────────────────────────────

async def _generate_with_ollama(review_text: str, rating: int, tone: str) -> str:
    system, user = _build_prompt(review_text, rating, tone)

    payload = {
        "model":  OLLAMA_MODEL,
        "prompt": f"{system}\n\n{user}",
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 120,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=45) as client:
            logger.info(f"Calling Ollama ({OLLAMA_MODEL}) for reply, tone={tone}")
            resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            resp.raise_for_status()
            reply = resp.json()["response"].strip()
            logger.info("Ollama reply generated OK")
            return reply

    except httpx.ConnectError:
        raise RuntimeError(
            "No AI provider is configured. "
            "Either set GROQ_API_KEY in backend/.env (free at console.groq.com) "
            "or start Ollama: ollama serve"
        )
    except httpx.TimeoutException:
        raise RuntimeError(
            "Ollama timed out. Try a smaller model: OLLAMA_MODEL=llama3.2:1b"
        )


# ── Public entry point ────────────────────────────────────────────────────────

async def generate_reply(review_text: str, rating: int, tone: str) -> str:
    """
    Generate a developer reply. Uses Groq if GROQ_API_KEY is set, else Ollama.
    """
    if GROQ_API_KEY:
        return await _generate_with_groq(review_text, rating, tone)
    return await _generate_with_ollama(review_text, rating, tone)
