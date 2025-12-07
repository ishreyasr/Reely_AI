interface ApiResponse<T> {
  data?: T
  error?: string
  source?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "") {
    // In production on Vercel, API requests will be proxied through the frontend
    // In development, use the provided baseUrl or default to local API
    this.baseUrl = process.env.NODE_ENV === 'production' ? '' : (baseUrl || 'http://localhost:8000')
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error occurred",
      }
    }
  }

  async summarizeText(text: string) {
    return this.makeRequest<{ summary: string }>("/api/summarize", {
      method: "POST",
      body: JSON.stringify({ text }),
    })
  }

  async generateIdeas(topic: string) {
    return this.makeRequest<{ ideas: string[] }>("/api/generate-ideas", {
      method: "POST",
      body: JSON.stringify({ topic }),
    })
  }

  async refineContent(text: string, instruction: string) {
    return this.makeRequest<{ refinedText: string }>("/api/refine-content", {
      method: "POST",
      body: JSON.stringify({ text, instruction }),
    })
  }

  async sendChatMessage(message: string, history: any[] = []) {
    return this.makeRequest<{ response: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    })
  }
}

export const apiClient = new ApiClient()
