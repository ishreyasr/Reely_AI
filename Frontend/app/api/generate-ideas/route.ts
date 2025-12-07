import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    // Try to call FastAPI backend first
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/api/generate-ideas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.log("FastAPI backend not available, using fallback response")
    }

    // Fallback response for development/demo
    const fallbackIdeas = generateFallbackIdeas(topic)

    return NextResponse.json({
      ideas: fallbackIdeas,
      source: "fallback",
      message: "This is a demo response. Connect your FastAPI backend for AI-powered idea generation.",
    })
  } catch (error) {
    console.error("Error in generate-ideas API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateFallbackIdeas(topic: string): string[] {
  const ideaTemplates = [
    `The Ultimate Guide to ${topic}`,
    `10 Common Mistakes People Make with ${topic}`,
    `How ${topic} Can Transform Your Daily Life`,
    `The Future of ${topic}: Trends and Predictions`,
    `${topic} for Beginners: A Step-by-Step Approach`,
    `Expert Tips for Mastering ${topic}`,
    `The Hidden Benefits of ${topic}`,
    `${topic} vs Alternatives: A Comprehensive Comparison`,
    `Case Studies: Success Stories with ${topic}`,
    `Troubleshooting Common ${topic} Problems`,
    `The Science Behind ${topic}`,
    `${topic} on a Budget: Cost-Effective Solutions`,
  ]

  // Randomly select 6-8 ideas
  const shuffled = ideaTemplates.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 6)
}
