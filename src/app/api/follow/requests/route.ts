import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Follower } from "@/lib/models/Follower";
import { auth } from "@/lib/auth";

export const GET = auth(async (req) => {
  await connectDB();

  const userId = req.auth?.user?.id;
  if (!userId) {
    return NextResponse.json({ requests: [] });
  }

  const requests = await Follower.find({
    following: userId,
    status: "pending",
  })
    .populate("follower", "name username image")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ requests });
});
