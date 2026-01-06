// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const AUTH_ROUTES = ["/login", "/signup"];
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  const isAdminRoute = pathname.startsWith("/admin");

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/search") ||
    isAdminRoute;

  // 1️⃣ Block unauthenticated users
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // 2️⃣ Admin guard
  if (isLoggedIn && isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // 3️⃣ Prevent logged-in users from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico).*)",
  ],
};
