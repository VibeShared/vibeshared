// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import bcrypt from "bcryptjs";

import authConfig from "@/auth.config";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  secret: process.env.AUTH_SECRET,

  providers: [
    // --- OAuth Providers ---
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),

    // --- Credentials Provider (Web + Mobile) ---
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) {
          return null;
        }

        await connectDB();

        const identifier =
          typeof credentials.identifier === "string"
            ? credentials.identifier.toLowerCase().trim()
            : credentials.identifier;

        const user = await User.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        }).select("+password");

        if (!user || !user.password || user.status !== "active") {
          return null;
        }

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
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      // Credentials users already validated
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth users
      if (!user.email) return false;

      await connectDB();

      const email = user.email.toLowerCase().trim();
      let dbUser = await User.findOne({ email });

      if (!dbUser) {
        const baseUsername =
          user.name?.split(" ")[0]?.toLowerCase() ||
          email.split("@")[0];

        dbUser = await User.create({
          name: user.name || baseUsername,
          email,
          username: baseUsername,
          image: user.image,
          isVerified: true,
          role: "user",
          status: "active",
        });
      }

      if (dbUser.status !== "active") return false;

      // Attach DB-backed fields to NextAuth user
      user.id = dbUser._id.toString();
      user.username = dbUser.username;
      user.role = dbUser.role;
      user.isPrivate = dbUser.isPrivate;
      user.isVerified = dbUser.isVerified;

      return true;
    },
  },
});
