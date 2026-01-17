import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Post from "@/lib/models/Post";
import { Comment } from "@/lib/models/Comment";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { canViewFullProfile } from "@/lib/helpers/privacyGuard";
import { isBlocked } from "@/lib/helpers/isBlocked";

/* ============================================================
   GET → Fetch single post (session-aware)
============================================================ */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const viewerId = session?.user?.id || null;

    const { id } = await context.params;

    await connectDB();

    const post = await Post.findById(id)
      .populate("userId", "username name image isPrivate")
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const ownerId = post.userId._id.toString();

    /* 1️⃣ Block check */
    if (viewerId && (await isBlocked(viewerId, ownerId))) {
      return NextResponse.json(
        { error: "You cannot view this post" },
        { status: 403 }
      );
    }

    /* 2️⃣ Privacy check */
    const canView = await canViewFullProfile(viewerId, ownerId);
    if (!canView) {
      return NextResponse.json(
        { error: "This post is private" },
        { status: 403 }
      );
    }

    /* 3️⃣ Fetch comments */
    const comments = await Comment.find({ postId: post._id })
      .populate("userId", "username name image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      _id: post._id.toString(),
      userId: {
        id: ownerId,
        username: post.userId.username,
        name: post.userId.name,
        image: post.userId.image,
      },
      content: post.content,
      mediaUrl: post.mediaUrl,
      createdAt: post.createdAt,
      likesCount: post.likesCount || 0,
      comments,
    });
  } catch (error) {
    console.error("FETCH_POST_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/* ============================================================
   DELETE → Delete post (owner only)
============================================================ */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    await connectDB();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    /* Cloudinary cleanup */
    if (post.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(post.cloudinary_id);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_POST_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
