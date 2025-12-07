import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Try to call FastAPI backend first
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, history }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.log("FastAPI backend not available, using fallback response")
    }

    // Fallback response for development/demo
    const fallbackResponse = generateFallbackChatResponse(message, history)

    return NextResponse.json({
      response: fallbackResponse,
      source: "fallback",
      message: "This is a demo response. Connect your FastAPI backend for AI-powered conversations.",
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateFallbackChatResponse(message: string, history: Message[] = []): string {
  const lowerMessage = message.toLowerCase()

  // Simple pattern matching for demo responses
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! I'm your AI assistant. How can I help you today?"
  }

  if (lowerMessage.includes("help")) {
    return "I'm here to help! I can assist you with content creation, brainstorming ideas, answering questions, and more. What would you like to work on?"
  }

  if (lowerMessage.includes("what") && lowerMessage.includes("do")) {
    return "I can help you with various tasks like summarizing text, generating creative ideas, refining content, answering questions, and having conversations. What specific task interests you?"
  }

  if (lowerMessage.includes("thank")) {
    return "You're welcome! I'm glad I could help. Is there anything else you'd like to work on?"
  }

  if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
    return "Goodbye! Feel free to come back anytime you need assistance with your content creation tasks."
  }

  if (lowerMessage.includes("idea") || lowerMessage.includes("brainstorm")) {
    return "I'd love to help you brainstorm! Could you tell me more about the topic or project you're working on? The more context you provide, the better ideas I can suggest."
  }

  if (lowerMessage.includes("write") || lowerMessage.includes("content")) {
    return "I can definitely help with writing and content creation! What type of content are you looking to create? Blog posts, social media content, emails, or something else?"
  }

  // Default response
  const responses = [
    "That's an interesting point! Could you tell me more about what you're thinking?",
    "I understand what you're saying. How can I help you with that?",
    "Thanks for sharing that with me. What would you like to explore further?",
    "That's a great question! Let me think about how I can best assist you with that.",
    "I appreciate you bringing that up. What specific aspect would you like to focus on?",
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
