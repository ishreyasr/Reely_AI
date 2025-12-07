"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { FileText, Loader2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePersistentHistory } from "@/hooks/use-persistent-history"
import { HistoryCard } from "../ui/history-card"

interface SummaryRequest {
  id: string
  input: string
  output: string
  timestamp: Date
}

interface TextSummarizerProps {
  onHistoryClick?: (data: { prompt: string; response: string; timestamp: string; type: string }) => void
}

export default function TextSummarizer({ onHistoryClick }: TextSummarizerProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const { history, addToHistory, clearHistory, removeFromHistory, exportHistory, isLoaded } =
    usePersistentHistory<SummaryRequest>("text-summarizer-history", 10)

  const handleSummarize = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()
      const summary =
        data.summary ||
        "This is a placeholder summary. The actual API integration will be implemented in the next step."

      setOutput(summary)

      addToHistory({
        input: input.substring(0, 100) + (input.length > 100 ? "..." : ""),
        output: summary,
      })

      toast({
        title: "Summary generated!",
        description: "Your text has been successfully summarized.",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the text manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Tool */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Text Summarizer
          </CardTitle>
          <CardDescription>
            Enter a long piece of text and get a concise summary highlighting the key points.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-text">Text to Summarize</Label>
            <Textarea
              id="input-text"
              placeholder="Paste your long text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-gray-500">{input.length} characters</p>
          </div>

          <Button onClick={handleSummarize} disabled={loading || !input.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Summarize Text
              </>
            )}
          </Button>

          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Summary</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-gray-800 leading-relaxed">{output}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoaded && (
        <div className="max-w-2xl mx-auto">
          <HistoryCard
            title="Recent Summaries"
            description="Your summarization history (stored locally)"
            history={history}
            onClear={clearHistory}
            onExport={exportHistory}
            onRemove={removeFromHistory}
            onItemClick={
              onHistoryClick
                ? (request) => {
                  onHistoryClick({
                    prompt: request.input,
                    response: request.output,
                    timestamp: request.timestamp.toLocaleString(),
                    type: "Text Summary",
                  })
                }
                : undefined
            }
            emptyMessage="No summaries yet. Create your first summary above!"
            renderItem={(request) => (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-600 font-medium">{request.timestamp.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-500 mb-2">Input: {request.input}</p>
                <p className="text-sm text-gray-800">{request.output}</p>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
