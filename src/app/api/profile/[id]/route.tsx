// src/app/api/profile/[id]/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import cloudinary from "@/lib/cloudinary";
// ✅ Import auth from your config file
import { auth } from "@/lib/auth";

// GET - Public Profile Fetch
export const GET = auth(async (req, { params }) => {
  try {
    const { id } = (await params) as { id: string };
    await connectDB();
    console.log("Fetching profile for ID:", id);

    const user = await User.findById(id).select(
      "name email image username bio location website createdAt updatedAt"
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}) as any;

// PATCH - Secure Profile Update
export const PATCH = auth(async (req, { params }) => {
  try {
    const { id } = (await params) as { id: string };
    
    // ✅ Auth.js v5: Session is directly on req.auth
    const session = req.auth;

    // Authorization: User must be logged in AND updating their own ID
    if (!session?.user?.id || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    // Image Cleanup Logic
    if (body.image === "" && body.cloudinary_id === null) {
      const user = await User.findById(id).select("cloudinary_id");
      if (user?.cloudinary_id) {
        await cloudinary.uploader.destroy(user.cloudinary_id);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select("-password").lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}) as any;