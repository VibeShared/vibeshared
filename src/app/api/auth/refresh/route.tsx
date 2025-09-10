import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectdb from "@/lib/Connect";
import User from "@/lib/models/User";
import mongoose from "mongoose";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    await mongoose.connect(connectdb);

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // Verify refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json({ accessToken: newAccessToken });
  } catch (error: any) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
}
