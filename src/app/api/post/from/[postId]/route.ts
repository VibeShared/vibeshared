// src/app/api/post/from/[postId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import Post from "@/lib/models/Post";
import { canViewFullProfile } from "@/lib/helpers/privacyGuard";
import BlockedUser from "@/lib/models/BlockedUser";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await context.params;

    // 🔒 HARD GUARD (prevents Mongo CastError)
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid postId" },
        { status: 400 }
      );
    }

    await connectDB();

    const session = await auth();
    const viewerId = session?.user?.id || null;

    /* --------------------------------
       1️⃣ Fetch base post
    -------------------------------- */
    const basePost = await Post.findById(postId)
      .select("userId createdAt")
      .lean();

    if (!basePost) {
      return NextResponse.json({ posts: [] }, { status: 404 });
    }

    const ownerId = basePost.userId.toString();

    /* --------------------------------
       2️⃣ OWNER BYPASS
    -------------------------------- */
    if (viewerId && viewerId === ownerId) {
      const posts = await Post.find({
        userId: ownerId,
        createdAt: { $lte: basePost.createdAt },
      })
      .populate("userId", "username name image")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      return NextResponse.json({ posts });
    }

    /* --------------------------------
       3️⃣ HARD BLOCK CHECK
    -------------------------------- */
    if (viewerId) {
      const blocked = await BlockedUser.exists({
        $or: [
          { blocker: viewerId, blocked: ownerId },
          { blocker: ownerId, blocked: viewerId },
        ],
      });

      if (blocked) {
        return NextResponse.json(
          { error: "You cannot view this content" },
          { status: 403 }
        );
      }
    }

    /* --------------------------------
       4️⃣ PRIVACY CHECK
    -------------------------------- */
    const canView = await canViewFullProfile(viewerId, ownerId);
    if (!canView) {
      return NextResponse.json(
        { posts: [], isPrivate: true },
        { status: 200 }
      );
    }

    /* --------------------------------
       5️⃣ Fetch posts
    -------------------------------- */
    const posts = await Post.find({
      userId: ownerId,
      createdAt: { $lte: basePost.createdAt },
    })
     .populate("userId", "username name image")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ posts });

  } catch (error) {
    console.error("POST_FROM_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
