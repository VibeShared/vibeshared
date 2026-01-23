import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  const { identifier, password } = await req.json();

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Missing credentials" },
      { status: 400 }
    );
  }

  await connectDB();

  const user = await User.findOne({
    $or: [
      { email: identifier },
      { username: identifier.toLowerCase() },
    ],
  }).select("+password");

  if (!user || !user.password || user.status !== "active") {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
    },
    process.env.AUTH_SECRET!,
    { expiresIn: "30d" }
  );

  return NextResponse.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
    },
  });
}
