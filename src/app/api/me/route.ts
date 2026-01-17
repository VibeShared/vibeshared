import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";

/* ---------------- GET /api/me ---------------- */
export const GET = auth(async (req: NextAuthRequest) => {
  try {
    const session = req.auth;

    if (!session?.user?.id) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
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
      .lean(); // ⚡ performance

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
});
