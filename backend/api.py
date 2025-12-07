from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import httpx
import json
from dotenv import load_dotenv
from fastapi.responses import PlainTextResponse
import json


# Load environment variables
load_dotenv()

GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL: str = "gemini-2.0-flash"

# Initialize FastAPI (no root_path for Vercel)
app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://shreyreely.vercel.app",  # frontend domain
        "http://localhost:3000",          # local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health check (Pretty formatted JSON)
@app.get("/", response_class=PlainTextResponse)
async def root():
    data = {
        "status": "Backend is running successfully ✅",
        "test_endpoints": {
            "Summarize": "/api/summarize",
            "Generate Ideas": "/api/generate-ideas",
            "Refine Content": "/api/refine-content",
            "Chat": "/api/chat"
        },
        "usage": "Send POST requests with JSON body to these endpoints."
    }
    return json.dumps(data, indent=2, ensure_ascii=False)

    return JSONResponse(
        content=json.loads(json.dumps(data, indent=2, ensure_ascii=False)),
        media_type="application/json"
    )

# Request models
class SummarizeRequest(BaseModel):
    text: str

class IdeaRequest(BaseModel):
    topic: str

class RefineRequest(BaseModel):
    text: str
    instruction: str = ""

class ChatRequest(BaseModel):
    message: Optional[str] = None
    query: Optional[str] = None
    history: Optional[list] = None

# Gemini API call
async def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set.")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()

    try:
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        raise HTTPException(status_code=502, detail="Unexpected response from Gemini API")

# Endpoints
@app.post("/api/summarize")
async def summarize(req: SummarizeRequest):
    return {"summary": await call_gemini(f"Summarize this text concisely:\n\n{req.text}")}

@app.post("/api/generate-ideas")
async def generate_ideas(req: IdeaRequest):
    prompt = (
        "Generate 8 creative, practical ideas for the topic below. "
        "Return each idea on its own line without numbering.\n\n"
        f"Topic: {req.topic}"
    )
    ideas = [line.strip("- •* ") for line in (await call_gemini(prompt)).splitlines() if line.strip()]
    return {"ideas": ideas}

@app.post("/api/refine-content")
async def refine_content(req: RefineRequest):
    instruction = req.instruction or "Improve clarity, grammar, and tone while preserving meaning."
    return {"refinedText": await call_gemini(f"Refine the following text according to this instruction: '{instruction}'.\n\nText:\n{req.text}")}

@app.post("/api/chat")
async def chat(req: ChatRequest):
    user_input = req.message or req.query or ""
    return {"response": await call_gemini(f"You are a helpful assistant. Answer clearly and concisely.\n\nUser: {user_input}")}
