import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { auth } from "@/lib/auth";
import BlockedUser from "@/lib/models/BlockedUser";
import { z } from "zod";
import mongoose from "mongoose";

/* ---------------- Schema ---------------- */
const BlockSchema = z.object({
  userId: z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id),
    { message: "Invalid userId" }
  ),
});

/* ---------------- POST → Block ---------------- */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = BlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot block yourself" },
        { status: 400 }
      );
    }

    await connectDB();

    await BlockedUser.create({
      blocker: session.user.id,
      blocked: parsed.data.userId,
    });

    return NextResponse.json({ message: "User blocked successfully" });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "User already blocked" },
        { status: 409 }
      );
    }

    console.error("BLOCK_USER_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ---------------- DELETE → Unblock ---------------- */
export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = BlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    await BlockedUser.findOneAndDelete({
      blocker: session.user.id,
      blocked: parsed.data.userId,
    });

    return NextResponse.json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("UNBLOCK_USER_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ---------------- GET → List Blocked Users ---------------- */
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const blockedUsers = await BlockedUser.find({
      blocker: session.user.id,
    })
      .populate("blocked", "username name image")
      .sort({ createdAt: -1 });

    return NextResponse.json({ blockedUsers });
  } catch (error) {
    console.error("LIST_BLOCKED_USERS_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
