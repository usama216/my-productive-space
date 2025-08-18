// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define auth routes
  const isAuthRoute = 
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/sign-up" ||
    request.nextUrl.pathname === "/forgot-password"

  // If user is logged in and trying to access auth routes, redirect to home
  if (isAuthRoute && user) {
    return NextResponse.redirect(
      new URL("/", request.url)
    )
  }

  // If user is not logged in and trying to access protected routes, redirect to login
  // Can customize this list based on the finalized protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/settings"]
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    )
  }

  return supabaseResponse
}