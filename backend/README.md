# Backend (FastAPI + Gemini)

## Setup

1. Python 3.9+
2. Install deps
```bash
pip install -r requirements.txt
```
3. Create `.env` next to `api.py` with:
```bash
GEMINI_API_KEY=your_google_gemini_api_key
```

## Run
```bash
uvicorn api:app --reload --port 8000
```

## Endpoints
- POST `/api/summarize` { "text": string }
- POST `/api/generate-ideas` { "topic": string }
- POST `/api/refine-content` { "text": string, "instruction"?: string }
- POST `/api/chat` { "query": string }

CORS is enabled for all origins. Restrict in production.

