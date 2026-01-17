import { DefaultSession } from "next-auth";
import { Session } from "next-auth";
import { NextRequest } from "next/server";




declare module "next/server" {
  interface NextRequest {
    auth?: Session | null;
  }
}

declare module "next-auth" {
  interface User {
    id: string;
    username?: string;
    role?: string;
    isPrivate?: boolean;
    isVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      username?: string;
      role?: string;
      isPrivate?: boolean;
      isVerified?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    image?: string | null;
    username?: string;
    role?: string;
    isPrivate?: boolean;
    isVerified?: boolean;
  }
}
