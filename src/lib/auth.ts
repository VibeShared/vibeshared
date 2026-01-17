import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "@/auth.config";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";

// --- TS Types Extension ---
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: string;
      isPrivate?: boolean;
      isVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: string;
    isPrivate?: boolean;
    isVerified?: boolean;
  }

  interface JWT {
    id?: string;
    username?: string;
    role?: string;
    isPrivate?: boolean;
    isVerified?: boolean;
  }
}

const isLocal = process.env.NODE_ENV !== "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET!,

  session: {
    strategy: "jwt", // ✅ REQUIRED
  },

  cookies: {
    sessionToken: {
      name: isLocal ? "authjs.session-token" : "__Secure-authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocal,
      },
    },

    csrfToken: {
      name: isLocal ? "authjs.csrf-token" : "__Host-authjs.csrf-token",
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: !isLocal,
      },
    },
  },

  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;

        await connectDB();

        const user = await User.findOne({
          $or: [
            { email: credentials.identifier },
            {
              username:
                typeof credentials.identifier === "string"
                  ? credentials.identifier.toLowerCase()
                  : credentials.identifier,
            },
          ],
        }).select("+password");

        if (!user || !user.password || user.status !== "active") return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
          role: user.role,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        if (!user.email) return false;

        await connectDB();
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          const baseUsername =
            user.name?.split(" ")[0] || user.email.split("@")[0];

          const newUser = await User.create({
            name: user.name || baseUsername,
            email: user.email,
            username: baseUsername.toLowerCase(),
            image: user.image,
            isVerified: true,
            role: "user",
            status: "active",
            termsAccepted: true,
            termsAcceptedAt: new Date(),
          });

          user.id = newUser._id.toString();
          user.username = newUser.username;
          user.role = newUser.role;
        } else {
          if (dbUser.status !== "active") return false;
          user.id = dbUser._id.toString();
          user.username = dbUser.username;
          user.role = dbUser.role;
          user.isPrivate = dbUser.isPrivate;
          user.isVerified = dbUser.isVerified;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
        token.username = user.username;
        token.role = user.role;
        token.isPrivate = user.isPrivate;
        token.isVerified = user.isVerified;
      }

      // 🔑 Manual session update (profile update)
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.image = session.user.image;
        token.username = session.user.username;
      }

      return token; // ✅ REQUIRED
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.isPrivate = token.isPrivate as boolean;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
});
