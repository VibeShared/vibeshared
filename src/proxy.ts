import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;



  if (pathname.match(/^\/[^/]+\/post\/[^/]+$/)) {
  return NextResponse.next();
}

  /* ----------------------------------
   * 1. PUBLIC AUTH ROUTES
   * ---------------------------------- */
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password")
  ) {
    return NextResponse.next();
  }

  // Read session AFTER public guard
  const session = await auth();

  /* ----------------------------------
   * 2. ROOT "/"
   * ---------------------------------- */
  if (pathname === "/") {
    // Guest → login
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin → admin dashboard
    if (session.user.role === "admin") {
      return NextResponse.redirect(
        new URL("/admin/withdrawals", req.url)
      );
    }

    // Normal user → allow "/"
    return NextResponse.next();
  }

  /* ----------------------------------
   * 3. ADMIN ROUTES
   * ---------------------------------- */
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  /* ----------------------------------
   * 4. PROTECTED USER ROUTES
   * ---------------------------------- */
  if (
    pathname.startsWith("/profile") ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/searchBox") ||
    pathname.startsWith("/wallet")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/profile/:path*",
    "/post/:path*",
    "/searchBox",
    "/wallet/:path*",
    "/admin/:path*",
  ],
};
