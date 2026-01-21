import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.isPrivate = user.isPrivate;
        token.isVerified = user.isVerified;
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.image = session.user.image;
        token.username = session.user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.isPrivate = token.isPrivate as boolean;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth; 
    },
  },
  providers: [], // Empty array here; populated in auth.ts
} satisfies NextAuthConfig;

export default authConfig;