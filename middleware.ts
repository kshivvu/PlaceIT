import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth  // auth object is attached to the request

  // ============================================================
  // DEFINE ROUTE GROUPS
  // ============================================================

  // Routes anyone can visit without being logged in
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/pending", "/api/colleges"]

  // Routes and the roles allowed to access them
  const roleRoutes: Record<string, string[]> = {
    "/faculty":      ["FACULTY", "SUPER_ADMIN"],
    "/coordinator":  ["COORDINATOR", "SUPER_ADMIN"],
    "/admin":        ["SUPER_ADMIN"],
    "/dashboard":    ["STUDENT", "SUPER_ADMIN"],
    "/tracker":      ["STUDENT", "SUPER_ADMIN"],
    "/feed":         ["STUDENT", "FACULTY", "SUPER_ADMIN"],
    "/leaderboard":  ["STUDENT", "FACULTY", "COORDINATOR", "SUPER_ADMIN"],
  }

  // ============================================================
  // RULE 0 — Logged in but not verified: lock to /pending
  // ============================================================
  if (session && session.user.verificationStatus !== "VERIFIED" && pathname !== "/pending") {
    return NextResponse.redirect(new URL("/pending", req.url))
  }

  // ============================================================
  // RULE 1 — Public routes: always let through
  // ============================================================
  if (publicRoutes.includes(pathname)) {
    // But if they're already logged in and visit /login or /signup,
    // redirect them to their dashboard — no point showing login again
    if (session && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL(getDashboard(session.user.role), req.url))
    }
    return NextResponse.next()
  }

  // ============================================================
  // RULE 2 — Not logged in: redirect to login
  // ============================================================
  if (!session) {
    // Remember where they were trying to go
    // After login we'll send them back there
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }


  // ============================================================
  // RULE 4 — Wrong role for this route: redirect to their dashboard
  // ============================================================
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(session.user.role)) {
        // They're logged in, just in the wrong place
        return NextResponse.redirect(
          new URL(getDashboard(session.user.role), req.url)
        )
      }
    }
  }

  // ============================================================
  // All checks passed — let them through
  // ============================================================
  return NextResponse.next()
})

// Helper — given a role, where should they land?
function getDashboard(role: string): string {
  switch (role) {
    case "STUDENT":     return "/dashboard"
    case "FACULTY":     return "/faculty/dashboard"
    case "COORDINATOR": return "/coordinator/overview"
    case "SUPER_ADMIN": return "/admin/users"
    default:            return "/login"
  }
}

// ============================================================
// MATCHER — which routes does middleware run on?
// ============================================================
export const config = {
  matcher: [
    // Run on everything EXCEPT:
    // - Next.js internals (_next/static, _next/image)
    // - Your public folder (favicon, images)
    // - The NextAuth API route itself (it handles its own auth)
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}