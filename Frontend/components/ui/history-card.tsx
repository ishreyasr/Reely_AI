"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Download, Clock } from "lucide-react"
import type { HistoryItem } from "@/hooks/use-persistent-history"

interface HistoryCardProps<T extends HistoryItem> {
  title: string
  description: string
  history: T[]
  onClear: () => void
  onExport: () => void
  onRemove: (id: string) => void
  renderItem: (item: T) => React.ReactNode
  emptyMessage?: string
  onItemClick?: (item: T) => void
}

export function HistoryCard<T extends HistoryItem>({
  title,
  description,
  history,
  onClear,
  onExport,
  onRemove,
  renderItem,
  emptyMessage = "No history available yet.",
  onItemClick,
}: HistoryCardProps<T>) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div key={item.id} className="relative group">
              <div
                className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => onItemClick?.(item)}
              >
                {renderItem(item)}
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(item.id)
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
