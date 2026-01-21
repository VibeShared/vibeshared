import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Comment } from "@/lib/models/Comment";
import { Types } from "mongoose";
import { pusherServer } from "@/lib/pusher";
import { Notification as NotificationModel } from "@/lib/models/Notification";
import Post from "@/lib/models/Post";
import { isFollower } from "@/lib/helpers/isFollower";
import { isBlocked } from "@/lib/helpers/isBlocked";
import User from "@/lib/models/User";
import { canViewFullProfile } from "@/lib/helpers/privacyGuard";

/* =========================
   POST – CREATE COMMENT
========================= */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId, postId, text, parentId } = await request.json();

    /* ---------- Validation ---------- */
    if (!userId || !postId || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (text.trim().length === 0 || text.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be 1–1000 characters" },
        { status: 400 }
      );
    }

    /* ---------- Fetch Post ---------- */
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const commenterId = userId.toString();
    const postOwnerId = post.userId.toString();

    /* ---------- Privacy & Block Checks ---------- */
    if (!(await canViewFullProfile(commenterId, postOwnerId))) {
      return NextResponse.json(
        { error: "You cannot comment on this post" },
        { status: 403 }
      );
    }

    if (await isBlocked(commenterId, postOwnerId)) {
      return NextResponse.json(
        { error: "You cannot comment on this post" },
        { status: 403 }
      );
    }

    /* ---------- Owner Settings ---------- */
    const postOwner = await User.findById(post.userId)
      .select("commentPermission notificationComments")
      .lean();

    if (!postOwner) {
      return NextResponse.json(
        { error: "Post owner not found" },
        { status: 404 }
      );
    }

    if (
      postOwner.commentPermission === "followers" &&
      !(await isFollower(commenterId, postOwnerId))
    ) {
      return NextResponse.json(
        { error: "Only followers can comment" },
        { status: 403 }
      );
    }

    /* ---------- Create Comment ---------- */
    const comment = await Comment.create({
      userId: new Types.ObjectId(commenterId),
      postId: new Types.ObjectId(postId),
      parentId: parentId ? new Types.ObjectId(parentId) : null,
      text: text.trim(),
    });

    /* ---------- Notification ---------- */
    if (
      commenterId !== postOwnerId &&
      postOwner.notificationComments !== false &&
      !(await isBlocked(commenterId, postOwnerId))
    ) {
      await NotificationModel.create({
        user: post.userId,
        sender: commenterId,
        type: "comment",
        postId: post._id,
        read: false,
        message: text.trim().slice(0, 100),
      });
    }

    /* ---------- Populate for Response ---------- */
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name image username")
      .lean();

    /* ---------- Realtime Update ---------- */
    await pusherServer.trigger(`comments-${postId}`, "new-comment", {
      comment: populatedComment,
    });

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    console.error("CREATE_COMMENT_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

/* =========================
   GET – FETCH COMMENTS
========================= */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const viewerIdRaw = searchParams.get("viewerId");

    const viewerId =
      viewerIdRaw && Types.ObjectId.isValid(viewerIdRaw)
        ? viewerIdRaw
        : null;

    if (!postId || !Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId).select("userId").lean();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const ownerId = post.userId.toString();

    if (viewerId && (await isBlocked(viewerId, ownerId))) {
      return NextResponse.json(
        { error: "You cannot view these comments" },
        { status: 403 }
      );
    }

    if (!(await canViewFullProfile(viewerId, ownerId))) {
      return NextResponse.json(
        { comments: [], total: 0, page, hasMore: false },
        { status: 200 }
      );
    }

    const allComments = await Comment.find({
      postId: new Types.ObjectId(postId),
    })
      .populate("userId", "name image username")
      .sort({ createdAt: -1 })
      .lean();

    const visibleComments = [];
    for (const c of allComments) {
      const blocked =
        viewerId && (await isBlocked(viewerId, c.userId._id.toString()));
      if (!blocked) visibleComments.push(c);
    }

    const map = new Map<string, any>();
    visibleComments.forEach((c) =>
      map.set(c._id.toString(), { ...c, replies: [] })
    );

    const roots: any[] = [];
    visibleComments.forEach((c) => {
      if (c.parentId) {
        const parent = map.get(c.parentId.toString());
        if (parent) parent.replies.push(map.get(c._id.toString()));
      } else {
        roots.push(map.get(c._id.toString()));
      }
    });

    const start = (page - 1) * limit;
    const paginated = roots.slice(start, start + limit);

    return NextResponse.json({
      comments: paginated,
      total: roots.length,
      page,
      hasMore: start + paginated.length < roots.length,
    });
  } catch (error) {
    console.error("FETCH_COMMENTS_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE – DELETE COMMENT
========================= */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { commentId, userId } = await request.json();

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: "commentId and userId are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid IDs" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await Comment.deleteOne({ _id: commentId });

    await pusherServer.trigger(
      `comments-${comment.postId}`,
      "delete-comment",
      { commentId }
    );

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("DELETE_COMMENT_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
