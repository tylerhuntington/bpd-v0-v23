import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the user is authenticated by looking for a session token
  const sessionToken = request.cookies.get("bioprocess_session")?.value

  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/"]

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/project"]

  // Check if the requested route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the requested route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access login/register, redirect to dashboard
  if ((pathname === "/login" || pathname === "/register") && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
