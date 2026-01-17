// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import {connectDB} from "@/lib/db/connect";
import Otp from "@/lib/models/Otp";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true }
    );

    // Email transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Send mail
    await transporter.sendMail({
      from: `"VibeShared" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}. Valid for 5 minutes.`,
    });

    return NextResponse.json({ message: "Reset OTP sent successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Failed to send reset OTP" }, { status: 500 });
  }
}
