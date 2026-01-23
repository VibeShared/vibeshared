// src/app/api/auth/send-otp/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db/connect";
import Otp from "@/lib/models/Otp";
import User from "@/lib/models/User";

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

    const { email, username } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername =
      typeof username === "string"
        ? username.toLowerCase().trim()
        : null;

    await connectDB();

    // 🚫 Block OTP if email OR username already exists
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email or username already registered. Please login.",
        },
        { status: 409 }
      );
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Save / overwrite OTP
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otp,
        createdAt: new Date(),
      },
      { upsert: true }
    );

    // ✅ Mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"VibeShared" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    });

    return NextResponse.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP send error:", error);

    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
