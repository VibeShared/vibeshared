// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {connectDB} from "@/lib/Connect";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, otp } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },  
        { status: 400 }
      );
    }

    await connectDB();


    //     // ✅ Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image: "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png", // default profile pic
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);

    // ✅ Catch duplicate key error (in case unique index triggers)
    if (error.code === 11000 && error.keyPattern?.name) {
      return NextResponse.json(
        { error: "This name is already taken. Please choose another." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
