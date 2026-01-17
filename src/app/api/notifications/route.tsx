import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Notification } from "@/lib/models/Notification";
import User from "@/lib/models/User";
import { isBlocked } from "@/lib/helpers/isBlocked";

/* ======================================================
   POST → Create notification
====================================================== */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      user,            // receiver userId (string or ObjectId)
      sender,          // sender userId
      type,
      postId,
      message,
      deleteAfterSeconds,
    } = await req.json();

    /* ---------- Validation ---------- */
    if (!user || !sender || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const receiverId = user.toString();
    const senderId = sender.toString();

    /* ---------- Block Check (GLOBAL) ---------- */
    if (await isBlocked(senderId, receiverId)) {
      return NextResponse.json(
        { message: "Notification skipped (blocked)" },
        { status: 200 }
      );
    }

    /* ---------- Fetch Receiver ---------- */
    const receiver = await User.findById(receiverId)
      .select(
        "notificationLikes notificationComments notificationFollows status"
      )
      .lean();

    // Receiver may be deleted / suspended
    if (!receiver || receiver.status !== "active") {
      return NextResponse.json(
        { message: "Receiver unavailable, notification skipped" },
        { status: 200 }
      );
    }

    /* ---------- Preference Checks ---------- */
    if (type === "like" && receiver.notificationLikes === false) {
      return NextResponse.json(
        { message: "Like notifications disabled" },
        { status: 200 }
      );
    }

    if (type === "comment" && receiver.notificationComments === false) {
      return NextResponse.json(
        { message: "Comment notifications disabled" },
        { status: 200 }
      );
    }

    if (type === "follow" && receiver.notificationFollows === false) {
      return NextResponse.json(
        { message: "Follow notifications disabled" },
        { status: 200 }
      );
    }

    /* ---------- Create Notification ---------- */
    const newNotification = await Notification.create({
      user: receiverId,
      sender: senderId,
      type,
      postId,
      message: message?.slice(0, 100),
      read: false,
      deleteAfterSeconds: deleteAfterSeconds || 60 * 60 * 24 * 10, // 10 days
    });

    return NextResponse.json(newNotification, { status: 201 });
  } catch (err: any) {
    console.error("CREATE_NOTIFICATION_ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

/* ======================================================
   GET → Fetch notifications
====================================================== */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = Number(searchParams.get("limit") || 20);

    if (!userId) {
      return NextResponse.json({ notifications: [] }, { status: 200 });
    }

    const notifications = await Notification.find({ user: userId })
      .populate("sender", "username name image")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const filtered = [];

    for (const n of notifications) {
      if (!n.sender || !n.sender._id) continue;

      const blocked = await isBlocked(
        userId,
        n.sender._id.toString()
      );

      if (!blocked) {
        filtered.push(n);
      }
    }

    return NextResponse.json({ notifications: filtered }, { status: 200 });
  } catch (err) {
    console.error("FETCH_NOTIFICATIONS_ERROR:", err);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}


/* ======================================================
   PATCH → Mark notification(s) as read
====================================================== */
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const { userId, notificationId, markAll } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    if (markAll) {
      await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );

      return NextResponse.json(
        { message: "All notifications marked as read" },
        { status: 200 }
      );
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Missing notificationId" },
        { status: 400 }
      );
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    return NextResponse.json(
      { notification: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("MARK_NOTIFICATION_ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

/* ======================================================
   DELETE → Delete notification(s)
====================================================== */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { userId, notificationId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    if (notificationId) {
      await Notification.deleteOne({
        _id: notificationId,
        user: userId,
      });

      return NextResponse.json(
        { message: "Notification deleted" },
        { status: 200 }
      );
    }

    await Notification.deleteMany({ user: userId });

    return NextResponse.json(
      { message: "All notifications deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE_NOTIFICATION_ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
