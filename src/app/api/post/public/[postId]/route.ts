// src/app/api/post/public/[postId]/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Post from "@/lib/models/Post";
import mongoose from "mongoose";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    // 🔒 HARD GUARD (prevents crawler + Mongo crashes)
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid postId" },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.findById(postId)
      .select("content mediaUrl userId")
      .populate("userId", "name username")
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        _id: post._id,
        content: post.content ?? "",
        mediaUrl: post.mediaUrl ?? null,
        user: {
          name: post.userId?.name ?? "User",
          username: post.userId?.username ?? "user",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );

  } catch (err) {
    // ⚠️ DO NOT return 500 (Facebook caches failures)
    return NextResponse.json(
      { error: "Metadata unavailable" },
      { status: 200 }
    );
  }
}
