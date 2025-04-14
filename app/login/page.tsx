"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FlaskConical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { signIn, signInWithGoogle, signInAsGuest, isAuthenticated, isInitialized } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Check if user is already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isInitialized, isAuthenticated, router])

  // Check for redirect reason
  useEffect(() => {
    const from = searchParams.get("from")
    if (from) {
      setError("Please sign in to access this page")
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signIn(formData.email, formData.password)
      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      setError("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      toast({
        title: "Google Sign-in Successful",
        description: "You have been successfully authenticated with Google.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Google sign-in error:", error)
      setError("Google authentication failed. Please try again.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGuestSignIn = async () => {
    setIsGuestLoading(true)
    setError(null)

    try {
      await signInAsGuest()
      toast({
        title: "Guest Access Granted",
        description: "You are now signed in as a guest user.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Guest sign-in error:", error)
      setError("Failed to create guest session. Please try again.")
    } finally {
      setIsGuestLoading(false)
    }
  }

  // If still checking authentication status, show loading
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <FlaskConical className="h-10 w-10 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
          <CardDescription>Enter your credentials to access your BioProcess Designer account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign-in Button */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading || isGuestLoading}
          >
            {isGoogleLoading ? (
              <div className="h-4 w-4 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin mr-2"></div>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isGoogleLoading ? "Signing in with Google..." : "Sign in with Google"}
          </Button>

          {/* Guest Sign-in Button */}
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGuestSignIn}
            disabled={isGuestLoading || isLoading || isGoogleLoading}
          >
            {isGuestLoading ? (
              <>
                <div className="h-4 w-4 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin mr-2"></div>
                Creating guest session...
              </>
            ) : (
              "Sign in as Guest"
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-emerald-600 hover:text-emerald-500">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isGuestLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-600 hover:text-emerald-500">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
