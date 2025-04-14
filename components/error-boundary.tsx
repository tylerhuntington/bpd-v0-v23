"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const errorHandler = (error) => {
      console.error("Caught error:", error)
      setHasError(true)
      setError(error)
      return true
    }

    window.addEventListener("error", errorHandler)
    return () => window.removeEventListener("error", errorHandler)
  }, [])

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              An error occurred while rendering this page. Please try refreshing or contact support if the problem
              persists.
            </p>
            {error && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200 text-xs font-mono text-red-800 overflow-auto max-h-32">
                {error.toString()}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return children
}
