// src/app/post/[postId]/page.tsx
import { auth } from "@/lib/auth";
import UserPostsList from "@/components/post/UserPostsList";
import { headers } from "next/headers";


async function getFeedFromPost(postId: string) {
  if (!postId) return null;

  const baseUrl = process.env.NEXTAUTH_URL;
  if (!baseUrl) {
    throw new Error("NEXTAUTH_URL is not defined");
  }


    const h = await headers();

  const res = await fetch(
    `${baseUrl}/api/post/from/${postId}`,
    {
      cache: "no-store",
      headers: {
        cookie: h.get("cookie") ?? "", // 🔥 THIS IS THE FIX
      },
    }
  );

  if (!res.ok) return null;
  return res.json();
}


export default async function PostFeedPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params; // ✅ REQUIRED in Next 15

  if (!postId) {
    return <p className="text-center py-4">Invalid post id</p>;
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
