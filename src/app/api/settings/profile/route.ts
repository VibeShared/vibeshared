import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import { z } from "zod";

/* ------------------ Schema ------------------ */
const ProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(200).optional(),

  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\//.test(val),
      "Website must start with http:// or https://"
    ),
    

  image: z.string().url().optional(),

  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Invalid username")
    .optional(),
});
let usernameError: string | null = null;


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
    if (user.lastUsernameChange) {
      const diff =
        Date.now() - new Date(user.lastUsernameChange).getTime();
      const cooldown = 14 * 24 * 60 * 60 * 1000;

      if (diff < cooldown) {
        usernameError = "Username can be changed after 14 days";
      } else {
        const exists = await User.exists({ username });
        if (exists) {
          usernameError = "Username already taken";
        } else {
          updates.username = username;
          updates.lastUsernameChange = new Date();
        }
      }
    } else {
      const exists = await User.exists({ username });
      if (exists) {
        usernameError = "Username already taken";
      } else {
        updates.username = username;
        updates.lastUsernameChange = new Date();
      }
    }
  }
}


    /* ---------- Other Fields ---------- */
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
if (parsed.data.location !== undefined)
  updates.location = parsed.data.location;
if (parsed.data.website !== undefined)
  updates.website = parsed.data.website;
if (parsed.data.image !== undefined)
  updates.image = parsed.data.image;



if (Object.keys(updates).length === 0) {
  return NextResponse.json(
    { message: "No changes applied", usernameError },
    { status: 200 }
  );
}


    /* ---------- Update ---------- */
    const updatedUser = await User.findByIdAndUpdate(
  user._id,
  { $set: updates },
  { new: true }
).select("username name bio image location website");

return NextResponse.json(
  {
    message: "Profile updated",
    user: updatedUser,
    usernameError,
  },
  { status: 200 }
);

  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
