import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import mongoose from "mongoose";
import connectdb from "@/lib/Connect";
import User from "@/lib/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],
  callbacks: {
    // ✅ When user signs in
    async signIn({ user }) {
      await mongoose.connect(connectdb);

      let existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        existingUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image
        });
      }

      // Store the MongoDB _id in `user` object
      user.id = existingUser._id.toString();
      return true;
    },

    // ✅ Add id to JWT token
    async jwt({ token, user, account }) {

      if(account){
        token.accessToken = account.access_token
      }

      if (user) {
        token.id = user.id; // from signIn
      }
      return token;
    },

    // ✅ Add id to session
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.accessToken =token.accessToken
      }
      return session;
    }
  },
  

    secret: process.env.AUTH_SECRET as string

  
});

export { handler as GET, handler as POST };




