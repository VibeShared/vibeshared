import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import Post, { IPost } from "@/lib/models/Post";
import { Comment, IComment } from "@/lib/models/Comment";
import cloudinary from "@/lib/cloudinary";
// ✅ Import auth from your config
import { auth } from "@/lib/auth"; 

// ✅ GET: Publicly accessible but session-aware
export const GET = auth(async (req, { params }) => {
  const { id } = (await params) as { id: string };
  try {
    await connectDB();

    const post = (await Post.findById(id)
      .populate("userId", "name image email")
      .lean()) as (IPost & { userId: { name?: string; image?: string; email?: string } }) | null;

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const comments = (await Comment.find({ postId: post._id })
      .populate("userId", "usernamename image")
      .sort({ createdAt: -1 })
      .lean()) as (IComment & { userId: { name?: string; image?: string } })[];

    return NextResponse.json({
      ...post,
      likesCount: post.likesCount || 0,
      comments,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}) as any;

// ✅ DELETE: Strictly protected
export const DELETE = auth(async (req, { params }) => {
  const { id } = (await params) as { id: string };
  
  // ✅ Auth.js v5: Check session directly from req.auth
  const session = req.auth;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Ownership check
    if (post.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cloudinary Cleanup
    if (post.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(post.cloudinary_id);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    await Post.findByIdAndDelete(id);
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}) as any;