// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
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

    const { name, username, email, password, termsAccepted } = body;

    // ✅ Basic validation
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Name, username, email and password are required" },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "Terms & Conditions must be accepted" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedUsername =
      typeof username === "string"
        ? username.toLowerCase().trim()
        : null;

    const normalizedEmail =
      typeof email === "string"
        ? email.toLowerCase().trim()
        : null;

    if (!normalizedUsername || !normalizedEmail) {
      return NextResponse.json(
        { error: "Invalid username or email" },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ Uniqueness check
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === normalizedEmail
              ? "Email already registered"
              : "Username already taken",
        },
        { status: 409 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      name,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      status: "active",
      role: "user",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    // ✅ Safe response (mobile-friendly)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
          image: user.image,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup Error:", error);

    // ✅ Mongo duplicate key safety net
    if (error?.code === 11000) {
      if (error.keyPattern?.email) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
      if (error.keyPattern?.username) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
