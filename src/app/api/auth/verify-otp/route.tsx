import { NextResponse } from "next/server";
import mongoose from "mongoose";
import {connectDB} from "@/lib/Connect";
import Otp from "@/lib/models/Otp";

export async function POST(req: Request) {
  try {
    let email, otp;
    try {
      const body = await req.json();
      email = body.email;
      otp = body.otp;
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }

    await connectDB();

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // OTP is valid → delete it
    await Otp.deleteOne({ email });

    return NextResponse.json({ message: "OTP verified ✅" });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
