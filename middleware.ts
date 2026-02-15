import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  try {
    // NOTE: The app uses NextAuth (wallet / credentials), not Supabase auth.
    // Previous Supabase-based middleware caused protected routes (including /chat) to always redirect.
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      // Don't lock users out if auth isn't configured yet.
      return NextResponse.next()
    }

    const token = await getToken({ req: request as any, secret })
    const isAuthenticated = Boolean(token)

    // Define protected routes
    const protectedRoutes = [
      "/dashboard",
      "/appointments",
      "/profile",
      "/on-demand",
      "/providers/dashboard",
      "/medical-profile",
      "/medical-records",
      "/appointment"
    ]

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some((route) => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If the route is protected and the user is not authenticated, redirect to login
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`)
      return NextResponse.redirect(redirectUrl)
    }

    // Continue with the request
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/appointments/:path*",
    "/profile/:path*",
    "/on-demand/:path*",
    "/providers/dashboard/:path*",
    "/medical-profile/:path*",
    "/medical-records/:path*",
    "/appointment/:path*"
  ],
}
