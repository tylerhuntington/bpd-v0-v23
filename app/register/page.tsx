"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FlaskConical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signInWithGoogle, signInAsGuest, isAuthenticated, isInitialized } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  // Check if user is already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isInitialized, isAuthenticated, router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      acceptTerms: checked,
    }))
    // Clear error when user interacts with checkbox
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match. Please try again.")
      return
    }

    if (!formData.acceptTerms) {
      setError("Please accept the terms of service to continue.")
      return
    }

    setIsLoading(true)

    try {
      // Simulate registration process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would call an API to register the user

      // Create a user object
      const user = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        isGuest: false,
      }

      // Store user in localStorage
      localStorage.setItem("bioprocess_user", JSON.stringify(user))

      // Set a session cookie
      document.cookie = `bioprocess_session=${user.id}; path=/; max-age=86400`

      toast({
        title: "Account Created",
        description: "Your account has been successfully created.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      setError("Registration failed. Please try again.")
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
        title: "Google Sign-up Successful",
        description: "Your account has been created with Google.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Google sign-up error:", error)
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
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create a BioProcess Designer account</CardDescription>
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
            {isGoogleLoading ? "Signing up with Google..." : "Sign up with Google"}
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
              "Continue as Guest"
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  I agree to the{" "}
                  <Link href="#" className="text-emerald-600 hover:text-emerald-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-emerald-600 hover:text-emerald-500">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isGuestLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-500">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
