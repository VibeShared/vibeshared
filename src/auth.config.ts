// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
        token.username = user.username;
        token.role = user.role;
        token.isPrivate = user.isPrivate ?? false;
        token.isVerified = user.isVerified ?? false;
      }

      // Manual session update (profile edit)
      if (trigger === "update" && session?.user) {
        if (session.user.name !== undefined) {
          token.name = session.user.name;
        }
        if (session.user.image !== undefined) {
          token.image = session.user.image;
        }
        if (session.user.username !== undefined) {
          token.username = session.user.username;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.isPrivate = Boolean(token.isPrivate);
        session.user.isVerified = Boolean(token.isVerified);
      }

      return session;
    },

    authorized({ auth }) {
      // V1: simple auth gate (middleware-friendly)
      return Boolean(auth);
    },
  },

  // Providers injected in src/lib/auth.ts
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
