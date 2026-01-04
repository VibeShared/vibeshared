// src/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "@/auth.config";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";

// --- TS Types Extension ---
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      isPrivate: boolean;
      isVerified: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    username?: string;
    role?: string;
    isPrivate?: boolean;
    isVerified?: boolean;
  }
}

// --- Helper Functions ---
async function generateUniqueUsername(base: string): Promise<string> {
  let username = base.toLowerCase().replace(/[^a-z0-9_]/g, "");
  await connectDB();
  let isTaken = await User.exists({ username });

  
  let counter = 1;
  while (isTaken) {
    const newUsername = `${username}${counter}`;
    isTaken = await User.exists({ username: newUsername });
    if (!isTaken) return newUsername;
    counter++;
  }
  return username;
}

const isLocal = process.env.NODE_ENV !== "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
   cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocal
      }
    },
    csrfToken: {
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: !isLocal
      }
    }
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
            { username: typeof credentials.identifier === "string" ? credentials.identifier.toLowerCase() : credentials.identifier },
          ],
        }).select("+password");

        if (!user || !user.password || user.status !== "active") return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
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
      // Logic for Social Login (OAuth)
      if (account?.provider !== "credentials") {
        if (!user.email) return false;

        await connectDB();
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          const baseUsername = user.name?.split(" ")[0] || user.email.split("@")[0];
          const username = await generateUniqueUsername(baseUsername);

          // Create the user in MongoDB
          const newUser = await User.create({
            name: user.name || username,
            email: user.email,
            username,
            image: user.image,
            isVerified: true,
            role: "user",
            status: "active",
          });
          
          // Attach DB fields to the user object for the JWT callback
          user.id = newUser._id.toString();
          user.username = newUser.username;
          user.role = newUser.role;
        } else {
          if (dbUser.status !== "active") return false;
          // Update the user object with DB data for the JWT callback
          user.id = dbUser._id.toString();
          user.username = dbUser.username;
          user.role = dbUser.role;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id as string;
        token.username = user.username;
        token.role = user.role;
        token.isPrivate = user.isPrivate;
        token.isVerified = user.isVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.isPrivate = token.isPrivate as boolean;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
});