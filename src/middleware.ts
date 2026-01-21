// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config"; // Point to the config file from Step 1
import { NextResponse } from "next/server";

// 1. Initialize NextAuth with the Edge-safe config
const { auth } = NextAuth(authConfig);

// 2. Export the middleware wrapped in auth
export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  
  // 'req.auth' is automatically populated by the wrapper
  const session = req.auth;
  const isLoggedIn = !!session;

  // ----------------------------------
  // 0. EXCEPTION: Specific Post Routes
  // ----------------------------------
  if (pathname.match(/^\/[^/]+\/post\/[^/]+$/)) {
    return NextResponse.next();
  }

  // ----------------------------------
  // 1. PUBLIC AUTH ROUTES (Login/Signup)
  // ----------------------------------
  const isAuthRoute = 
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");

  if (isAuthRoute) {
    // Optional: If already logged in, redirect away from login page?
    // if (isLoggedIn) return NextResponse.redirect(new URL("/", nextUrl));
    return NextResponse.next();
  }

  // ----------------------------------
  // 2. ROOT "/"
  // ----------------------------------
  if (pathname === "/") {
    // Guest → login
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Admin → admin dashboard
    // Note: Ensure your session actually contains 'role'. You might need to add this in auth.config callbacks.
    if (session?.user?.role === "admin") {
      return NextResponse.redirect(new URL("/admin/withdrawals", nextUrl));
    }

    // Normal user → allow "/"
    return NextResponse.next();
  }

  // ----------------------------------
  // 3. ADMIN ROUTES
  // ----------------------------------
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || session?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // ----------------------------------
  // 4. PROTECTED USER ROUTES
  // ----------------------------------
  const isProtectedRoute = 
    pathname.startsWith("/profile") ||
    pathname.startsWith("/post") ||
    pathname.startsWith("/searchBox") ||
    pathname.startsWith("/wallet");

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

// 3. Config Matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};