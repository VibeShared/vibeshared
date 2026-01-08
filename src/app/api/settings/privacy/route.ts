import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import { z } from "zod";

/* ---------------- Schema ---------------- */
const PrivacySchema = z.object({
  isPrivate: z.boolean().optional(),
  commentPermission: z.enum(["everyone", "followers"]).optional(),
});

/* ---------------- PATCH ---------------- */
export const PATCH = auth(async (req) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PrivacySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const updates: Record<string, any> = {};

    if (parsed.data.isPrivate !== undefined) {
      updates.isPrivate = parsed.data.isPrivate;
    }

    if (parsed.data.commentPermission !== undefined) {
      updates.commentPermission = parsed.data.commentPermission;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid privacy fields provided" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true }
    ).select("isPrivate commentPermission");

    return NextResponse.json({
      message: "Privacy settings updated successfully",
      settings: user,
    });
  } catch (error) {
    console.error("SETTINGS_PRIVACY_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
