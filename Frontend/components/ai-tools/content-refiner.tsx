"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Loader2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePersistentHistory } from "@/hooks/use-persistent-history"
import { HistoryCard } from "@/components/ui/history-card"

interface RefineRequest {
  id: string
  originalText: string
  instruction: string
  refinedText: string
  timestamp: Date
}

interface ContentRefinerProps {
  onHistoryClick?: (data: { prompt: string; response: string; timestamp: string; type: string }) => void
}

const presetInstructions = [
  { value: "formal", label: "Make it more formal" },
  { value: "casual", label: "Make it more casual" },
  { value: "concise", label: "Make it more concise" },
  { value: "detailed", label: "Add more details" },
  { value: "enthusiastic", label: "Make it more enthusiastic" },
  { value: "professional", label: "Make it more professional" },
  { value: "grammar", label: "Fix grammar and spelling" },
  { value: "clarity", label: "Improve clarity" },
]

export default function ContentRefiner({ onHistoryClick }: ContentRefinerProps) {
  const [originalText, setOriginalText] = useState("")
  const [instruction, setInstruction] = useState("")
  const [customInstruction, setCustomInstruction] = useState("")
  const [refinedText, setRefinedText] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const { history, addToHistory, clearHistory, removeFromHistory, exportHistory, isLoaded } =
    usePersistentHistory<RefineRequest>("content-refiner-history", 10)

  const handleRefineContent = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some text to refine.",
        variant: "destructive",
      })
      return
    }

    const finalInstruction = customInstruction.trim() || instruction.trim() || "Improve this content"

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/refine-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: originalText,
          instruction: finalInstruction,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to refine content")
      }

      const data = await response.json()
      const refined =
        data.refinedText ||
        `This is a placeholder for the refined content. The original text would be improved based on the instruction: "${finalInstruction}". The actual API integration will be implemented in the next step.`

      setRefinedText(refined)

      addToHistory({
        originalText: originalText.substring(0, 100) + (originalText.length > 100 ? "..." : ""),
        instruction: finalInstruction,
        refinedText: refined,
      })

      toast({
        title: "Content refined!",
        description: "Your content has been successfully improved.",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to refine content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(refinedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Refined content copied to clipboard.",
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
            <RefreshCw className="h-5 w-5 text-green-600" />
            Content Refiner
          </CardTitle>
          <CardDescription>Improve your content by providing specific instructions for refinement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="original-text">Original Content</Label>
            <Textarea
              id="original-text"
              placeholder="Paste your content here..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-gray-500">{originalText.length} characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preset-instruction">Quick Instructions</Label>
              <Select
                onValueChange={(value) => {
                  const preset = presetInstructions.find((p) => p.value === value)
                  if (preset) {
                    setInstruction(preset.label)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {presetInstructions.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-instruction">Custom Instruction</Label>
              <Input
                id="custom-instruction"
                placeholder="Or write your own instruction..."
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleRefineContent} disabled={loading || !originalText.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refining Content...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refine Content
              </>
            )}
          </Button>

          {refinedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Refined Content</Label>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{refinedText}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoaded && (
        <div className="max-w-2xl mx-auto">
          <HistoryCard
            title="Recent Refinements"
            description="Your content refinement history (stored locally)"
            history={history}
            onClear={clearHistory}
            onExport={exportHistory}
            onRemove={removeFromHistory}
            emptyMessage="No refinements yet. Try refining some content above!"
            onItemClick={(item) => {
              onHistoryClick?.({
                prompt: `Original: ${item.originalText}\nInstruction: ${item.instruction}`,
                response: item.refinedText,
                timestamp: item.timestamp.toLocaleString(),
                type: "Content Refinement",
              })
            }}
            renderItem={(request) => (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-800">Instruction: {request.instruction}</p>
                  <p className="text-xs text-gray-500">{request.timestamp.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-500 mb-2">Original: {request.originalText}</p>
                <p className="text-sm text-gray-800">{request.refinedText.substring(0, 150)}...</p>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
