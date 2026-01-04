import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/Connect";
import User from "@/lib/models/User";
import cloudinary from "@/lib/cloudinary";

export const POST = auth(async (req: any) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // 2. Validate User & DB
    await connectDB();
    const user = await User.findById(session.user.id).select("username status");
    if (!user || user.status !== "active") {
        return NextResponse.json({ error: "User restricted or not found" }, { status: 403 });
    }

    // 3. Convert File to Buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Cloudinary using a Promise (Modern approach)
    const uploadResponse: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `vibe_app/users/${user.username}/posts`,
          resource_type: "image",
          transformation: [{ width: 1080, quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}) as any;