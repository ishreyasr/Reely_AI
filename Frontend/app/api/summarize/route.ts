import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Try to call FastAPI backend first
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.log("FastAPI backend not available, using fallback response")
    }

    // Fallback response for development/demo
    const fallbackSummary = generateFallbackSummary(text)

    return NextResponse.json({
      summary: fallbackSummary,
      source: "fallback",
      message: "This is a demo response. Connect your FastAPI backend for AI-powered summaries.",
    })
  } catch (error) {
    console.error("Error in summarize API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateFallbackSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const wordCount = text.split(/\s+/).length

  if (wordCount < 50) {
    return "This text is already quite concise and doesn't need much summarization."
  }

  // Take first and last sentences, plus a middle one if available
  const summary = []
  if (sentences.length > 0) summary.push(sentences[0].trim())
  if (sentences.length > 2) {
    const middleIndex = Math.floor(sentences.length / 2)
    summary.push(sentences[middleIndex].trim())
  }
  if (sentences.length > 1) summary.push(sentences[sentences.length - 1].trim())

  return summary.join(". ") + "."
}
