import { NextRequest, NextResponse } from 'next/server';
import connectdb from '@/lib/Connect';
import Post, { IPost as PostType } from "@/lib/models/Post";
import mongoose, { Types } from 'mongoose';

interface CreatePostRequest {
  userId: string | Types.ObjectId;
  content?: string;
  mediaUrl?: string;
}

interface PostResponse extends Omit<PostType, 'userId'> {
  userId: {
    _id: Types.ObjectId;
    username?: string;
    email?: string;
    // Add other user fields you populate
  };
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(connectdb);
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    const body: CreatePostRequest = await request.json();
    const { userId, content, mediaUrl } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const post = new Post({ 
      userId, 
      content: content || '', 
      mediaUrl: mediaUrl || '' 
    });
    await post.save();
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

// GET - Fetch all posts
export async function GET(request: NextRequest) {
  try {
    await mongoose.connect(connectdb);
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  try {
    const posts = await Post.find()
      .populate<{ userId: { _id: Types.ObjectId; username?: string; email?: string } }>(
        "userId", 
        "username email"
      )
      .sort({ createdAt: -1 })
      .exec();
    
    return NextResponse.json(posts as PostResponse[]);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}