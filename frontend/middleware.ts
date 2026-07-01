import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin-only routes (full dashboard)
const ADMIN_PATHS = ["/", "/history", "/devices", "/profile", "/settings"];
// Viewer-only routes
const VIEWER_PATHS = ["/monitor"];
// All protected routes (require auth)
const PROTECTED_PATHS = [...ADMIN_PATHS, ...VIEWER_PATHS];
// Auth routes (redirect if already logged in)
const AUTH_PATHS = ["/login"];

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function middleware(request: NextRequest) {
  // Demo mode: bypass semua auth check, langsung lanjut
  if (DEMO_MODE) return NextResponse.next();

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
    // Default redirect to root; actual role-based routing handled client-side
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
