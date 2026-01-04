import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
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
    username?: string;
    role?: string;
    isPrivate?: boolean;
    isVerified?: boolean;
  }
}