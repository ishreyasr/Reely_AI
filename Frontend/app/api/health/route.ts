import { NextResponse } from "next/server"

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000"

export async function GET() {
  try {
    // Check if FastAPI backend is available
    let backendStatus = "disconnected"
    let backendMessage = "FastAPI backend is not available"

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        backendStatus = "connected"
        backendMessage = "FastAPI backend is running"
      }
    } catch (error) {
      // Backend not available, use fallback
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      backend: {
        status: backendStatus,
        message: backendMessage,
        url: FASTAPI_BASE_URL,
      },
      frontend: {
        status: "running",
        message: "Next.js frontend is operational",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
