// src/app/api/auth/verify-reset-otp/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectdb from "@/lib/Connect";
import Otp from "@/lib/models/Otp";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }

    await mongoose.connect(connectdb);

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified ✅" });
  } catch (err) {
    console.error("Verify reset OTP error:", err);
    return NextResponse.json({ error: "Failed to verify reset OTP" }, { status: 500 });
  }
}
