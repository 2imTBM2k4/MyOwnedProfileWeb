import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protect API routes (except auth and public reads)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Allow auth endpoint
    if (request.nextUrl.pathname === "/api/auth") {
      return NextResponse.next();
    }

    // Allow hoyolab endpoint (public read)
    if (request.nextUrl.pathname.startsWith("/api/hoyolab")) {
      return NextResponse.next();
    }

    // Allow GET requests (public read)
    if (request.method === "GET") {
      return NextResponse.next();
    }

    // For POST, PATCH, DELETE - check authentication
    const token = request.cookies.get("admin_token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Admin login required" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
