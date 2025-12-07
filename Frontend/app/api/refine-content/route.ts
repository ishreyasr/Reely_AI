import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { text, instruction } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (!instruction || typeof instruction !== "string") {
      return NextResponse.json({ error: "Instruction is required" }, { status: 400 })
    }

    // Try to call FastAPI backend first
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/api/refine-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, instruction }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.log("FastAPI backend not available, using fallback response")
    }

    // Fallback response for development/demo
    const fallbackRefinedText = generateFallbackRefinement(text, instruction)

    return NextResponse.json({
      refinedText: fallbackRefinedText,
      source: "fallback",
      message: "This is a demo response. Connect your FastAPI backend for AI-powered content refinement.",
    })
  } catch (error) {
    console.error("Error in refine-content API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateFallbackRefinement(text: string, instruction: string): string {
  const lowerInstruction = instruction.toLowerCase()

  if (lowerInstruction.includes("formal")) {
    return text
      .replace(/\bcan't\b/g, "cannot")
      .replace(/\bwon't\b/g, "will not")
      .replace(/\bdon't\b/g, "do not")
      .replace(/\bisn't\b/g, "is not")
      .replace(/\baren't\b/g, "are not")
      .replace(/\byou\b/g, "one")
      .replace(/\byour\b/g, "one's")
  }

  if (lowerInstruction.includes("casual")) {
    return text
      .replace(/\bcannot\b/g, "can't")
      .replace(/\bwill not\b/g, "won't")
      .replace(/\bdo not\b/g, "don't")
      .replace(/\bis not\b/g, "isn't")
      .replace(/\bare not\b/g, "aren't")
  }

  if (lowerInstruction.includes("concise")) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    return sentences.slice(0, Math.ceil(sentences.length * 0.7)).join(". ") + "."
  }

  if (lowerInstruction.includes("enthusiastic")) {
    return text + " This is truly exciting and amazing!"
  }

  if (lowerInstruction.includes("professional")) {
    return "In a professional context, " + text.toLowerCase()
  }

  // Default refinement
  return `[Refined based on "${instruction}"] ${text}`
}
