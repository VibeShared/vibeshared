// src/app/api/post/[id]/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Post, { IPost } from "@/lib/models/Post";
import { Comment, IComment } from "@/lib/models/Comment";
import cloudinary from "@/lib/cloudinary";
// ✅ Import auth from your config
import { auth } from "@/lib/auth"; 
import { canViewFullProfile } from "@/lib/helpers/privacyGuard";
import { isBlocked } from "@/lib/helpers/isBlocked";


// ✅ GET: Publicly accessible but session-aware
export const GET = auth(async (req, { params }) => {
  const { id } = (await params) as { id: string };
   try {
    await connectDB();

    const viewerId = req.auth?.user?.id || null;

    const post = await Post.findById(id)
      .populate("userId", "name image email isPrivate")
      .lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const ownerId = post.userId._id.toString();

    // 1️⃣ Block check (highest priority)
    if (viewerId && (await isBlocked(viewerId, ownerId))) {
      return NextResponse.json(
        { error: "You cannot view this post" },
        { status: 403 }
      );
    }

    // 2️⃣ Privacy check
    const canView = await canViewFullProfile(viewerId, ownerId);

    if (!canView) {
      return NextResponse.json(
        { error: "This post is private" },
        { status: 403 }
      );
    }

    // 3️⃣ Fetch comments ONLY if allowed
    const comments = await Comment.find({ postId: post._id })
      .populate("userId", "username name image isPrivate")
      .sort({ createdAt: -1 })
      .lean();

    const normalizedPost = {
  _id: post._id.toString(),

  userId: {
    id: post.userId._id.toString(),
    username: post.userId.username,
    name: post.userId.name,
    image: post.userId.image,
  },

  content: post.content,
  mediaUrl: post.mediaUrl,
  createdAt: post.createdAt,
  likesCount: post.likesCount || 0,
};

return NextResponse.json({
  ...normalizedPost,
  comments,
});
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
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