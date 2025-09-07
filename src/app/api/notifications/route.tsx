import { NextRequest, NextResponse } from "next/server";
import  connectdb  from "@/lib/Connect";
import { Notification } from "@/lib/models/Notification";
import mongoose from "mongoose";

// POST → Create a notification
export async function POST(req: NextRequest) {
  try {
    await mongoose.connect(connectdb);
    const { user, sender, type, postId } = await req.json();

    if (!user || !sender || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const notification = await Notification.create({ user, sender, type, postId });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

// GET → Fetch notifications for a user
export async function GET(req: NextRequest) {
  try {
    await mongoose.connect(connectdb);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const notifications = await Notification.find({ user: userId })
      .populate("sender", "name email image")
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PATCH → Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    await mongoose.connect(connectdb);
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });

    return NextResponse.json({ message: "Notifications marked as read" }, { status: 200 });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
