import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Follower } from "@/lib/models/Follower";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();

  const viewerId = session?.user?.id;
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");

  if (!viewerId || !targetUserId) {
    return NextResponse.json({ status: "none" });
  }

  await connectDB();

  const record = await Follower.findOne({
    follower: viewerId,
    following: targetUserId,
  }).lean();

  if (!record) {
    return NextResponse.json({ status: "none" });
  }

  return NextResponse.json({
    status: record.status, // "pending" | "approved"
  });
}
