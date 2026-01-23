// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import Otp from "@/lib/models/Otp";

export async function POST(req: Request) {
  try {
    // ✅ Mobile-safe body parsing
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password required" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : null;

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ Validate OTP
    const record = await Otp.findOne({
      email: normalizedEmail,
      otp: String(otp),
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password
    const updatedUser = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { password: hashedPassword }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Delete OTP after successful reset
    await Otp.deleteOne({ email: normalizedEmail });

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
