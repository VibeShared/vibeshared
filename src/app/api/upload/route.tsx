import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body; // base64 file
    
    if (!data || typeof data !== 'string') {
      return NextResponse.json(
        { error: "Invalid file data" },
        { status: 400 }
      );
    }

    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder: "social_app",
      resource_type: "auto", // handles image/video
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed, or let them return 405 automatically
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}