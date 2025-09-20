import { NextRequest, NextResponse } from "next/server";
import  {connectDB}  from "@/lib/Connect";
import { Follower } from "@/lib/models/Follower";
import { Notification } from "@/lib/models/Notification";


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


    await Notification.create({
  user: followingId,      // Who should receive notification
  sender: followerId,    // Who triggered it
  type: "follow",
  read: false,
});

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
      return NextResponse.json({ error: "Missing query params" }, { status: 400 });
    }

    let result;
   if (type === "followers") {
  result = await Follower.find({ following: userId }).populate("follower", "name email image");
} else if (type === "following") {
  result = await Follower.find({ follower: userId }).populate("following", "name email image");
} else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Fetch followers error:", error);
    return NextResponse.json({ error: "Failed to fetch followers/following" }, { status: 500 });
  }
}
