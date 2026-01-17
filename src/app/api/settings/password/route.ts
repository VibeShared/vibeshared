import { NextResponse } from "next/server";
import { NextAuthRequest } from "next-auth";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

/* ---------------- Schema ---------------- */
const PasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});

/* ---------------- PATCH ---------------- */
export const PATCH = auth(async (req: NextAuthRequest) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("+password");
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User password not found" },
        { status: 404 }
      );
    }

    /* ---------- Verify current password ---------- */
    const isMatch = await bcrypt.compare(
      parsed.data.currentPassword,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    /* ---------- Prevent reuse ---------- */
    const samePassword = await bcrypt.compare(
      parsed.data.newPassword,
      user.password
    );

    if (samePassword) {
      return NextResponse.json(
        { error: "New password must be different" },
        { status: 400 }
      );
    }

    /* ---------- Hash & update ---------- */
    const hashed = await bcrypt.hash(parsed.data.newPassword, 12);

    user.password = hashed;

    // Optional: invalidate refresh tokens
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;

    await user.save();

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("SETTINGS_PASSWORD_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
