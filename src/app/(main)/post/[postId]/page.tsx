import { auth } from "@/lib/auth";
import UserPostsList from "@/components/post/UserPostsList";
import { headers } from "next/headers";
import mongoose from "mongoose";
import { redirect } from "next/navigation";

/* ================= HELPERS ================= */

async function getPublicPost(postId: string) {
  const baseUrl = process.env.NEXTAUTH_URL!;
  const res = await fetch(`${baseUrl}/api/post/public/${postId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getFeedFromPost(postId: string) {
  if (!mongoose.Types.ObjectId.isValid(postId)) return null;

  const baseUrl = process.env.NEXTAUTH_URL!;
  const h = await headers();

  const res = await fetch(
    `${baseUrl}/api/post/from/${postId}`,
    {
      cache: "no-store",
      headers: {
        cookie: h.get("cookie") ?? "",
      },
    }
  );

  if (!res.ok) return null;
  return res.json();
}

/* ================= PAGE ================= */

export default async function PostFeedPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return <p className="text-center py-4">Invalid post</p>;
  }

  const session = await auth();
  const publicPost = await getPublicPost(postId);

  if (!publicPost) {
    return <p className="text-center py-4">Post not found</p>;
  }

  /**
   * 🔑 CORE RULE
   * Guest / crawler → redirect to public page
   * Logged-in user → run original app logic
   */
  if (!session) {
    redirect(`/${publicPost.user.username}/post/${postId}`);
  }

  // ✅ ORIGINAL LOGIC (UNCHANGED)
  const data = await getFeedFromPost(postId);

  if (!data?.posts?.length) {
    return <p className="text-center py-4">Post not found</p>;
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <UserPostsList
            posts={data.posts}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}
