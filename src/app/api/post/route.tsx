// app/api/post/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/Connect';
import Post, {IPost} from "@/lib/models/Post";
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authoptions';
import { z } from 'zod';
import { Like, ILike } from '@/lib/models/Likes';
import { Comment, IComment } from '@/lib/models/Comment';
import mongoose from 'mongoose';


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
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    const userId = searchParams.get("userId");
    const query: Record<string, any> = {};
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    const totalPosts = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .populate("userId", "name image email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!posts.length) {
      return NextResponse.json({
        posts: [],
        total: totalPosts,
        hasMore: false,
        page,
        limit,
      });
    }

    const postIds = posts.map((p) => p._id);

    // Bulk fetch likes & comments
    const [likesData, commentsData] = await Promise.all([
      Like.aggregate([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: "$postId", count: { $sum: 1 } } },
      ]),
      Comment.find({ postId: { $in: postIds } })
        .populate("userId", "name image")
        .lean(),
    ]);

    const likesMap: Record<string, number> = {};
    likesData.forEach((like) => {
      likesMap[like._id.toString()] = like.count;
    });

    const commentsMap: Record<string, any[]> = {};
    commentsData.forEach((comment) => {
      const postId = comment.postId.toString();
      if (!commentsMap[postId]) {
        commentsMap[postId] = [];
      }
      commentsMap[postId].push(comment);
    });

   const postsWithExtras = posts.map((post) => ({
  ...post,
  _id: (post._id as mongoose.Types.ObjectId).toString(),
  likesCount: likesMap[(post._id as mongoose.Types.ObjectId).toString()] || 0,
  comments: commentsMap[(post._id as mongoose.Types.ObjectId).toString()] || [],
}));

    return NextResponse.json({
      page,
      limit,
      total: totalPosts,
      hasMore: skip + posts.length < totalPosts,
      posts: postsWithExtras,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" }, 
      { status: 500 }
    );
  }
}




