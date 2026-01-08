import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import { z } from "zod";

/* ------------------ Schema ------------------ */
const ProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(150).optional(),
  image: z.string().url().optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Invalid username")
    .optional(),
});

/* ------------------ PATCH ------------------ */
export const PATCH = auth(async (req) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    /* ---------- Username Handling ---------- */
    if (parsed.data.username) {
      const username = parsed.data.username.toLowerCase();

      if (username !== user.username) {
        // Cooldown: 14 days
        if (user.lastUsernameChange) {
          const diff =
            Date.now() - new Date(user.lastUsernameChange).getTime();
          const cooldown = 14 * 24 * 60 * 60 * 1000;

          if (diff < cooldown) {
            return NextResponse.json(
              { error: "Username can be changed after 14 days" },
              { status: 400 }
            );
          }
        }

        const exists = await User.exists({ username });
        if (exists) {
          return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
          );
        }

        updates.username = username;
        updates.lastUsernameChange = new Date();
      }
    }

    /* ---------- Other Fields ---------- */
    if (parsed.data.name !== undefined)
      updates.name = parsed.data.name;

    if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;

    if (parsed.data.image !== undefined) updates.image = parsed.data.image;

    /* ---------- Update ---------- */
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true }
    ).select("username name bio image");

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
