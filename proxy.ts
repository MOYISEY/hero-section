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
    return NextResponse.next()
  }

  const role = request.cookies.get("neuralbrief.role")?.value

  if (role && requiredRoles.includes(role)) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", pathname)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/manager", "/developer", "/director"],
}
