import { NextRequest, NextResponse } from "next/server";
import connectdb  from "@/lib/Connect";
import { Profile } from "@/lib/models/Profile";
import  Post  from "@/lib/models/Post";
import mongoose, { Types } from "mongoose";

// GET → Search users or posts
export async function GET(req: NextRequest) {
  try {
    await mongoose.connect(connectdb);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // "users" | "posts"

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" }, 
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Search type is required" }, 
        { status: 400 }
      );
    }

    // Validate query length
    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters long" },
        { status: 400 }
      );
    }

    let results;

    if (type === "users") {
      results = await Profile.find({
        username: { $regex: query.trim(), $options: "i" },
      })
        .select("username bio avatar userId")
        .populate("userId", "name email image") // Populate user data if needed
        .limit(20)
        .lean() // Better performance for read-only operations
        .exec();

    } else if (type === "posts") {
      results = await Post.find({
        $or: [
          { content: { $regex: query.trim(), $options: "i" } },
          { caption: { $regex: query.trim(), $options: "i" } }, // If you have caption field
        ]
      })
        .populate({
          path: "userId",
          select: "name username email image", // Added username if available
          model: "User"
        })
        .sort({ createdAt: -1 }) // Show latest posts first
        .limit(20)
        .lean()
        .exec();

    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'users' or 'posts'" }, 
        { status: 400 }
      );
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" }, 
      { status: 500 }
    );
  }
}