import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname, searchParams } = req.nextUrl;



  // Helper to redirect with a message
  const redirectWithMessage = (url: string, message: string) => {
    const redirectUrl = new URL(url, req.url);
    redirectUrl.searchParams.set("message", message);
    return NextResponse.redirect(redirectUrl);
  };

  // ✅ If user is logged in — block auth & public-only pages
  if (token) {
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/home")   ||
      pathname.startsWith("/searchBox") 

    ) {
      return redirectWithMessage("/", "already-logged-in");
    }
  }

  // ✅ If user is NOT logged in — block protected pages
  if (!token) {
    const protectedRoutes = ["/profile", "/settings"];
    const isProtected =
      protectedRoutes.some((route) => pathname.startsWith(route)) ||
      pathname.startsWith("/post/");

    if (isProtected) {
      return redirectWithMessage("/login", "login-required");
    }
  }

  // ✅ Root route: 
  // - If logged in → stay on /
  // - If not logged in → go to /home (except right after login success)
  if (pathname === "/") {
    if (token) {
      return NextResponse.next();
    } else if (searchParams.has("success")) {
      // Allow first render after login (success message)
      return NextResponse.next();
    } else {
      return NextResponse.rewrite(new URL("/home", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/login",
    "/signup",
    "/profile/:path*",
    "/settings/:path*",
    "/post/:path*",
  ],
};
