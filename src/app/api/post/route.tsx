import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Post from "@/lib/models/Post";
import { Comment } from "@/lib/models/Comment";
import { Like } from "@/lib/models/Likes";
import User from "@/lib/models/User";
import { Follower } from "@/lib/models/Follower";
import { auth } from "@/lib/auth";
import { canViewFullProfile } from "@/lib/helpers/privacyGuard";
import mongoose from "mongoose";
import BlockedUser from "@/lib/models/BlockedUser";

/* ============================================================
   GET → Fetch Posts
============================================================ */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const viewerId = session?.user?.id || null;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const startPostId = searchParams.get("startPostId");
    const userId = searchParams.get("userId");

    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const isCursorMode = Boolean(startPostId);

    let query: Record<string, any> = {};

    /* =====================================================
       STEP 1 — Blocked users
    ===================================================== */
    const blockedUserIds = new Set<string>();

    if (viewerId) {
      const blocks = await BlockedUser.find({
        $or: [{ blocker: viewerId }, { blocked: viewerId }],
      })
        .select("blocker blocked")
        .lean();

      for (const b of blocks) {
        if (b.blocker.toString() !== viewerId)
          blockedUserIds.add(b.blocker.toString());
        if (b.blocked.toString() !== viewerId)
          blockedUserIds.add(b.blocked.toString());
      }
    }

    /* =====================================================
       STEP 2 — Cursor pagination
    ===================================================== */
    if (startPostId) {
      const cursorPost = await Post.findById(startPostId).select("createdAt");
      if (!cursorPost) {
        return NextResponse.json(
          { error: "Start post not found" },
          { status: 404 }
        );
      }
      query.createdAt = { $lte: cursorPost.createdAt };
    }

    /* =====================================================
       STEP 3 — User-specific feed
    ===================================================== */
    if (userId) {
      if (blockedUserIds.has(userId)) {
        return NextResponse.json({ posts: [], hasMore: false });
      }

      const allowed = await canViewFullProfile(viewerId, userId);
      if (!allowed) {
        return NextResponse.json({ posts: [], hasMore: false });
      }

      query.userId = userId;
    }

    /* =====================================================
       STEP 4 — Global feed
    ===================================================== */
    if (!userId) {
      if (!viewerId) {
        const publicUsers = await User.find({ isPrivate: false })
          .select("_id")
          .lean();

        query.userId = {
          $in: publicUsers
            .map((u) => u._id)
            .filter((id) => !blockedUserIds.has(id.toString())),
        };
      } else {
        const publicUsers = await User.find({ isPrivate: false })
          .select("_id")
          .lean();

        const approvedFollows = await Follower.find({
          follower: viewerId,
          status: "approved",
        }).select("following");

        const allowedIds = [
          viewerId,
          ...publicUsers.map((u) => u._id),
          ...approvedFollows.map((f) => f.following),
        ];

        const uniqueAllowed = Array.from(
          new Map(
            allowedIds.map((id) => [
              id.toString(),
              new mongoose.Types.ObjectId(id),
            ])
          ).values()
        );

        query.userId = {
          $in: uniqueAllowed.filter(
            (id) => !blockedUserIds.has(id.toString())
          ),
        };
      }
    }

    /* =====================================================
       STEP 5 — Fetch posts
    ===================================================== */
    const postsRaw = await Post.find(query)
      .populate("userId", "username name image")
      .sort({ createdAt: -1 })
      .skip(isCursorMode ? 0 : (page - 1) * limit)
      .limit(limit)
      .lean();

    if (!postsRaw.length) {
      return NextResponse.json({ posts: [], hasMore: false });
    }

    const postIds = postsRaw.map((p) => p._id.toString());

    /* =====================================================
       STEP 6 — Likes
    ===================================================== */
    let likedPostIds: string[] = [];
    if (viewerId) {
      const likes = await Like.find({
        userId: viewerId,
        postId: { $in: postIds },
      })
        .select("postId")
        .lean();

      likedPostIds = likes.map((l) => l.postId.toString());
    }

    /* =====================================================
       STEP 7 — Comments
    ===================================================== */
    const commentsRaw = await Comment.find({
      postId: { $in: postIds },
    })
      .populate("userId", "name image")
      .lean();

    const commentsMap: Record<string, any[]> = {};
    for (const c of commentsRaw) {
      const pid = c.postId.toString();
      if (!commentsMap[pid]) commentsMap[pid] = [];
      commentsMap[pid].push(c);
    }

    /* =====================================================
       STEP 8 — Merge
    ===================================================== */
    const postsWithExtras = postsRaw.map((post) => ({
      ...post,
      _id: post._id.toString(),
      isLiked: likedPostIds.includes(post._id.toString()),
      comments: commentsMap[post._id.toString()] || [],
    }));

    return NextResponse.json({
      posts: postsWithExtras,
      hasMore: postsRaw.length === limit,
      page: isCursorMode ? null : page,
    });
  } catch (error) {
    console.error("FETCH_POST_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST → Create Post
============================================================ */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, mediaUrl, cloudinary_id } = await req.json();

    if (!content && !mediaUrl) {
      return NextResponse.json(
        { error: "Post cannot be empty" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("status");
    if (user?.status !== "active") {
      return NextResponse.json(
        { error: "Account restricted" },
        { status: 403 }
      );
    }

    const post = await Post.create({
      userId: session.user.id,
      content: content?.trim(),
      mediaUrl: mediaUrl || "",
      cloudinary_id: cloudinary_id || null,
      likesCount: 0,
    });

    return NextResponse.json(
      { message: "Post created successfully", post },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST_CREATE_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
