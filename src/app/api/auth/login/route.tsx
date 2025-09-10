// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectdb from "@/lib/Connect";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await mongoose.connect(connectdb);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      );
    }

    // Check if user has a password (might be OAuth user)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses social login. Please sign in with a provider." },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // ✅ Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.AUTH_SECRET!,
      { expiresIn: "20m" } // short lived
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.AUTH_SECRET!,
      { expiresIn: "7d" } // longer lived
    );

    // Optional: save refreshToken in DB
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ Return safe user data
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      accessToken,
      refreshToken,
    };

    const response = NextResponse.json(
      { message: "Login successful", user: userResponse },
      { status: 200 }
    );


    response.cookies.set("accessToken", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
});

    return response;


  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
