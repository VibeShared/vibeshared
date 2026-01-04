// src/app/api/post/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import Post, { IPost } from "@/lib/models/Post";
import { Comment, IComment } from "@/lib/models/Comment";
import { Like } from "@/lib/models/Likes";
import User from "@/lib/models/User";
// ✅ Import auth from your config
import { auth } from "@/lib/auth"; 

// ✅ Industry Standard: Use the auth() wrapper for API handlers
export const GET = auth(async (req) => {
  try {
    await connectDB();

    // ✅ In v5, the session is already attached to the request object!
    const loggedInUserId = req.auth?.user?.id;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    const userId = searchParams.get("userId");
    const query: Record<string, any> = {};
    if (userId) query.userId = userId;

    const totalPosts = await Post.countDocuments(query);

    const postsRaw = await Post.find(query)
      .populate("userId", "name image email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const posts = postsRaw as unknown as (IPost & { userId: { name?: string; image?: string; email?: string } })[];

    if (!posts.length) {
      return NextResponse.json({ posts: [], total: totalPosts, hasMore: false, page, limit });
    }

    const postIds = posts.map((p) => p._id.toString());

    // Fetch user likes only if logged in
    let likedPostIds: string[] = [];
    if (loggedInUserId) {
      const likes = await Like.find({ userId: loggedInUserId, postId: { $in: postIds } })
        .select("postId")
        .lean();
      likedPostIds = likes.map((like) => like.postId.toString());
    }

    // Fetch comments
    const commentsRaw = await Comment.find({ postId: { $in: postIds } })
      .populate("userId", "name image")
      .lean();

    const comments = commentsRaw as unknown as (IComment & { userId: { name?: string; image?: string } })[];

    const commentsMap: Record<string, IComment[]> = {};
    comments.forEach((c) => {
      const postId = c.postId.toString();
      if (!commentsMap[postId]) commentsMap[postId] = [];
      commentsMap[postId].push(c);
    });

    const postsWithExtras = posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      likesCount: post.likesCount || 0,
      isLiked: likedPostIds.includes(post._id.toString()),
      comments: commentsMap[post._id.toString()] || [],
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
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}) as any; // Cast as any if TS complains about the auth wrapper signature in Route Handlers





export const POST = auth(async (req: any) => {
  try {
    const session = req.auth;
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, mediaUrl, cloudinary_id } = await req.json();

    if (!content && !mediaUrl) {
      return NextResponse.json({ error: "Post cannot be empty" }, { status: 400 });
    }

    await connectDB();

    // Verify user status one last time
    const user = await User.findById(session.user.id).select("status");
    if (user?.status !== "active") {
      return NextResponse.json({ error: "Account restricted" }, { status: 403 });
    }

    // Create the post
    const post = await Post.create({
      userId: session.user.id,
      content: content?.trim(),
      mediaUrl: mediaUrl || "",
      cloudinary_id: cloudinary_id || null,
      likesCount: 0,
    });

    return NextResponse.json({
      message: "Post created successfully",
      post,
    }, { status: 201 });

  } catch (error) {
    console.error("Post Creation Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}) as any;