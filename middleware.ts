import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /**
   * 1️⃣ Public routes (no auth required)
   */
  const publicRoutes = [
    "/login",
    "/signup",
    "/api/auth",
  ];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  /**
   * 2️⃣ Get JWT token
   */
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAuthenticated = !!token;

  /**
   * 3️⃣ Protected routes (login required)
   */
  const protectedRoutes = [
    "/profile",
    "/settings",
    "/wallet",
    "/post",
  ];

  if (
    !isAuthenticated &&
    protectedRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /**
   * 4️⃣ Prevent logged-in users from visiting auth pages
   */
  if (
    isAuthenticated &&
    (pathname.startsWith("/login") || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /**
   * 5️⃣ Admin-only routes (RBAC)
   */
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated || token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  /**
   * 6️⃣ Block suspended / deleted users
   */
  if (token?.status && token.status !== "active") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/wallet/:path*",
    "/post/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
