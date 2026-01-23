import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  
  // Use req.auth (populated by the auth wrapper)
  const session = req.auth;
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;

  // 1. PUBLIC EXEMPTIONS (The regex you had)
  if (pathname.match(/^\/[^/]+\/post\/[^/]+$/)) {
    return NextResponse.next();
  }

  // 2. AUTH ROUTES (Login/Signup/Forgot)
  const isAuthRoute = ["/login", "/signup", "/forgot-password"].some(route => 
    pathname.startsWith(route)
  );

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // 4. USER PROTECTION & ROOT REDIRECT
  const isProtectedRoute = ["/profile", "/post", "/searchBox", "/wallet"].some(route => 
    pathname.startsWith(route)
  );

  if (pathname === "/") {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    return NextResponse.next();
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};