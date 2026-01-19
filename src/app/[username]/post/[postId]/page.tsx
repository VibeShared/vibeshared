import type { Metadata } from "next";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

/* ================= METADATA (SOCIAL SHARE) ================= */

export async function generateMetadata(
  { params }: { params: Promise<{ username: string; postId: string }> }
): Promise<Metadata> {
  const { username, postId } = await params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return { title: "Post not found", robots: { index: false } };
  }

  const baseUrl = process.env.NEXTAUTH_URL!;
  const res = await fetch(
    `${baseUrl}/api/post/public/${postId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return { title: "Post not found", robots: { index: false } };
  }

  const post = await res.json();

  // 🔒 Username ownership check
  if (post.user.username !== username) {
    return { title: "Post not found", robots: { index: false } };
  }

  const imageUrl = post.mediaUrl
    ? post.mediaUrl.startsWith("http")
      ? post.mediaUrl
      : `${baseUrl}${post.mediaUrl}`
    : null;

  return {
    title: `${post.user.name} (@${post.user.username})`,
    description: post.content?.slice(0, 150),

    alternates: {
      canonical: `${baseUrl}/${username}/post/${postId}`,
    },

    openGraph: {
      type: "article",
      title: `${post.user.name} (@${post.user.username})`,
      description: post.content?.slice(0, 150),
      url: `${baseUrl}/${username}/post/${postId}`,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630 }]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: `${post.user.name} (@${post.user.username})`,
      description: post.content?.slice(0, 150),
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

/* ================= PAGE ================= */

export default async function PublicPostPage({
  params,
}: {
  params: Promise<{ username: string; postId: string }>;
}) {
  const { username, postId } = await params;

  if (!mongoose.Types.ObjectId.isValid(postId)) notFound();

  const baseUrl = process.env.NEXTAUTH_URL!;
  const res = await fetch(
    `${baseUrl}/api/post/public/${postId}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const post = await res.json();

  if (post.user.username !== username) notFound();

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <h5 className="mb-2">
            {post.user.name}{" "}
            <span className="text-muted">@{post.user.username}</span>
          </h5>

          {post.mediaUrl && (
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="img-fluid rounded mb-3"
            />
          )}

          {post.content && <p>{post.content}</p>}
        </div>
      </div>
    </div>
  );
}
