import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Follower } from "@/lib/models/Follower";
import { auth } from "@/lib/auth";

export const GET = auth(async (req) => {
  await connectDB();

  const viewerId = req.auth?.user?.id;
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");

  if (!viewerId || !targetUserId) {
    return NextResponse.json({ status: "none" });
  }

  const record = await Follower.findOne({
    follower: viewerId,
    following: targetUserId,
  }).lean();

  if (!record) {
    return NextResponse.json({ status: "none" });
  }

  return NextResponse.json({ status: record.status }); // pending | approved
});
