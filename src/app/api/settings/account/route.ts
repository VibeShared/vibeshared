import { NextResponse } from "next/server";
import { NextAuthRequest } from "next-auth";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";

/* ---------------- DELETE (Soft Delete) ---------------- */
export const DELETE = auth(async (req: NextAuthRequest) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status === "deleted") {
      return NextResponse.json(
        { error: "Account already deleted" },
        { status: 400 }
      );
    }

    user.status = "deleted";

    // Invalidate auth
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;

    await user.save();

    return NextResponse.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("ACCOUNT_DELETE_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
