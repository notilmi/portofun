import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isProduction = process.env.DEPLOYMENT_STATUS === "prod";
  const pathname = request.nextUrl.pathname;

  // If not in production, allow all routes
  if (!isProduction) {
    return NextResponse.next();
  }

  // In production, only allow specific paths
  const allowedPaths = [
    "/", // Landing page
    "/_next", // Next.js assets
    "/api", // API routes (if needed for waitlist)
    "/favicon.ico",
    "/portofun.svg",
    "/assets", // Public assets
  ];

  // Check if the current path is allowed
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

  // If the path is allowed, continue
  if (isAllowed) {
    return NextResponse.next();
  }

  // Otherwise, redirect to landing page
  return NextResponse.redirect(new URL("/", request.url));
}

// Configure which routes use this proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
