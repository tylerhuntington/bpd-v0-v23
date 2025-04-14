"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type UserType = {
  id: string
  name: string
  email: string
  isGuest: boolean
  photoUrl?: string
}

type AuthContextType = {
  user: UserType | null
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // In a real app, this would check for an existing session token
        // and validate it with the backend
        const savedUser = localStorage.getItem("bioprocess_user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error("Session check failed:", error)
        // Clear potentially corrupted session data
        localStorage.removeItem("bioprocess_user")
      } finally {
        setIsInitialized(true)
      }
    }

    checkSession()
  }, [])

  // Regular email/password sign in
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would make an API call to authenticate
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validate credentials (simplified for demo)
      if (!email.includes("@") || password.length < 6) {
        throw new Error("Invalid credentials")
      }

      const user = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0],
        email,
        isGuest: false,
      }

      setUser(user)
      localStorage.setItem("bioprocess_user", JSON.stringify(user))

      // Set a session cookie (would be secure and httpOnly in production)
      document.cookie = `bioprocess_session=${user.id}; path=/; max-age=86400`

      return user
    } catch (error) {
      console.error("Sign in failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Google sign in
  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would use the Google OAuth flow
      // Simulate Google auth
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const user = {
        id: "google-" + Math.random().toString(36).substr(2, 9),
        name: "Google User",
        email: "user@gmail.com",
        isGuest: false,
        photoUrl: "https://lh3.googleusercontent.com/a/default-user",
      }

      setUser(user)
      localStorage.setItem("bioprocess_user", JSON.stringify(user))

      // Set a session cookie (would be secure and httpOnly in production)
      document.cookie = `bioprocess_session=${user.id}; path=/; max-age=86400`

      return user
    } catch (error) {
      console.error("Google sign in failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Guest sign in
  const signInAsGuest = async () => {
    setIsLoading(true)
    try {
      // Create a temporary guest account
      await new Promise((resolve) => setTimeout(resolve, 800))

      const guestId = "guest-" + Math.random().toString(36).substr(2, 9)
      const user = {
        id: guestId,
        name: "Guest User",
        email: `${guestId}@guest.bioprocess.app`,
        isGuest: true,
      }

      setUser(user)
      localStorage.setItem("bioprocess_user", JSON.stringify(user))

      // Set a session cookie (would be secure and httpOnly in production)
      document.cookie = `bioprocess_session=${user.id}; path=/; max-age=86400`

      return user
    } catch (error) {
      console.error("Guest sign in failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would invalidate the session on the backend
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUser(null)
      localStorage.removeItem("bioprocess_user")

      // Clear the session cookie
      document.cookie = "bioprocess_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // Redirect to login page after sign out
      router.push("/login")
    } catch (error) {
      console.error("Sign out failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        isAuthenticated: !!user,
        signIn,
        signInWithGoogle,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
