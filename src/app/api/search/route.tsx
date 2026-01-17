import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import BlockedUser from "@/lib/models/BlockedUser";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const viewerId = session?.user?.id || null;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
    const skip = Number(searchParams.get("skip")) || 0;

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const regex = new RegExp(query, "i");

    /* --------------------------------
       BLOCK LIST (ONCE)
    -------------------------------- */
    let blockedIds: mongoose.Types.ObjectId[] = [];

    if (viewerId) {
      const blocks = await BlockedUser.find({
        $or: [{ blocker: viewerId }, { blocked: viewerId }],
      }).select("blocker blocked");

      blockedIds = blocks.map((b) =>
        b.blocker.toString() === viewerId
          ? b.blocked
          : b.blocker
      );
    }

    const users = await User.aggregate([
      {
        $match: {
          status: "active",
          _id: { $nin: blockedIds },
          $or: [{ username: regex }, { name: regex }],
        },
      },
      { $sort: { username: 1 } },
      {
        $project: {
          _id: 1,
          username: 1,
          name: 1,
          image: 1,
          isVerified: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        _id: u._id.toString(),
      })),
    });
  } catch (error) {
    console.error("USER_SEARCH_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
