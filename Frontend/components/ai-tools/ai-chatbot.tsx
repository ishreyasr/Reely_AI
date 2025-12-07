"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader2, User, Bot, Trash2, Download, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePersistentHistory } from "@/hooks/use-persistent-history"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatSession {
  id: string
  messages: Message[]
  timestamp: Date
  title: string
}

interface AIChatbotProps {
  onHistoryClick?: (data: { prompt: string; response: string; timestamp: string; type: string }) => void
}

export default function AIChatbot({ onHistoryClick }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null) // Track current session
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const {
    history: chatHistory,
    addToHistory: addChatSession,
    clearHistory: clearChatHistory,
    removeFromHistory: removeChatSession,
    exportHistory: exportChatHistory,
    isLoaded,
  } = usePersistentHistory<ChatSession>("ai-chatbot-history", 20)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Save chat session only when explicitly requested or when session ends
  const saveCurrentSession = () => {
    if (!currentSessionId || messages.length <= 1) return // Don't save empty sessions

    const userMessages = messages.filter((msg) => msg.role === "user")
    if (userMessages.length === 0) return // Don't save sessions without user messages

    const updatedSession = {
      id: currentSessionId,
      messages: [...messages],
      timestamp: new Date(), // Update timestamp to current time
      title: userMessages[0].content.substring(0, 50) + (userMessages[0].content.length > 50 ? "..." : ""),
    }

    // The updated hook will handle updating existing sessions
    addChatSession(updatedSession)
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // If no session, create one now
    if (!currentSessionId) {
      const newSessionId = Date.now().toString()
      setCurrentSessionId(newSessionId)
      // Don't add to history yet - wait until chat has content
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-5),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")
      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "No response.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save the session after getting a response
      // This ensures we only save meaningful conversations
      saveCurrentSession()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to get response.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const loadChatSession = (session: ChatSession) => {
    // Save current session before switching if it has content
    // Only save if there are user messages
    if (currentSessionId && messages.length > 1 && messages.some(msg => msg.role === "user")) {
      saveCurrentSession()
    }

    setMessages(session.messages)
    setCurrentSessionId(session.id)

    // No need for loading session flag anymore since we're not auto-saving

    // If this chat session is clicked from the dashboard, notify parent component
    if (onHistoryClick && session.messages.length >= 2) {
      const lastUserMsg = [...session.messages].reverse().find(msg => msg.role === "user")
      const lastAssistantMsg = [...session.messages].reverse().find(msg => msg.role === "assistant")

      if (lastUserMsg && lastAssistantMsg) {
        onHistoryClick({
          prompt: lastUserMsg.content,
          response: lastAssistantMsg.content,
          timestamp: session.timestamp.toISOString(),
          type: "chat"
        })
      }
    }

    toast({
      title: "Chat loaded!",
      description: "Previous conversation has been restored.",
    })
  }

  const startNewChat = () => {
    // Save current session before starting new one if it has content
    // Only save if there are user messages
    if (currentSessionId && messages.length > 1 && messages.some(msg => msg.role === "user")) {
      saveCurrentSession()
    }

    setMessages([
      {
        id: "welcome",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        role: "assistant",
        timestamp: new Date(),
      },
    ])
    // Set currentSessionId to null until user sends a message
    // This prevents creating empty sessions in history
    setCurrentSessionId(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col relative">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription>
                    Chat with your AI assistant for help, questions, or creative brainstorming.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={startNewChat}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-blue-600 text-white" : "bg-purple-100 text-purple-600"
                          }`}
                      >
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 opacity-70`}>{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white dark:bg-gray-950">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={loading || !input.trim()} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {isLoaded && (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Chat History</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={exportChatHistory}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearChatHistory}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Your saved conversations</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No saved chats yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors group"
                        onClick={() => loadChatSession(session)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{session.title || "New Chat"}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeChatSession(session.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
