// src/app/post/[postId]/page.tsx

import { auth } from "@/lib/auth";
import UserPostsList from "@/components/post/UserPostsList";
import { headers } from "next/headers";
import type { Metadata } from "next";
import mongoose from "mongoose";

/* ================= METADATA (PUBLIC / BOT SAFE) ================= */

export async function generateMetadata(
  { params }: { params: Promise<{ postId: string }> }
): Promise<Metadata> {

  const { postId } = await params;

  // 🔒 Hard guard (prevents crawler + Mongo crashes)
  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return {
      title: "Post not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = process.env.NEXTAUTH_URL!;
  const res = await fetch(
    `${baseUrl}/api/post/public/${postId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      title: "Post not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const post = await res.json();

  const imageUrl = post.mediaUrl
    ? post.mediaUrl.startsWith("http")
      ? post.mediaUrl
      : `${baseUrl}${post.mediaUrl}`
    : null;

  return {
    title: `${post.user.name} (@${post.user.username})`,
    description: post.content?.slice(0, 150),

    openGraph: {
      type: "article",
      title: `${post.user.name} (@${post.user.username})`,
      description: post.content?.slice(0, 150),
      url: `${baseUrl}/${post.user.username}/post/${post._id}`,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.content?.slice(0, 100),
            },
          ]
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

/* ================= PAGE DATA FETCH (AUTH REQUIRED) ================= */

async function getFeedFromPost(postId: string) {
  // 🔒 Safety guard
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return null;
  }

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

/* ================= PAGE COMPONENT ================= */

export default async function PostFeedPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return <p className="text-center py-4">Invalid post</p>;
  }

  const [session, data] = await Promise.all([
    auth(),
    getFeedFromPost(postId),
  ]);

  if (!data?.posts?.length) {
    return <p className="text-center py-4">Post not found</p>;
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <UserPostsList
            posts={data.posts}
            currentUserId={session?.user?.id ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
