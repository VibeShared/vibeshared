// src/app/api/auth/check-availability/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
  const { email, username } = await req.json();

if (!username) {
  return NextResponse.json(
    { error: "Username required" },
    { status: 400 }
  );
}

await connectDB();

const query: any[] = [
  { username: username.toLowerCase().trim() },
];

if (email) {
  query.push({ email: email.toLowerCase().trim() });
}

const existingUser = await User.findOne({ $or: query });

if (existingUser) {
  if (email && existingUser.email === email.toLowerCase().trim()) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }
  return NextResponse.json(
    { error: "Username already taken" },
    { status: 409 }
  );
}

return NextResponse.json({ available: true });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
