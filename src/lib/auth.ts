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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;

        await connectDB();

        const user = await User.findOne({
          $or: [
            { email: credentials.identifier },
            { username: typeof credentials.identifier === "string" 
                ? credentials.identifier.toLowerCase() 
                : credentials.identifier 
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
      if (account?.provider !== "credentials") {
        if (!user.email) return false;
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          const baseUsername = user.name?.split(" ")[0] || user.email.split("@")[0];
          const newUser = await User.create({
            name: user.name || baseUsername,
            email: user.email,
            username: baseUsername.toLowerCase(),
            image: user.image,
            isVerified: true,
            role: "user",
            status: "active",
          });
          user.id = newUser._id.toString();
          user.role = newUser.role;
        } else {
          if (dbUser.status !== "active") return false;
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
        }
      }
      return true;
    },
  },
});