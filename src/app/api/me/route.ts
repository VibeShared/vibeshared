import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";

/* ---------------- GET /api/me ---------------- */
export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;

    /* ---------- 1. Try NextAuth (Web) ---------- */
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    }

    /* ---------- 2. Try Bearer Token (Mobile) ---------- */
    if (!userId) {
      const authHeader = req.headers.get("authorization");

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");

        try {
          const decoded = jwt.verify(
            token,
            process.env.AUTH_SECRET!
          ) as any;

          userId = decoded.id;
        } catch {
          return NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
          );
        }
      }
    }

    /* ---------- 3. No auth ---------- */
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectDB();

    const user = await User.findById(userId)
      .select(
        [
          "_id",
          "name",
          "username",
          "email",
          "image",
          "bio",
          "location",
          "website",

          "isPrivate",
          "commentPermission",

          "notificationLikes",
          "notificationComments",
          "notificationFollows",

          "isVerified",
          "role",
          "status",
        ].join(" ")
      )
      .lean();

    if (!user || user.status === "deleted") {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        ...user,
      },
    });
  } catch (error) {
    console.error("GET_ME_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
