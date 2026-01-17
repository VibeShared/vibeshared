import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse request body
    const { name, username, email, password, termsAccepted } = await req.json();

    // 2️⃣ Basic validation
    if (!name || !username || !email || !password ) {
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 3️⃣ Normalize username
    const normalizedUsername = username.toLowerCase().trim();

    await connectDB();

    // 4️⃣ Check uniqueness
    const existingUser = await User.findOne({
      $or: [{ email }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        },
        { status: 409 }
      );
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Create user
    const user = await User.create({
      name,
      username: normalizedUsername,
      email,
      password: hashedPassword,
      isVerified: false,
      status: "active",
      role: "user",
      termsAccepted: Boolean(termsAccepted),
  termsAcceptedAt: new Date(),
    });

    // 7️⃣ Sanitize response
    const safeUser = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup Error:", error);

    // 8️⃣ MongoDB duplicate key safety net
    if (error.code === 11000) {
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
