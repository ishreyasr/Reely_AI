"use client"

import { useState, useEffect } from "react"

export interface HistoryItem {
  id: string
  timestamp: Date
  [key: string]: any
}

export function usePersistentHistory<T extends HistoryItem>(storageKey: string, maxItems = 10) {
  const [history, setHistory] = useState<T[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(historyWithDates)
      }
    } catch (error) {
      console.error(`Error loading history for ${storageKey}:`, error)
    } finally {
      setIsLoaded(true)
    }
  }, [storageKey])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && history.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(history))
      } catch (error) {
        console.error(`Error saving history for ${storageKey}:`, error)
      }
    }
  }, [history, storageKey, isLoaded])

  const addToHistory = (item: Omit<T, "id" | "timestamp"> & { id?: string }) => {
    // If an ID is provided, use it; otherwise generate a new one
    const itemId = item.id || Date.now().toString()

    const newItem = {
      ...item,
      id: itemId,
      timestamp: new Date(),
    } as T

    setHistory((prev) => {
      // Check if an item with this ID already exists
      const existingIndex = prev.findIndex(existingItem => existingItem.id === itemId)

      if (existingIndex !== -1) {
        // Update the existing item instead of adding a new one
        const updatedHistory = [...prev]
        updatedHistory[existingIndex] = newItem
        // Move the updated item to the top of the list
        return [
          updatedHistory[existingIndex],
          ...updatedHistory.slice(0, existingIndex),
          ...updatedHistory.slice(existingIndex + 1)
        ].slice(0, maxItems)
      }

      // Add new item at the beginning
      return [newItem, ...prev.slice(0, maxItems - 1)]
    })
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error(`Error clearing history for ${storageKey}:`, error)
    }
  }

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${storageKey}-history-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    exportHistory,
    isLoaded,
  }
}
