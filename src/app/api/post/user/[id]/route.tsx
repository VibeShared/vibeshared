// app/api/posts/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/Connect";
import Post from "@/lib/models/Post";
import { Comment } from "@/lib/models/Comment";
import { Like } from "@/lib/models/Likes";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ must await

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const posts = await Post.find({ userId: id })
      .populate("userId", "name email image")
      .sort({ createdAt: -1 })
      .lean();

    if (!posts.length) {
      return NextResponse.json(
        { message: "No posts found for this user", posts: [] },
        { status: 200 }
      );
    }

    const postsWithExtras = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "name image")
          .sort({ createdAt: -1 })
          .lean();

        const likes = await Like.find({ postId: post._id }).lean();

        return {
          ...post,
          comments,
          likesCount: likes.length,
        };
      })
    );

    return NextResponse.json({ posts: postsWithExtras });
  } catch (error: any) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ must await

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const deletedResult = await Post.deleteMany({ userId: id });

    return NextResponse.json(
      {
        message: `Deleted ${deletedResult.deletedCount} post(s) for this user`,
        deletedCount: deletedResult.deletedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting user posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete posts" },
      { status: 500 }
    );
  }
}
