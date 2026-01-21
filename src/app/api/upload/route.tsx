export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/models/User";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only images allowed" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "Empty file" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("username status")
      .lean();

    if (!user || user.status !== "active") {
      return NextResponse.json(
        { error: "User restricted" },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<any>((resolve, reject) => {
  cloudinary.uploader
    .upload_stream(
      {
        folder: `vibe_app/users/${user._id}/posts`,
        resource_type: "image",
        transformation: [{ width: 1080, quality: "auto" }],
      },
      (err, res) => {
        if (err) reject(err);
        else resolve(res);
      }
    )
    .end(buffer);
});

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("CLOUDINARY_UPLOAD_ERROR:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
