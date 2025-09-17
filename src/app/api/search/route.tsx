// app/api/user/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ users: [] });
    }

    // Case-insensitive search by name
    const users = await User.find({
      name: { $regex: query, $options: "i" },
    })
      .select("name image email") // return only needed fields
      .limit(10)
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
