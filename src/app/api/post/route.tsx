// app/api/post/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/Connect';
import Post from "@/lib/models/Post";
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { Like } from '@/lib/models/Likes';
import { Comment } from '@/lib/models/Comment';


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Zod schema
const CreatePostSchema = z.object({
  content: z.string().optional(),
  media: z.string().optional(), // Base64 or file URL
  mediaType: z.enum(['image', 'video']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validation = CreatePostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content, media, mediaType } = validation.data;
    const userId = session.user.id;
    let mediaUrl = '';
    let cloudinaryId = '';

    // ✅ Upload to Cloudinary if media exists
    if (media && mediaType) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(media, {
          folder: `users/${userId}`, // 👈 same root folder as avatars but under posts
          resource_type: mediaType,
        });
        mediaUrl = uploadResponse.secure_url;
        cloudinaryId = uploadResponse.public_id;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
      }
    }

    // ✅ Create new post
    const post = new Post({ 
      userId, 
      content: content || '', 
      mediaUrl, 
      cloudinary_id: cloudinaryId // optional but good for future delete
    });

    await post.save();
    await post.populate('userId', 'username email name');

    return NextResponse.json(post, { status: 201 });

  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();

    // Fetch posts
    const posts = await Post.find({})
      .populate("userId", "name image email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // ✅ Add likesCount and comments to each post
    const postsWithExtras = await Promise.all(
      posts.map(async (post) => {
        const [likes, comments] = await Promise.all([
          Like.countDocuments({ postId: post._id }),
          Comment.find({ postId: post._id }).lean()
        ]);

        return {
          ...post,
          likesCount: likes,
          comments,
        };
      })
    );

    return NextResponse.json({
      posts: postsWithExtras,
      total: totalPosts,
      hasMore: skip + posts.length < totalPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // ✅ Delete Cloudinary media if exists
    if (post.cloudinary_id) {
      await cloudinary.uploader.destroy(post.cloudinary_id);
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}


