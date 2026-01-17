import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Follower } from "@/lib/models/Follower";
import { Notification } from "@/lib/models/Notification";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectDB();

  const userId = session.user.id;
  const { followerId, action } = await req.json();
  // action: "accept" | "reject"

  const record = await Follower.findOne({
    follower: followerId,
    following: userId,
    status: "pending",
  });

  if (!record) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  if (action === "accept") {
    record.status = "approved";
    await record.save();

    await Notification.create({
      user: followerId,
      sender: userId,
      type: "follow",
      read: false,
    });
  } else {
    await record.deleteOne();
  }

  return NextResponse.json({ success: true });
}
