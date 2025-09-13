import { NextResponse, NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== "string") {
      return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
    }

    // 1️⃣ Fetch current user
    await connectDB();
    const user = await User.findById(session.user.id);

    // 2️⃣ Delete previous image from Cloudinary if exists
    if (user?.cloudinary_id) {
      await cloudinary.uploader.destroy(user.cloudinary_id);
    }

    // 3️⃣ Upload new image
    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder: `avatars/${session.user.id}`,
      resource_type: "auto",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    // 4️⃣ Update user in DB with new URL and public_id
    user!.image = uploadResponse.secure_url;
    user!.cloudinary_id = uploadResponse.public_id;
    await user!.save();

    return NextResponse.json({ url: uploadResponse.secure_url, user });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

