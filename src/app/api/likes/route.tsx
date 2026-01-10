import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import { Like } from "@/lib/models/Likes";
import Post from "@/lib/models/Post";
import { Notification } from "@/lib/models/Notification";
import mongoose from "mongoose";
import { isBlocked } from "@/lib/helpers/isBlocked";

// POST - Like or Unlike a post
// POST - Like or Unlike a post
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, postId } = await req.json();

    if (!userId || !postId)
      return NextResponse.json(
        { error: "User ID and Post ID are required" },
        { status: 400 }
      );

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    )
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

    const post = await Post.findById(postId);
    if (!post)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // 🚫 BLOCK CHECK (CORRECT)
    const blocked = await isBlocked(userId, post.userId.toString());
    if (blocked) {
      return NextResponse.json(
        { error: "You cannot interact with this post" },
        { status: 403 }
      );
    }

    const existingLike = await Like.findOne({ userId, postId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      post.likesCount = Math.max((post.likesCount || 1) - 1, 0);
      await post.save();

      return NextResponse.json({
        message: "Post unliked",
        likesCount: post.likesCount,
      });
    }

    await Like.create({ userId, postId });
    post.likesCount = (post.likesCount || 0) + 1;
    await post.save();

    if (post.userId.toString() !== userId) {
      await Notification.create({
        user: post.userId,
        sender: userId,
        type: "like",
        postId,
        read: false,
      });
    }

    return NextResponse.json({
      message: "Post liked",
      likesCount: post.likesCount,
    });
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { error: "Failed to like/unlike post" },
      { status: 500 }
    );
  }
}




// GET - Get likes for a post
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId)
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    if (!mongoose.Types.ObjectId.isValid(postId))
      return NextResponse.json(
        { error: "Invalid Post ID format" },
        { status: 400 }
      );

    const likes = await Like.find({ postId })
      .populate("userId", "name image")
      .lean();

    return NextResponse.json({
      count: likes.length,
      users: likes.map((like) => like.userId),
    });
  } catch (error) {
    console.error("Get Likes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}
