import { NextResponse } from "next/server";
import {connectDB} from "@/lib/Connect";
import User from "@/lib/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    await connectDB();

    // Remove refreshToken from DB
    const user = await User.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: "" } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Clear cookies
    const response = NextResponse.json({ message: "Logged out successfully ✅" });
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // immediately expires
      path: "/",
    });
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
