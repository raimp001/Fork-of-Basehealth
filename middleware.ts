import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { isAdminEmail } from "@/lib/admin-access"

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname
    const isApiRequest = pathname.startsWith("/api/")
    const privilegedRoutes = ["/admin", "/api/admin", "/agents", "/treasury"]
    const isPrivilegedRoute = privilegedRoutes.some((route) => pathname.startsWith(route))

    // NOTE: The app uses NextAuth (wallet / credentials), not Supabase auth.
    // Previous Supabase-based middleware caused protected routes (including /chat) to always redirect.
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      if (isPrivilegedRoute) {
        if (isApiRequest) {
          return NextResponse.json({ success: false, error: "Authentication configuration missing" }, { status: 503 })
        }

        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`)
        return NextResponse.redirect(redirectUrl)
      }

      return NextResponse.next()
    }

    const token = await getToken({ req: request as any, secret })
    const isAuthenticated = Boolean(token)
    const tokenEmail = typeof token?.email === "string" ? token.email : ""

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
      pathname.startsWith(route)
    )

    if (isPrivilegedRoute && !isAuthenticated) {
      if (isApiRequest) {
        return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
      }

      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`)
      return NextResponse.redirect(redirectUrl)
    }

    if (isPrivilegedRoute && !isAdminEmail(tokenEmail)) {
      if (isApiRequest) {
        return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
      }

      return NextResponse.redirect(new URL("/", request.url))
    }

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
    "/appointment/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/agents/:path*",
    "/treasury/:path*"
  ],
}
