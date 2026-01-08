// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge-safe middleware
 * ❌ No auth()
 * ❌ No crypto
 * ❌ No DB
 */
export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.has("next-auth.session-token") ||
                     req.cookies.has("__Secure-next-auth.session-token");

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [ "/admin/:path*"],
};
