"use client"

import { useState } from "react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Sparkles, Zap, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const firebaseConfigured = isFirebaseConfigured()

  const signInWithGoogle = async () => {
    if (!firebaseConfigured) {
      toast({
        title: "Firebase not configured",
        description: "Please set up Firebase environment variables in Project Settings.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      if (result.user) {
        toast({
          title: "Welcome to REELY AI!",
          description: `Signed in as ${result.user.displayName || "User"}.`,
        })
      }
    } catch (error) {
      console.error("Error signing in:", error)
      toast({
        title: "Sign in failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            REELY AI
          </h1>
          <p className="text-gray-300 text-lg">Smart Content Studio</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700/40 shadow-md">
            <Brain className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">AI-Powered Text Summarization</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700/40 shadow-md">
            <Zap className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-200">Creative Idea Generation</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700/40 shadow-md">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-medium text-gray-200">Content Refinement Tools</span>
          </div>
        </div>

        {/* Sign In */}
        <Card className="bg-gray-800/90 backdrop-blur-md border-gray-700/40 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Get Started
            </CardTitle>
            <CardDescription className="text-gray-300">
              Sign in with Google to access your AI content studio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="lg"
            >
              <Chrome className="mr-2 h-5 w-5" />
              {loading ? "Signing in..." : "Continue with Google"}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}


