import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extended Session type
   */
  interface Session {
    user: {
       id: string;
      name: string;
      email: string;
      image?: string;
      bio?: string;
      location?: string;
      website?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extended User type
   */
  interface User extends DefaultUser {
    id: string;
    _id?: string; // MongoDB ObjectId if needed
    name?: string | null;
      email?: string | null;
      image?: string | null;
      password?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT type
   */
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    password?: string;
  }
}