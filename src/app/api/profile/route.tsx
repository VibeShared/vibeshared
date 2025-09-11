import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/Connect";
import { Profile, IProfile } from "@/lib/models/Profile";
import { mongo, Types } from "mongoose";
import mongoose from "mongoose";

// Type definitions
interface CreateProfileRequest {
  userId: string;
  username: string;
  bio?: string;
  avatar?: string;
}

interface ErrorResponse {
  error: string;
}

// POST → Create or update profile
export async function POST(req: NextRequest): Promise<NextResponse<IProfile | ErrorResponse>> {
  try {
    await connectDB();
    const body: CreateProfileRequest = await req.json();

    const { userId, username, bio, avatar } = body;

    if (!userId || !username) {
      return NextResponse.json(
        { error: "User ID and username are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid User ID format" },
        { status: 400 }
      );
    }

    // Validate username
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 3 and 30 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    // Check if username is taken by another user
    const existingProfileWithUsername = await Profile.findOne({
      username: username.toLowerCase(),
      userId: { $ne: new Types.ObjectId(userId) }
    });

    if (existingProfileWithUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { 
        username: username.toLowerCase(), 
        bio: bio?.trim(), 
        avatar 
      },
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    ).populate("userId", "name email");

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.error("Profile create/update error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create/update profile" },
      { status: 500 }
    );
  }
}

// GET → Fetch profile by username or userId
export async function GET(req: NextRequest): Promise<NextResponse<IProfile | ErrorResponse>> {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const userId = searchParams.get("userId");

    if (!username && !userId) {
      return NextResponse.json(
        { error: "Username or User ID is required" },
        { status: 400 }
      );
    }

    let query = {};
    if (username) {
      query = { username: username.toLowerCase() };
    } else if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { error: "Invalid User ID format" },
          { status: 400 }
        );
      }
      query = { userId: new Types.ObjectId(userId) };
    }

    const profile = await Profile.findOne(query).populate("userId", "name email image");
    
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// DELETE → Delete profile
export async function DELETE(req: NextRequest): Promise<NextResponse<{ message: string } | ErrorResponse>> {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid User ID format" },
        { status: 400 }
      );
    }

    const result = await Profile.findOneAndDelete({ 
      userId: new Types.ObjectId(userId) 
    });

    if (!result) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Profile deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete profile error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}