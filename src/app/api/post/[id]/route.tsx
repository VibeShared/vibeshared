import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/Connect";
import Post from "@/lib/models/Post";
import { Comment } from "@/lib/models/Comment";
import { Like } from "@/lib/models/Likes";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const posts = await Post.find({})
      .populate("userId", "name image email")
      .sort({ createdAt: -1 })
      .lean();

    const postsWithExtras = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "name image")
          .sort({ createdAt: -1 })
          .lean();

        const likes = await Like.find({ postId: post._id }).lean();

        return {
          ...post,
          comments,
          likesCount: likes.length,
        };
      })
    );

    return NextResponse.json({ posts: postsWithExtras });
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // ✅ Check if user is the owner before deleting
    if (post.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this post" },
        { status: 403 }
      );
    }

    // ✅ Delete media from Cloudinary first (if exists)
    if (post.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(post.cloudinary_id);
      } catch (cloudError) {
        console.error("Cloudinary delete error:", cloudError);
        // We can still continue to delete from DB to avoid stale records
      }
    }

    // ✅ Delete from MongoDB
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
