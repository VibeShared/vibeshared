import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import { Follower } from "@/lib/models/Follower";
import { Notification } from "@/lib/models/Notification";
import User from "@/lib/models/User";
import { isBlocked } from "@/lib/helpers/isBlocked";

/* ---------------- POST → Follow ---------------- */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { followerId, followingId } = await req.json();

    /* ---------- Validation ---------- */
    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    /* ---------- Block Check (GLOBAL) ---------- */
    if (await isBlocked(followerId, followingId)) {
      return NextResponse.json(
        { error: "You cannot follow this user" },
        { status: 403 }
      );
    }

    /* ---------- Fetch Target User ---------- */
    const targetUser = await User.findById(followingId)
      .select("isPrivate notificationFollows")
      .lean();

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /* ---------- Handle Private Account ---------- */
    if (targetUser.isPrivate) {
      return NextResponse.json(
        { error: "Follow request required (private account)" },
        { status: 403 }
      );
    }

    /* ---------- Create Follow ---------- */
    const follow = await Follower.create({
      follower: followerId,
      following: followingId,
    });

    /* ---------- Notification (Respect Settings + Block) ---------- */
    if (targetUser.notificationFollows !== false) {
      await Notification.create({
        user: followingId,
        sender: followerId,
        type: "follow",
        read: false,
      });
    }

    return NextResponse.json(follow, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Already following" },
        { status: 400 }
      );
    }

    console.error("FOLLOW_ERROR:", err);
    return NextResponse.json(
      { error: "Failed to follow" },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE → Unfollow ---------------- */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await Follower.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    return NextResponse.json(
      { message: "Unfollowed successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("UNFOLLOW_ERROR:", err);
    return NextResponse.json(
      { error: "Failed to unfollow" },
      { status: 500 }
    );
  }
}

/* ---------------- GET → Followers / Following ---------------- */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    if (!userId || !type) {
      return NextResponse.json(
        { error: "Missing query params" },
        { status: 400 }
      );
    }

    let result;

    if (type === "followers") {
      result = await Follower.find({ following: userId }).populate(
        "follower",
        "name username image"
      );
    } else if (type === "following") {
      result = await Follower.find({ follower: userId }).populate(
        "following",
        "name username image"
      );
    } else {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 }
      );
    }

    result = result.filter(
  async r => !(await isBlocked(userId, r.follower._id.toString()))
);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("GET_FOLLOW_ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch followers/following" },
      { status: 500 }
    );
  }
}
