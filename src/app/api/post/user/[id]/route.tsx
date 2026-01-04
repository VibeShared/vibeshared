import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import Post from "@/lib/models/Post";
import { Comment } from "@/lib/models/Comment";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const posts = await Post.find({ userId: id }).populate("userId", "name email image").sort({ createdAt: -1 }).lean();

    const postsWithExtras = await Promise.all(posts.map(async post => {
      const comments = await Comment.find({ postId: post._id }).populate("userId", "name image").sort({ createdAt: -1 }).lean();
      return {
        ...post,
        likesCount: post.likesCount || 0, // ✅ use Post.likesCount
        comments,
      };
    }));

    return NextResponse.json({ posts: postsWithExtras });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const deletedResult = await Post.deleteMany({ userId: id });
    return NextResponse.json({ message: `Deleted ${deletedResult.deletedCount} post(s)`, deletedCount: deletedResult.deletedCount });
  } catch (error) {
    console.error("Error deleting user posts:", error);
    return NextResponse.json({ error: "Failed to delete posts" }, { status: 500 });
  }
}
