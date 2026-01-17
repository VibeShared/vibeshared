import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Like } from "@/lib/models/Likes";
import Post from "@/lib/models/Post";
import { Notification } from "@/lib/models/Notification";
import mongoose from "mongoose";
import { isBlocked } from "@/lib/helpers/isBlocked";
import { canViewFullProfile } from "@/lib/helpers/privacyGuard";

/* -------------------------------------------------
   POST → Like / Unlike a Post (PRIVACY SAFE)
-------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, postId } = await req.json();

    /* ---------- Validation ---------- */
    if (!userId || !postId) {
      return NextResponse.json(
        { error: "User ID and Post ID are required" },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    /* ---------- Fetch Post ---------- */
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const ownerId = post.userId.toString();

    /* ---------- Block Check (HIGHEST PRIORITY) ---------- */
    if (await isBlocked(userId, ownerId)) {
      return NextResponse.json(
        { error: "You cannot interact with this post" },
        { status: 403 }
      );
    }

    /* ---------- Privacy Check (MANDATORY) ---------- */
    const canView = await canViewFullProfile(userId, ownerId);
    if (!canView) {
      return NextResponse.json(
        { error: "You cannot interact with this post" },
        { status: 403 }
      );
    }

    /* ---------- Like / Unlike ---------- */
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

    /* ---------- Notification ---------- */
    if (ownerId !== userId) {
      await Notification.create({
        user: ownerId,
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
    console.error("LIKE_API_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to like/unlike post" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------
   GET → Fetch Likes of a Post (PRIVACY SAFE)
-------------------------------------------------- */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const viewerIdRaw = searchParams.get("viewerId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid Post ID format" },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId).select("userId");
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const ownerId = post.userId.toString();

    const viewerId =
      viewerIdRaw && mongoose.Types.ObjectId.isValid(viewerIdRaw)
        ? viewerIdRaw
        : null;

    /* ---------- Block Check ---------- */
    if (viewerId && (await isBlocked(viewerId, ownerId))) {
      return NextResponse.json(
        { error: "You cannot view likes of this post" },
        { status: 403 }
      );
    }

    /* ---------- Privacy Check ---------- */
    const canView = await canViewFullProfile(viewerId, ownerId);
    if (!canView) {
      return NextResponse.json(
        { count: 0, users: [] },
        { status: 200 } // silent protection
      );
    }

    const likes = await Like.find({ postId })
      .populate("userId", "name image")
      .lean();

    return NextResponse.json({
      count: likes.length,
      users: likes.map((like) => like.userId),
    });
  } catch (error) {
    console.error("GET_LIKES_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}
