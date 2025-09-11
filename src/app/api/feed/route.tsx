import { NextRequest, NextResponse } from "next/server";
import  {connectDB} from "@/lib/Connect";
import { Follower } from "@/lib/models/Follower";
import  Post  from "@/lib/models/Post";
import mongoose, { Types } from "mongoose";

// GET → Fetch feed for a user
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }

    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid User ID format" },
        { status: 400 }
      );
    }

    // 1. Find all users that the current user follows
    const following = await Follower.find({ 
      follower: new Types.ObjectId(userId) 
    }).select("following");

    // If user doesn't follow anyone, return empty array instead of error
    if (following.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const followingIds = following.map((f) => f.following);

    // 2. Fetch posts from those users with better population and projection
    const posts = await Post.find({ 
      userId: { $in: followingIds } 
    })
      .populate({
        path: "userId",
        select: "name username image", // Added username if available
        model: "User"
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean() // Better performance for read-only operations
      .exec();

    return NextResponse.json(posts, { status: 200 });

  } catch (error) {
    console.error("Feed fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" }, 
      { status: 500 }
    );
  }
}