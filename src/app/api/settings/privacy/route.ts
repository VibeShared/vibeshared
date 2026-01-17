import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import { z } from "zod";

/* ---------------- Schema ---------------- */
const PrivacySchema = z.object({
  isPrivate: z.boolean().optional(),
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

    if (parsed.data.isPrivate === undefined) {
      return NextResponse.json(
        { error: "No valid privacy fields provided" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { isPrivate: parsed.data.isPrivate } },
      { new: true }
    ).select("isPrivate");

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
