import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectdb from "@/lib/Connect";
import { Like, ILike } from "@/lib/models/Likes";
import Post from "@/lib/models/Post";
import { Types } from "mongoose";

// Type definitions
interface LikeRequest {
  userId: string;
  postId: string;
}

interface LikeResponse {
  message?: string;
  like?: ILike;
  error?: string;
}

interface LikesCountResponse {
  count: number;
  users: ILike[];
  error?: string;
}

interface PopulatedLikeUser {
  _id: Types.ObjectId;
  name?: string;
  image?: string;
}

// POST - Like/Unlike a post
export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(connectdb);
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    const body: LikeRequest = await request.json();
    const { userId, postId } = body;

    // Validation
    if (!userId || !postId) {
      return NextResponse.json(
        { error: "User ID and Post ID are required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid User ID or Post ID format" },
        { status: 400 }
      );
    }

    // Check if post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if like exists
    const existingLike = await Like.findOne({ userId, postId });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      
      // Optionally update post like count if you have that field
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      
      return NextResponse.json({ message: "Post unliked" });
    }

    // Like
    const like = await Like.create({ userId, postId });
    
    // Optionally update post like count if you have that field
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    
    return NextResponse.json({ like }, { status: 201 });

  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { error: "Failed to like/unlike post" },
      { status: 500 }
    );
  }
}

// GET - Get likes for a post
export async function GET(request: NextRequest) {
  try {
    await mongoose.connect(connectdb);
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
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

    const likes = await Like.find({ postId })
      .populate<{ userId: PopulatedLikeUser }>("userId", "name image")
      .exec();

    return NextResponse.json({ 
      count: likes.length, 
      users: likes 
    });

  } catch (error) {
    console.error("Get Likes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}