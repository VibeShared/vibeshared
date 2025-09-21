import { NextRequest, NextResponse } from "next/server";
import  {connectDB}  from "@/lib/Connect";
import { Follower } from "@/lib/models/Follower";



// POST → Follow a user
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (followerId === followingId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    const follow = await Follower.create({ follower: followerId, following: followingId });

    return NextResponse.json(follow, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
  }
}

// DELETE → Unfollow a user
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await Follower.findOneAndDelete({ follower: followerId, following: followingId });
    return NextResponse.json({ message: "Unfollowed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 });
  }
}

// GET → Fetch followers or following
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // "followers" or "following"

    if (!userId || !type) {
      return NextResponse.json({ error: "Missing userId or type" }, { status: 400 });
    }

    if (type === "followers") {
      // People who follow THIS user
      const followers = await Follower.find({ following: userId })
        .populate("follower", "name image email")
        .lean();

      return NextResponse.json(
        followers.map((f) => ({
          _id: f._id,
          user: f.follower, // normalize key for frontend
        }))
      );
    }

    if (type === "following") {
      // People THIS user follows
      const following = await Follower.find({ follower: userId })
        .populate("following", "name image email")
        .lean();

      return NextResponse.json(
        following.map((f) => ({
          _id: f._id,
          user: f.following, // normalize key for frontend
        }))
      );
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Follow API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
