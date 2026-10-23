import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
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
    if (request.method === "GET" || request.method === "HEAD") {
      return NextResponse.next();
    }

    // For POST, PATCH, DELETE - check authentication
    const token = request.cookies.get("admin_token");

    if (!await verifyAdminToken(token?.value, process.env.ADMIN_PASSWORD || "")) {
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
