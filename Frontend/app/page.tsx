"use client"

import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import AuthPage from "@/components/auth-page"
import Dashboard from "@/components/dashboard"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard user={user} /> : <AuthPage />
}
