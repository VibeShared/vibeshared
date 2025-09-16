import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { SessionStrategy } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials?.email });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials!.password, user.password);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider !== "credentials") {
        // ✅ For Google, Facebook, Twitter → Create user if doesn't exist
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = await User.create({
            name: user.name || "Unnamed",
            email: user.email,
            image: user.image,
            password: "", // no password for OAuth users
          });
          user.id = newUser._id.toString();
        } else {
          user.id = existingUser._id.toString();
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }: { token: any; user?: any; trigger?: string }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.bio = user.bio ?? "";
        token.location = user.location ?? "";
        token.website = user.website ?? "";
      }

      if (trigger === "update") {
        await connectDB();
        const freshUser = await User.findById(token.id);
        if (freshUser) {
          token.name = freshUser.name;
          token.picture = freshUser.image;
          token.bio = freshUser.bio ?? "";
          token.location = freshUser.location ?? "";
          token.website = freshUser.website ?? "";
        }
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        image: token.picture,
        bio: token.bio,
        location: token.location,
        website: token.website,
      };
      return session;
    },
  },

  session: { strategy: "jwt" as SessionStrategy },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
