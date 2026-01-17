// app/api/user-media/[id]/route.ts
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import {connectDB} from "@/lib/db/connect"
import Post from "@/lib/models/Post";


interface CloudinaryResource {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ await params

  try {
    await connectDB();

    const posts = await Post.find({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    const media = posts
      .filter((p) => p.mediaUrl)
      .map((p) => ({
        postId: (p._id as Types.ObjectId).toString(),
        userId: p.userId.toString(),
        url: p.mediaUrl,
      }));

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error("Error fetching user media:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch media" },
      { status: 500 }
    );
  }
}

