import { NextResponse, type NextRequest } from "next/server";

const PIN = "1234";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes, static assets, and the PIN entry page itself
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Check for PIN cookie
  const pinCookie = request.cookies.get("family-pin")?.value;

  // If PIN is correct, allow through
  if (pinCookie === PIN) {
    // If they're trying to visit the login page but already authenticated, redirect to dashboard
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Not authenticated — allow the home/login page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Redirect everything else to PIN entry
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
