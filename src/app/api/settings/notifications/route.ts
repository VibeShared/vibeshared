import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import { z } from "zod";

/* ---------------- Schema ---------------- */
const NotificationSchema = z.object({
  notificationLikes: z.boolean().optional(),
  notificationComments: z.boolean().optional(),
  notificationFollows: z.boolean().optional(),
});

/* ---------------- PATCH ---------------- */
export const PATCH = auth(async (req) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = NotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const updates: Record<string, boolean> = {};

    if (parsed.data.notificationLikes !== undefined) {
      updates.notificationLikes = parsed.data.notificationLikes;
    }

    if (parsed.data.notificationComments !== undefined) {
      updates.notificationComments = parsed.data.notificationComments;
    }

    if (parsed.data.notificationFollows !== undefined) {
      updates.notificationFollows = parsed.data.notificationFollows;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid notification fields provided" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true }
    ).select(
      "notificationLikes notificationComments notificationFollows"
    );

    return NextResponse.json({
      message: "Notification settings updated successfully",
      settings: user,
    });
  } catch (error) {
    console.error("SETTINGS_NOTIFICATIONS_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
