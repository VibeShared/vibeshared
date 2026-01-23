// src/app/api/auth/check-availability/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";

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

    const { email, username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username required" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : null;

    await connectDB();

    const query: any[] = [{ username: normalizedUsername }];

    if (normalizedEmail) {
      query.push({ email: normalizedEmail });
    }

    const existingUser = await User.findOne({ $or: query });

    if (existingUser) {
      if (
        normalizedEmail &&
        existingUser.email === normalizedEmail
      ) {
        return NextResponse.json(
          { available: false, field: "email", message: "Email already registered" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { available: false, field: "username", message: "Username already taken" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      available: true,
      message: "Available",
    });
  } catch (error) {
    console.error("Check availability error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
