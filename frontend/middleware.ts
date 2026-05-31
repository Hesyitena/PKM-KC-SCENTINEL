import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes (require auth)
const PROTECTED_PATHS = ["/", "/history", "/devices", "/profile", "/settings"];
// Auth routes (redirect if already logged in)
const AUTH_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for token in cookies (set on login)
  const token = request.cookies.get("access_token")?.value;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
  const isAuthPath = AUTH_PATHS.includes(pathname);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
