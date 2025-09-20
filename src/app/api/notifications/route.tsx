// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import { Notification } from "@/lib/models/Notification";

// ----------------------------
// POST → Create notification
// ----------------------------
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { user, sender, type, postId, deleteAfterSeconds } = await req.json();

    if (!user || !sender || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newNotification = await Notification.create({
      user,
      sender,
      type,
      postId,
      read: false,
      deleteAfterSeconds: deleteAfterSeconds || 60 * 60 * 24 * 30, // default 30 days
    });

    return NextResponse.json(newNotification, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create notification:", err);
    return NextResponse.json({ error: err.message || "Failed to create notification" }, { status: 500 });
  }
}

// ----------------------------
// GET → Fetch notifications
// ----------------------------
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = Number(searchParams.get("limit") || 20);

    if (!userId) return NextResponse.json({ notifications: [] }, { status: 200 });

    const notifications = await Notification.find({ user: userId })
      .populate("sender", "name image")
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}

// ----------------------------
// PATCH → Mark single notification as read
// ----------------------------
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { userId, notificationId, markAll } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (markAll) {
      await Notification.updateMany({ user: userId, read: false }, { read: true });
      return NextResponse.json({ message: "All notifications marked as read" }, { status: 200 });
    }

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    return NextResponse.json({ notification: updated }, { status: 200 });
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

// ----------------------------
// DELETE → Delete single or all notifications
// ----------------------------
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { userId, notificationId } = await req.json();

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    if (notificationId) {
      await Notification.deleteOne({ _id: notificationId, user: userId });
      return NextResponse.json({ message: "Notification deleted" }, { status: 200 });
    } else {
      await Notification.deleteMany({ user: userId });
      return NextResponse.json({ message: "All notifications deleted" }, { status: 200 });
    }
  } catch (err) {
    console.error("Failed to delete notifications:", err);
    return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
  }
}
