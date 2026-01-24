import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Comment } from "@/lib/models/Comment";
import Post from "@/lib/models/Post";
import { Types } from "mongoose";
import { pusherServer } from "@/lib/pusher";
import { Notification as NotificationModel } from "@/lib/models/Notification";
import { isBlocked } from "@/lib/helpers/isBlocked";
import { canViewFullProfile } from "@/lib/helpers/privacyGuard";
import { rateLimit } from "@/lib/rateLimit";
import { apiSuccess, apiError } from "@/lib/apiResponse";
import { auth } from "@/lib/auth";

/* =====================================================
   POST – CREATE COMMENT
===================================================== */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
const userId = session?.user?.id;
    if (!userId) return apiError("Unauthorized", 401);

    // Rate limit: create comment
    if (!(await rateLimit(`comment:${userId}`, 5, 30_000))) {
      return apiError("Too many comments. Slow down.", 429);
    }

    const { postId, text, parentId } = await request.json();
    if (!postId || !text) {
      return apiError("postId and text required", 400);
    }

    if (text.trim().length === 0 || text.length > 1000) {
      return apiError("Comment must be 1–1000 characters", 400);
    }

    if (!Types.ObjectId.isValid(postId)) {
      return apiError("Invalid postId", 400);
    }

    const post = await Post.findById(postId).select("userId").lean();
    if (!post) return apiError("Post not found", 404);

    const commenterId = userId;
    const postOwnerId = post.userId.toString();

    // Privacy & block checks
    if (!(await canViewFullProfile(commenterId, postOwnerId))) {
      return apiError("Forbidden", 403);
    }

    if (await isBlocked(commenterId, postOwnerId)) {
      return apiError("Blocked", 403);
    }

    // Parent validation (single fetch)
    let parentComment = null;
    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        return apiError("Invalid parent comment", 400);
      }

      parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.postId.toString() !== postId) {
        return apiError("Invalid parent comment", 400);
      }
    }

    const comment = await Comment.create({
      userId: commenterId,
      postId,
      parentId: parentId || null,
      text: text.trim(),
    });

    // 🔔 Post owner notification
    if (commenterId !== postOwnerId) {
      await NotificationModel.create({
        user: post.userId,
        sender: commenterId,
        type: "comment",
        postId,
        message: text.slice(0, 100),
      });
    }

    // 🔔 Reply notification
   if (parentComment && parentComment.userId.toString() !== commenterId) {
  await NotificationModel.create({
    user: parentComment.userId, // Jiske comment par reply kiya
    sender: commenterId,        // Jisne reply kiya (Owner or anyone)
    type: "reply",              // Type ko "reply" rakhein (Enum update karne ke baad)
    postId,
    message: text.slice(0, 100), // Actual reply text dikhayein
  });

  // 🔥 Optional: Pusher trigger for real-time notification
  await pusherServer.trigger(`user-notifications-${parentComment.userId}`, "new-notification", {});
}

    const populated = await Comment.findById(comment._id)
      .populate("userId", "name image username")
      .lean();

    await pusherServer.trigger(`comments-${postId}`, "new-comment", {
      comment: populated,
    });

    return apiSuccess(populated);
  } catch (err) {
    console.error("CREATE_COMMENT_ERROR:", err);
    return apiError("Failed to create comment", 500);
  }
}

/* =====================================================
   GET – FETCH COMMENTS (CURSOR + PRIVACY SAFE)
===================================================== */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
const viewerId = session?.user?.id ?? null;


    // Rate limit: fetch comments
    if (
      !(await rateLimit(
        `get-comments:${viewerId ?? "guest"}`,
        60,
        60_000
      ))
    ) {
      return apiError("Too many requests.", 429);
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    if (!postId || !Types.ObjectId.isValid(postId)) {
      return apiError("Invalid postId", 400);
    }

    const post = await Post.findById(postId).select("userId").lean();
    if (!post) return apiError("Post not found", 404);

    const ownerId = post.userId.toString();

    if (viewerId && (await isBlocked(viewerId, ownerId))) {
      return apiError("Forbidden", 403);
    }

    if (!(await canViewFullProfile(viewerId, ownerId))) {
      return apiSuccess({ comments: [], nextCursor: null });
    }

    const query: any = { postId };
    if (cursor && Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const comments = await Comment.find(query)
      .populate("userId", "name image username")
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;

    return apiSuccess({
      comments: items,
      nextCursor: hasMore ? items[items.length - 1]._id : null,
    });
  } catch (err) {
    console.error("FETCH_COMMENTS_ERROR:", err);
    return apiError("Failed to fetch comments", 500);
  }
}

/* =====================================================
   DELETE – DELETE COMMENT (SOFT + IDEMPOTENT)
===================================================== */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
const userId = session?.user?.id;
    if (!userId) return apiError("Unauthorized", 401);

    // Rate limit delete
    if (!(await rateLimit(`delete-comment:${userId}`, 10, 60_000))) {
      return apiError("Too many delete requests.", 429);
    }

    const { commentId } = await request.json();
    if (!Types.ObjectId.isValid(commentId)) {
      return apiError("Invalid commentId", 400);
    }

    const rootComment = await Comment.findById(commentId);
    if (!rootComment) {
      // Idempotent delete
      return apiSuccess({ commentId });
    }

    if (rootComment.userId.toString() !== userId) {
      return apiError("Forbidden", 403);
    }

    /* -------------------------
       CASCADE DELETE
    -------------------------- */

    const idsToDelete: Types.ObjectId[] = [rootComment._id];

    // BFS traversal to find all replies
    let queue: Types.ObjectId[] = [rootComment._id];

    while (queue.length > 0) {
      const children = await Comment.find({
        parentId: { $in: queue },
      }).select("_id");

      if (children.length === 0) break;

      const childIds = children.map((c) => c._id);
      idsToDelete.push(...childIds);
      queue = childIds;
    }

    await Comment.deleteMany({
      _id: { $in: idsToDelete },
    });

    // 🔥 Realtime notify frontend
    await pusherServer.trigger(
      `comments-${rootComment.postId}`,
      "delete-comment",
      { commentId }
    );

    return apiSuccess({ commentId });
  } catch (err) {
    console.error("DELETE_COMMENT_ERROR:", err);
    return apiError("Failed to delete comment", 500);
  }
}
