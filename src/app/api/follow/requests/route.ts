import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Follower } from "@/lib/models/Follower";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ requests: [] });
  }

  await connectDB();

  const userId = session.user.id;

  const requests = await Follower.find({
    following: userId,
    status: "pending",
  })
    .populate("follower", "name username image")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ requests });
}
