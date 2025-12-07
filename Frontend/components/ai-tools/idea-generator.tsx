"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lightbulb, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePersistentHistory } from "@/hooks/use-persistent-history"
import { HistoryCard } from "@/components/ui/history-card"

interface IdeaRequest {
  id: string
  topic: string
  ideas: string[]
  timestamp: Date
}

interface IdeaGeneratorProps {
  onHistoryClick?: (data: { prompt: string; response: string; timestamp: string; type: string }) => void
}

export default function IdeaGenerator({ onHistoryClick }: IdeaGeneratorProps) {
  const [topic, setTopic] = useState("")
  const [ideas, setIdeas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const { history, addToHistory, clearHistory, removeFromHistory, exportHistory, isLoaded } =
    usePersistentHistory<IdeaRequest>("idea-generator-history", 10)

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate ideas for.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate ideas")
      }

      const data = await response.json()
      const generatedIdeas = data.ideas || [
        `Create a comprehensive guide about ${topic}`,
        `10 surprising facts about ${topic}`,
        `How ${topic} impacts daily life`,
        `The future of ${topic}`,
        `Common misconceptions about ${topic}`,
        `${topic} for beginners: A step-by-step approach`,
        `Expert tips for mastering ${topic}`,
        `The history and evolution of ${topic}`,
      ]

      setIdeas(generatedIdeas)

      addToHistory({
        topic,
        ideas: generatedIdeas,
      })

      toast({
        title: "Ideas generated!",
        description: `Generated ${generatedIdeas.length} creative ideas for "${topic}".`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Tool */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Idea Generator
          </CardTitle>
          <CardDescription>
            Enter any topic and get a list of creative ideas for content, projects, or discussions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic-input">Topic</Label>
            <Input
              id="topic-input"
              placeholder="e.g., sustainable living, coffee shop marketing, productivity tips..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGenerateIdeas()}
            />
          </div>

          <Button onClick={handleGenerateIdeas} disabled={loading || !topic.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate Ideas
              </>
            )}
          </Button>

          {ideas.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Ideas</Label>
                <Button variant="outline" size="sm" onClick={handleGenerateIdeas} disabled={loading}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {ideas.map((idea, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-800 leading-relaxed">{idea}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoaded && (
        <div className="max-w-2xl mx-auto">
          <HistoryCard
            title="Recent Ideas"
            description="Your idea generation history (stored locally)"
            history={history}
            onClear={clearHistory}
            onExport={exportHistory}
            onRemove={removeFromHistory}
            onItemClick={
              onHistoryClick
                ? (request) => {
                  onHistoryClick({
                    prompt: `Topic: ${request.topic}`,
                    response: request.ideas.map((idea, index) => `${index + 1}. ${idea}`).join("\n"),
                    timestamp: request.timestamp.toLocaleString(),
                    type: "Idea Generation",
                  })
                }
                : undefined
            }
            emptyMessage="No ideas generated yet. Try generating some above!"
            renderItem={(request) => (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-800">Topic: {request.topic}</p>
                  <p className="text-xs text-gray-500">{request.timestamp.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-600">{request.ideas.length} ideas generated</p>
                <div className="mt-2 space-y-1">
                  {request.ideas.slice(0, 3).map((idea, index) => (
                    <p key={index} className="text-xs text-gray-700">
                      • {idea}
                    </p>
                  ))}
                  {request.ideas.length > 3 && (
                    <p className="text-xs text-gray-500">...and {request.ideas.length - 3} more</p>
                  )}
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
