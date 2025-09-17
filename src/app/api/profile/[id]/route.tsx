import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";
import {connectDB} from "@/lib/Connect";
import User from "@/lib/models/User";
import cloudinary from "@/lib/cloudinary";

// GET /api/profile/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise
    const { id } = await params;
    
    await connectDB();

    // Fetch user from database (only public fields)
    const user = await User.findById(id).select(
      "name email image username bio location website createdAt updatedAt"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/profile/[id] - Update user profile
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 same type as GET
) {
  try {
    const { id } = await context.params; // ✅ await params here
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    // If we're removing the image, delete from Cloudinary first
    if (body.image === "" && body.cloudinary_id === null) {
      const user = await User.findById(id);

      if (user?.cloudinary_id) {
        await cloudinary.uploader.destroy(user.cloudinary_id);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select("-password");

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
}