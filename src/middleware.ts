import { betterFetch } from "@better-fetch/fetch"
import { NextResponse, type NextRequest } from "next/server"

type Session = {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export async function getSession(request: NextRequest): Promise<Session | null> {
  const { data: session } = await betterFetch<Session>(
    `${request.nextUrl.origin}/api/auth/get-session`,
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  )
  return session
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files, API auth routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next()
  }
  
  // Public routes
  const publicRoutes = ["/login", "/setup", "/invite"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  const session = await getSession(request)
  
  // If no session and not a public route, redirect to login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If session exists and on public auth route, redirect to dashboard
  if (session && (pathname === "/login" || pathname === "/setup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  
  // Store user info in headers for server components
  const response = NextResponse.next()
  if (session) {
    response.headers.set("x-user-id", session.user.id)
    response.headers.set("x-user-role", session.user.role)
  }
  
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
