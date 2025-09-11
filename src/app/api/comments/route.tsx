import { NextRequest, NextResponse } from "next/server";
import  {connectDB}  from "@/lib/Connect";
import { Comment, IComment } from "@/lib/models/Comment";
import mongoose, { Types } from "mongoose";

// Type definitions
interface CreateCommentRequest {
  userId: string;
  postId: string;
  text: string;
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

interface PopulatedComment extends Omit<IComment, 'userId'> {
  userId: PopulatedUser;
}

interface ErrorResponse {
  error: string;
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body: CreateCommentRequest = await request.json();
    const { userId, postId, text } = body;

    if (!userId || !postId || !text) {
      return NextResponse.json(
        { error: "Missing required fields: userId, postId, and text are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid userId or postId format" },
        { status: 400 }
      );
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment text cannot be empty" },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: "Comment cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    const comment = await Comment.create({ 
      userId: new Types.ObjectId(userId), 
      postId: new Types.ObjectId(postId), 
      text: text.trim() 
    });
    
    // Populate the newly created comment to return user data
    const populatedComment = await Comment.findById(comment._id)
      .populate<{ userId: PopulatedUser }>("userId", "name image")
      .exec();

    return NextResponse.json(populatedComment, { status: 201 });

  } catch (error) {
    console.error("Create Comment error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// GET - Fetch comments for a post
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid Post ID format" },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ postId: new Types.ObjectId(postId) })
      .populate<{ userId: PopulatedUser }>("userId", "name image")
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(comments);

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
      return NextResponse.json(
        { error: "commentId and userId are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid commentId or userId format" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if ((comment.userId as Types.ObjectId).toString() !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this comment" },
        { status: 403 }
      );
    }

    await Comment.deleteOne({ _id: commentId });
    return NextResponse.json({ message: "Comment deleted successfully" });

  } catch (error) {
    console.error("Delete Comment error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}