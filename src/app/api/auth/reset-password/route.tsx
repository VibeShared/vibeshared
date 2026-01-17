// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {connectDB} from "@/lib/db/connect";
import User from "@/lib/models/User";
import Otp from "@/lib/models/Otp";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP, and new password required" }, { status: 400 });
    }

    await connectDB();

    // Validate OTP
    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Delete OTP
    await Otp.deleteOne({ email });

    return NextResponse.json({ message: "Password reset successful ✅" });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
