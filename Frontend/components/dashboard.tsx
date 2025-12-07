"use client"

import { useState } from "react"
import type { User } from "firebase/auth"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sparkles, FileText, Lightbulb, RefreshCw, MessageCircle, LogOut, UserIcon, Menu } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import TextSummarizer from "@/components/ai-tools/text-summarizer"
import IdeaGenerator from "@/components/ai-tools/idea-generator"
import ContentRefiner from "@/components/ai-tools/content-refiner"
import AIChatbot from "@/components/ai-tools/ai-chatbot"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DashboardProps {
  user: User | null
}

type AITool = "summarizer" | "ideas" | "refiner" | "chatbot"

interface HistoryPopupData {
  prompt: string
  response: string
  timestamp: string
  type: string
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTool, setActiveTool] = useState<AITool>("summarizer")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [historyPopup, setHistoryPopup] = useState<HistoryPopupData | null>(null)
  // Track if we should redirect to chatbot from history click
  const [redirectToChatbot, setRedirectToChatbot] = useState(false)
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      })
      // Redirect to main page
      window.location.reload()
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const tools = [
    {
      id: "summarizer" as AITool,
      name: "Text Summarizer",
      description: "Condense long text into key points",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "ideas" as AITool,
      name: "Idea Generator",
      description: "Generate creative ideas for any topic",
      icon: Lightbulb,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: "refiner" as AITool,
      name: "Content Refiner",
      description: "Improve and polish your content",
      icon: RefreshCw,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "chatbot" as AITool,
      name: "AI Assistant",
      description: "Chat with your AI assistant",
      icon: MessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const activeTool_info = tools.find((tool) => tool.id === activeTool)

  const renderActiveTool = () => {
    switch (activeTool) {
      case "summarizer":
        return <TextSummarizer onHistoryClick={setHistoryPopup} />
      case "ideas":
        return <IdeaGenerator onHistoryClick={setHistoryPopup} />
      case "refiner":
        return <ContentRefiner onHistoryClick={setHistoryPopup} />
      case "chatbot":
        return <AIChatbot onHistoryClick={setHistoryPopup} />
      default:
        return <TextSummarizer onHistoryClick={setHistoryPopup} />
    }
  }

  const displayUser = user || {
    displayName: "Demo User",
    email: "demo@example.com",
    photoURL: null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Fixed header for mobile and desktop */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 lg:left-64">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-lg lg:hidden">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg lg:hidden">REELY AI</h1>
                <div className="hidden lg:block">
                  {activeTool_info && (
                    <div>
                      <div className="flex items-center gap-2">
                        <activeTool_info.icon className={`h-5 w-5 ${activeTool_info.color}`} />
                        <span className="font-semibold text-gray-900">{activeTool_info.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{activeTool_info.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{displayUser.displayName || "User"}</p>
              <p className="text-xs text-gray-500">{displayUser.email}</p>
            </div>

            {/* Profile dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={displayUser.photoURL || (displayUser.email ? `https://www.gravatar.com/avatar/${Buffer.from(displayUser.email.trim().toLowerCase()).toString('hex')}?d=identicon` : undefined)} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                    {displayUser.displayName?.charAt(0) || displayUser.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    signOut(auth)
                      .then(() => {
                        toast({
                          title: "Signed out",
                          description: "You have been successfully signed out.",
                        })
                        // Redirect to main page by reloading the page
                        // This will trigger the auth state change and show the login page
                        window.location.reload()
                      })
                      .catch((error) => {
                        console.error("Sign out error:", error)
                        toast({
                          title: "Error",
                          description: "Failed to sign out. Please try again.",
                          variant: "destructive",
                        })
                      })
                  }}
                  variant="destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-screen">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">REELY AI</h1>
                <p className="text-xs text-gray-500">Content Studio</p>

              </div>
            </div>
          </div>

          {/* Navigation - takes up remaining space */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTool === tool.id
                      ? `${tool.bgColor} ${tool.color} border border-current border-opacity-20`
                      : "hover:bg-gray-50 text-gray-700"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium text-sm">{tool.name}</div>
                    <div className="text-xs opacity-70">{tool.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={displayUser.photoURL || ""} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {displayUser.displayName?.charAt(0) || displayUser.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayUser.displayName || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{displayUser.email}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full bg-white hover:bg-gray-100 border-gray-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* History Popup Modal */}
      <Dialog open={!!historyPopup} onOpenChange={(open) => {
        if (!open) {
          // If the dialog is closing and it's a chat type, redirect to chatbot
          if (historyPopup?.type === "chat" && redirectToChatbot) {
            setActiveTool("chatbot")
            setRedirectToChatbot(false)
          }
          setHistoryPopup(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              History Details
            </DialogTitle>
          </DialogHeader>
          {historyPopup && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Type:</h3>
                <p className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md inline-block">
                  {historyPopup.type}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Timestamp:</h3>
                <p className="text-sm text-gray-600">{historyPopup.timestamp}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Your Prompt:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{historyPopup.prompt}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">AI Response:</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{historyPopup.response}</p>
                </div>
              </div>
              {historyPopup.type === "chat" && (
                <div className="flex justify-end">
                  <Button onClick={() => {
                    setRedirectToChatbot(true)
                    setHistoryPopup(null)
                  }}>
                    Open in Chat
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="lg:ml-64">
        <main className="min-h-screen p-4 lg:p-6 pt-24 lg:pt-28">
          <div className="max-w-4xl mx-auto">{renderActiveTool()}</div>
        </main>
      </div>
    </div>
  )
}


