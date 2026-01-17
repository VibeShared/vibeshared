// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Comment } from "@/lib/models/Comment";
import mongoose, { Types } from "mongoose";
import { pusherServer } from "@/lib/pusher";
import { Notification as NotificationModel } from "@/lib/models/Notification";
import { Wallet } from "@/lib/models/Wallet";
import Post from "@/lib/models/Post";
import { isFollower } from "@/lib/helpers/isFollower";
import { isBlocked } from "@/lib/helpers/isBlocked";
import User from "@/lib/models/User";
import { canViewFullProfile } from "@/lib/helpers/privacyGuard";




// Interfaces
interface CreateCommentRequest {
  userId: string;
  postId: string;
  text: string;
   parentId?: string; // ✅ allow replies
}


interface DeleteCommentRequest {
  commentId: string;
  userId: string;
}

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  image?: string;
}

interface PopulatedComment {
  _id: string;
  text: string;
  userId: PopulatedUser;
  createdAt: Date;
}

interface DeleteCommentPayload {
  commentId: string;
}




// POST - Create a new comment
export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectDB();

    session = await mongoose.startSession();
    session.startTransaction();

    const {
      userId,
      postId,
      text,
      parentId,
      tipAmount = 0,
    } = await request.json();

    /* ---------- Basic Validation ---------- */
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

    if (tipAmount < 0 || tipAmount > 10000) {
      return NextResponse.json(
        { error: "Invalid tip amount" },
        { status: 400 }
      );
    }

    /* ---------- Fetch Post ---------- */
    const post = await Post.findById(postId).session(session);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const commenterId = userId.toString();
    const postOwnerId = post.userId.toString();

    const canView = await canViewFullProfile(commenterId, postOwnerId);
if (!canView) {
  return NextResponse.json(
    { error: "You cannot comment on this post" },
    { status: 403 }
  );
}


    /* ---------- Block Check (GLOBAL) ---------- */
    if (await isBlocked(commenterId, postOwnerId)) {
      return NextResponse.json(
        { error: "You cannot comment on this post" },
        { status: 403 }
      );
    }

    /* ---------- Fetch Post Owner Settings ---------- */
    const postOwner = await User.findById(post.userId)
      .select("commentPermission notificationComments")
      .lean();

    if (!postOwner) {
      return NextResponse.json(
        { error: "Post owner not found" },
        { status: 404 }
      );
    }

    /* ---------- Comment Permission Check ---------- */
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
    const [comment] = await Comment.create(
      [
        {
          userId: new Types.ObjectId(commenterId),
          postId: new Types.ObjectId(postId),
          parentId: parentId ? new Types.ObjectId(parentId) : null,
          text: text.trim(),
          tipAmount,
          isHighlighted: tipAmount > 0,
        },
      ],
      { session }
    );

    /* ---------- Handle Tip (Wallet) ---------- */
    let updatedWallet = null;

    if (tipAmount > 0) {
      const platformFee = tipAmount * 0.3;
      const creatorAmount = tipAmount - platformFee;

      updatedWallet = await Wallet.findOneAndUpdate(
        { userId: post.userId },
        {
          $inc: {
            balance: creatorAmount,
            totalEarned: creatorAmount,
          },
          $push: {
            transactions: {
              type: "credit",
              amount: creatorAmount,
              status: "completed",
              createdAt: new Date(),
            },
          },
        },
        { upsert: true, new: true, session }
      );

      if (!updatedWallet) {
        throw new Error("Failed to update creator wallet");
      }
    }

    /* ---------- Notification (Respect Settings + Block) ---------- */
    if (
      commenterId !== postOwnerId &&
      postOwner.notificationComments !== false &&
      !(await isBlocked(commenterId, postOwnerId))
    ) {
      await NotificationModel.create(
        [
          {
            user: post.userId,
            sender: commenterId,
            type: tipAmount > 0 ? "tip" : "comment",
            postId: post._id,
            read: false,
            message:
  tipAmount > 0
    ? `You received ₹${tipAmount} tip!`
    : text.trim().slice(0, 100),
          },
        ],
        { session }
      );
    }

    /* ---------- Commit Transaction ---------- */
    await session.commitTransaction();

    /* ---------- Populate Comment for Response ---------- */
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name image username")
      .lean();

    /* ---------- Trigger Realtime Update ---------- */
    // ⚠️ Do NOT include pusher in transaction
    await pusherServer.trigger(`comments-${postId}`, "new-comment", {
      comment: populatedComment,
      wallet: updatedWallet ? updatedWallet.toObject() : null,
    });

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("CREATE_COMMENT_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}



// GET - Fetch comments with replies (PRIVACY SAFE)
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

    // 🔒 Fetch post owner (for privacy)
    const post = await Post.findById(postId).select("userId").lean();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const ownerId = post.userId.toString();

    // 🚫 Block check
    if (viewerId && (await isBlocked(viewerId, ownerId))) {
      return NextResponse.json(
        { error: "You cannot view these comments" },
        { status: 403 }
      );
    }

    // 🔐 Privacy check (CORE FIX)
    const canView = await canViewFullProfile(viewerId, ownerId);
    if (!canView) {
      return NextResponse.json(
        { comments: [], total: 0, page, hasMore: false },
        { status: 200 }
      );
    }

    // ✅ Fetch all comments (same as your code)
    const allComments = await Comment.find({
      postId: new Types.ObjectId(postId),
    })
      .populate("userId", "name image username")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ FIXED block filtering (sync-safe)
    const visibleComments = [];
    for (const c of allComments) {
      const blocked =
        viewerId &&
        (await isBlocked(viewerId, c.userId._id.toString()));
      if (!blocked) visibleComments.push(c);
    }

    // ✅ SAME nested reply logic (unchanged)
    const map = new Map<string, any>();
    visibleComments.forEach((c) => {
      map.set(c._id.toString(), { ...c, replies: [] });
    });

    const rootComments: any[] = [];
    visibleComments.forEach((c) => {
      if (c.parentId) {
        const parent = map.get(c.parentId.toString());
        if (parent) parent.replies.push(map.get(c._id.toString()));
      } else {
        rootComments.push(map.get(c._id.toString()));
      }
    });

    // ✅ SAME pagination logic
    const start = (page - 1) * limit;
    const paginated = rootComments.slice(start, start + limit);

    return NextResponse.json({
      comments: paginated,
      total: rootComments.length,
      page,
      hasMore: start + paginated.length < rootComments.length,
    });
  } catch (error) {
    console.error("Fetch Comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}



// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const body: DeleteCommentRequest = await request.json();
    const { commentId, userId } = body;

    if (!commentId || !userId) {
      return NextResponse.json({ error: "commentId and userId are required" }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid commentId or userId format" }, { status: 400 });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if ((comment.userId as Types.ObjectId).toString() !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 });
    }

    await Comment.deleteOne({ _id: commentId });

    // 🔥 Trigger Pusher event for real-time delete
    const payload: DeleteCommentPayload = { commentId };
    await pusherServer.trigger(`comments-${comment.postId}`, "delete-comment", payload);

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}



