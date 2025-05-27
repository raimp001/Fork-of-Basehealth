import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      // Allow the request to continue if environment variables are missing
      return NextResponse.next()
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the auth cookie
    const { data: { session } } = await supabase.auth.getSession()

    // Check if the user is authenticated
    const isAuthenticated = !!session

    // Define protected routes
    const protectedRoutes = [
      "/dashboard",
      "/appointments",
      "/profile",
      "/on-demand",
      "/providers/dashboard",
      "/medical-profile",
      "/medical-records",
      "/chat",
      "/appointment"
    ]

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some((route) => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If the route is protected and the user is not authenticated, redirect to login
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
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
    "/chat/:path*",
    "/appointment/:path*"
  ],
}
