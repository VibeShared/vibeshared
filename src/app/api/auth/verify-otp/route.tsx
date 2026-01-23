// src/app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Otp from "@/lib/models/Otp";

export async function POST(req: Request) {
  try {
    // ✅ Mobile-safe JSON parsing
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP required" },
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

    // ✅ OTP is single-use → delete after success
    await Otp.deleteOne({ email: normalizedEmail });

    return NextResponse.json({
      message: "OTP verified",
      verified: true,
    });
  } catch (error) {
    console.error("OTP verify error:", error);

    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
