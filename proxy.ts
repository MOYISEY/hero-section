import { NextResponse, type NextRequest } from "next/server"

const protectedRoutes: Record<string, string[]> = {
  "/manager": ["manager"],
  "/developer": ["developer"],
  "/director": ["director"],
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const requiredRoles = protectedRoutes[pathname]

  if (!requiredRoles) {
    return withSecurityHeaders(NextResponse.next(), request)
  }

  const role = request.cookies.get("neuralbrief.role")?.value

  if (role && requiredRoles.includes(role)) {
    return withSecurityHeaders(NextResponse.next(), request)
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", pathname)

  return withSecurityHeaders(NextResponse.redirect(loginUrl), request)
}

function withSecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
