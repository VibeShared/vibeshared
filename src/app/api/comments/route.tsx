// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import { Comment } from "@/lib/models/Comment";
import mongoose, { Types } from "mongoose";
import { pusherServer } from "@/lib/pusher";
import { Notification as NotificationModel } from "@/lib/models/Notification";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";


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
  try {
    await connectDB();

    const { userId, postId, text, parentId }: CreateCommentRequest = await request.json();

    if (!userId || !postId || !text) {
      return NextResponse.json(
        { error: "Missing required fields: userId, postId, text" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid userId or postId" }, { status: 400 });
    }

    if (text.trim().length === 0 || text.length > 1000) {
      return NextResponse.json({ error: "Comment must be 1-1000 characters" }, { status: 400 });
    }

    // Create comment
   const comment = await Comment.create({
  userId: new Types.ObjectId(userId),
  postId: new Types.ObjectId(postId),
  parentId: parentId ? new Types.ObjectId(parentId) : null,
  text: text.trim(),
});

    // Fetch post for notification (type-safe)
   const post = await Post.findById(postId).lean<{ _id: Types.ObjectId; userId: Types.ObjectId }>();

if (post && post.userId.toString() !== userId) {
  await NotificationModel.create({
    user: post.userId,
    sender: userId,
    type: "comment",
    postId: post._id,
    read: false,
  });
}

    // Populate user for frontend
  const populatedComment = await Comment.findById(comment._id)
  .populate<{ userId: { _id: Types.ObjectId; name: string; image?: string } }>(
    "userId",
    "name image"
  )
  .lean()
  .exec();

  
  if (!populatedComment) {
  return NextResponse.json({ error: "Failed to populate comment" }, { status: 500 });
}


    // Trigger real-time Pusher event
    await pusherServer.trigger(`comments-${postId}`, "new-comment", {
  comment: populatedComment,
});

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    console.error("Create Comment error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

// GET - Fetch comments with replies
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Fetch all comments for the post
    const allComments = await Comment.find({ postId: new Types.ObjectId(postId) })
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .lean();

    // Build nested structure
    const map = new Map<string, any>();
    allComments.forEach((c) => {
      map.set(c._id.toString(), { ...c, replies: [] });
    });

    const rootComments: any[] = [];
    allComments.forEach((c) => {
      if (c.parentId) {
        const parent = map.get(c.parentId.toString());
        if (parent) parent.replies.push(map.get(c._id.toString()));
      } else {
        rootComments.push(map.get(c._id.toString()));
      }
    });

    // Paginate root comments only
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
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
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
